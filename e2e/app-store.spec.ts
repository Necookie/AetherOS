import { expect, test, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const APP_SEARCH_PLACEHOLDER = 'Search apps, tools, and capabilities...'

async function signIn(page: Page) {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible({ timeout: 15_000 })
    await page.getByPlaceholder('Enter PIN').fill('0420')
    await page.getByRole('button', { name: 'Sign In', exact: true }).click()
    await expect(page.getByRole('button', { name: 'Open App Store' })).toBeVisible({ timeout: 10_000 })
}

async function openAppStore(page: Page) {
    await page.getByRole('button', { name: 'Open App Store' }).click()
    const appStore = page.getByRole('dialog', { name: 'App Store' })
    await expect(appStore.getByRole('heading', { name: 'Discover and manage apps' })).toBeVisible()
    return appStore
}

async function installAndOpen(page: Page, title: string) {
    const appStore = page.getByRole('dialog', { name: 'App Store' })
    await appStore.getByPlaceholder(APP_SEARCH_PLACEHOLDER).fill(title)
    const card = appStore.locator('article').filter({ hasText: title })
    await expect(card).toHaveCount(1)
    await card.getByRole('button', { name: 'Get' }).click()
    await expect(card.getByRole('button', { name: 'Open' })).toBeVisible({ timeout: 5_000 })
    await card.getByRole('button', { name: 'Open' }).click()

    const dialog = page.getByRole('dialog', { name: title })
    await expect(dialog).toBeVisible()
    return dialog
}

async function closeDialog(dialog: ReturnType<Page['getByRole']>) {
    await dialog.getByRole('button', { name: 'Close window' }).click()
    await expect(dialog).toBeHidden()
}

async function expectNoSeriousAccessibilityIssues(page: Page) {
    const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze()
    const details = results.violations.map((violation) => ({
        id: violation.id,
        impact: violation.impact,
        targets: violation.nodes.map((node) => node.target),
    }))

    expect(results.violations, JSON.stringify(details, null, 2)).toEqual([])
}

test('meets the WCAG smoke baseline on the desktop and store', async ({ page }) => {
    await signIn(page)
    await expectNoSeriousAccessibilityIssues(page)
    await openAppStore(page)
    await expectNoSeriousAccessibilityIssues(page)
})

test('installs and exercises all three store apps', async ({ page }) => {
    const pageErrors: string[] = []
    page.on('pageerror', (error) => pageErrors.push(error.message))

    await signIn(page)
    await openAppStore(page)

    const tetris = await installAndOpen(page, 'Falling Light')
    await expect(tetris.getByLabel('Tetris board')).toBeVisible()
    await expectNoSeriousAccessibilityIssues(page)
    await tetris.getByRole('button', { name: 'Start game' }).click()
    await tetris.getByRole('button', { name: 'Rotate' }).click()
    await tetris.getByRole('button', { name: 'Hard drop' }).click()
    await expect(tetris.getByText('Score', { exact: true })).toBeVisible()
    await closeDialog(tetris)

    const chess = await installAndOpen(page, 'Obsidian Chess')
    await expectNoSeriousAccessibilityIssues(page)
    await chess.getByRole('button', { name: 'e2 white pawn' }).click()
    await chess.getByRole('button', { name: 'e4' }).click()
    await expect(chess.getByText(/black to move/i)).toBeVisible()
    await chess.getByRole('button', { name: 'Flip board' }).click()
    await closeDialog(chess)

    const studio = await installAndOpen(page, 'Aether Studio')
    await expectNoSeriousAccessibilityIssues(page)
    const editor = studio.getByRole('textbox', { name: 'Editing App.tsx' })
    await editor.fill('export default function App() { return <main>Hello</main> }')
    await studio.getByRole('button', { name: 'Run' }).click()
    await expect(studio.getByText('Preview ready on aether://localhost')).toBeVisible({ timeout: 3_000 })
    await closeDialog(studio)

    expect(pageErrors).toEqual([])
})

test('keeps Falling Light usable on a narrow screen', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await signIn(page)
    await openAppStore(page)
    const tetris = await installAndOpen(page, 'Falling Light')
    await tetris.getByRole('button', { name: 'Start game' }).click()

    const topbar = page.getByRole('banner')
    const topbarBounds = await topbar.evaluate((element) => {
        const bounds = element.getBoundingClientRect()
        return { left: bounds.left, right: bounds.right }
    })
    const board = tetris.getByLabel('Tetris board')
    await expect(tetris).toBeInViewport()
    await expect(board).toBeVisible()
    await expect(topbar.getByRole('button', { name: 'Date and time' })).toBeVisible()

    const dialogBounds = await tetris.evaluate((element) => {
        const bounds = element.getBoundingClientRect()
        return { left: bounds.left, right: bounds.right }
    })
    const layout = await page.evaluate(() => ({
        documentWidth: document.documentElement.scrollWidth,
        viewportWidth: window.innerWidth,
    }))

    expect(dialogBounds.left).toBeGreaterThanOrEqual(0)
    expect(dialogBounds.right).toBeLessThanOrEqual(layout.viewportWidth)
    expect(topbarBounds.left).toBeGreaterThanOrEqual(0)
    expect(topbarBounds.right).toBeLessThanOrEqual(layout.viewportWidth)
    expect(layout.documentWidth).toBeLessThanOrEqual(layout.viewportWidth)
    await expect(tetris.getByRole('button', { name: 'Hard drop' })).toBeVisible()
    await expect(tetris.getByRole('button', { name: 'New game' })).toBeVisible()
})
