import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { ShellAppIcon } from './appIcons'
import { APP_ICON_COMPONENTS } from '../components/icons/AppIcons'

describe('ShellAppIcon and AppIcons vector suite', () => {
    const knownApps = [
        'appstore',
        'browser',
        'explorer',
        'term',
        'taskmgr',
        'settings',
        'notes',
        'docs',
        'boards',
        'downloads',
        'os-lab',
        'mail',
        'devtools',
    ]

    it('has vector icon components for all catalogued apps', () => {
        for (const appId of knownApps) {
            expect(APP_ICON_COMPONENTS[appId]).toBeDefined()
        }
    })

    it('renders vector tile icon without crashing for every known app', () => {
        for (const appId of knownApps) {
            const html = renderToStaticMarkup(<ShellAppIcon appId={appId} size="dock" />)
            expect(html).toContain('<svg')
            expect(html).toContain('viewBox="0 0 64 64"')
            expect(html).toContain('rx="14"')
        }
    })

    it('renders fallback generic icon for unknown apps', () => {
        const html = renderToStaticMarkup(<ShellAppIcon appId="some-custom-app-123" size="md" />)
        expect(html).toContain('<svg')
        expect(html).toContain('viewBox="0 0 64 64"')
        expect(html).toContain('aether-appicon-bg-generic')
    })

    it('supports glyph variant for backwards compatibility', () => {
        const html = renderToStaticMarkup(<ShellAppIcon appId="browser" variant="glyph" className="test-glyph" />)
        expect(html).toContain('<svg')
        expect(html).toContain('test-glyph')
    })
})
