import type { NotificationDeepLink, SettingsSection, TaskManagerTab } from '../../deep-links/types'
import { SHELL_APPS } from './appCatalog'
import { getLauncherStatusLabel, resolveLauncherStatus, type LauncherStatus } from './launcher'

interface PaletteWindowState {
    state: {
        isMinimized: boolean
    }
}

export type CommandPaletteAction =
    | {
        kind: 'app'
        appId: string
    }
    | {
        kind: 'deep-link'
        link: NotificationDeepLink
    }
    | {
        kind: 'lock-session'
    }

export interface CommandPaletteEntry {
    id: string
    kind: 'app' | 'command'
    title: string
    subtitle: string
    metadata: string
    status?: LauncherStatus
    iconAppId?: string
    action: CommandPaletteAction
}

export interface CommandPaletteMatch extends CommandPaletteEntry {
    score: number
    titleHighlights: number[]
    subtitleHighlights: number[]
}

export interface CommandPaletteExecutor {
    launchApp: (appId: string) => void
    openDeepLink: (link: NotificationDeepLink) => boolean
    lockSession: () => void
}

type InternalEntry = CommandPaletteEntry & {
    priority: number
    aliases: string[]
}

interface CandidateField {
    text: string
    weight: number
    key: 'title' | 'subtitle'
}

interface ScoredField {
    score: number
    positions: number[]
    key: 'title' | 'subtitle'
}

const SETTINGS_COMMANDS: Array<{ section: SettingsSection; label: string; subtitle: string }> = [
    { section: 'appearance', label: 'Appearance settings', subtitle: 'Theme mode, wallpaper, and custom palette' },
    { section: 'desktop', label: 'Desktop settings', subtitle: 'Dock position, icon scale, and accent strength' },
    { section: 'accessibility', label: 'Accessibility settings', subtitle: 'Contrast, density, motion, and keyboard hints' },
    { section: 'behavior', label: 'Behavior settings', subtitle: 'Animation, translucency, and clock preferences' },
    { section: 'shortcuts', label: 'Shortcut settings', subtitle: 'Launcher and window shortcut remapping' },
    { section: 'permissions', label: 'Permission Center', subtitle: 'Review and revoke saved app capabilities' },
]

const TASK_MANAGER_COMMANDS: Array<{ tab: TaskManagerTab; label: string; subtitle: string }> = [
    { tab: 'Processes', label: 'Task Manager processes', subtitle: 'Inspect running apps and process activity' },
    { tab: 'Performance', label: 'Task Manager performance', subtitle: 'CPU, memory, and system performance metrics' },
    { tab: 'Network', label: 'Task Manager network', subtitle: 'Network traffic and simulated connection status' },
]

function buildCommandEntries(): InternalEntry[] {
    const settingsEntries = SETTINGS_COMMANDS.map((item, index) => ({
        id: `command-settings-${item.section}`,
        kind: 'command' as const,
        title: item.label,
        subtitle: item.subtitle,
        metadata: `Settings / ${item.section}`,
        iconAppId: 'settings',
        action: {
            kind: 'deep-link' as const,
            link: {
                kind: 'settings-section' as const,
                section: item.section,
            },
        },
        priority: 30 - index,
        aliases: ['settings', item.section, item.label, item.subtitle],
    }))

    const taskManagerEntries = TASK_MANAGER_COMMANDS.map((item, index) => ({
        id: `command-taskmgr-${item.tab.toLowerCase()}`,
        kind: 'command' as const,
        title: item.label,
        subtitle: item.subtitle,
        metadata: `Task Manager / ${item.tab}`,
        iconAppId: 'taskmgr',
        action: {
            kind: 'deep-link' as const,
            link: {
                kind: 'task-manager' as const,
                tab: item.tab,
            },
        },
        priority: 22 - index,
        aliases: ['task manager', 'taskmgr', item.tab, item.label, item.subtitle],
    }))

    return [
        ...settingsEntries,
        ...taskManagerEntries,
        {
            id: 'command-downloads-open',
            kind: 'command',
            title: 'Open downloads',
            subtitle: 'Jump to Download Manager and active transfer history',
            metadata: 'System / Downloads',
            iconAppId: 'downloads',
            action: {
                kind: 'deep-link',
                link: {
                    kind: 'downloads',
                },
            },
            priority: 20,
            aliases: ['downloads', 'download manager', 'transfer history', 'open downloads'],
        },
        {
            id: 'command-downloads-folder',
            kind: 'command',
            title: 'Reveal Downloads folder',
            subtitle: 'Open File Manager at /home/user/Downloads',
            metadata: 'Files / Downloads',
            iconAppId: 'explorer',
            action: {
                kind: 'deep-link',
                link: {
                    kind: 'file-manager-path',
                    path: '/home/user/Downloads',
                },
            },
            priority: 18,
            aliases: ['downloads folder', 'file manager', 'explorer', '/home/user/Downloads'],
        },
        {
            id: 'command-lock-session',
            kind: 'command',
            title: 'Lock session',
            subtitle: 'Return to the login screen without closing your workspace',
            metadata: 'System / Security',
            iconAppId: 'settings',
            action: {
                kind: 'lock-session',
            },
            priority: 16,
            aliases: ['lock', 'screen lock', 'secure session', 'security'],
        },
    ]
}

const COMMAND_ENTRIES = buildCommandEntries()

function buildAppEntries(windows: Record<string, PaletteWindowState | undefined>): InternalEntry[] {
    return SHELL_APPS.map((app, index) => {
        const status = resolveLauncherStatus(windows[app.id])
        return {
            id: app.id,
            kind: 'app' as const,
            title: app.title,
            subtitle: app.id,
            metadata: `Application / ${getLauncherStatusLabel(status)}`,
            status,
            iconAppId: app.id,
            action: {
                kind: 'app' as const,
                appId: app.id,
            },
            priority: 100 - index,
            aliases: [app.id, app.title, `app ${app.title}`, `launch ${app.title}`, status],
        }
    })
}

function toInternalEntries(windows: Record<string, PaletteWindowState | undefined>): InternalEntry[] {
    return [...buildAppEntries(windows), ...COMMAND_ENTRIES]
}

function isWordStart(text: string, index: number): boolean {
    return index === 0 || text[index - 1] === ' ' || text[index - 1] === '-' || text[index - 1] === '/'
}

function countWordStartMatches(text: string, positions: number[]): number {
    return positions.filter((position) => isWordStart(text, position)).length
}

function findSubsequencePositions(query: string, text: string): number[] | null {
    const positions: number[] = []
    let cursor = 0

    for (const character of query) {
        const position = text.indexOf(character, cursor)
        if (position === -1) {
            return null
        }

        positions.push(position)
        cursor = position + 1
    }

    return positions
}

function scoreTextMatch(query: string, text: string): number[] | null {
    const directIndex = text.indexOf(query)
    if (directIndex >= 0) {
        return Array.from({ length: query.length }, (_, offset) => directIndex + offset)
    }

    return findSubsequencePositions(query, text)
}

function scoreField(query: string, field: CandidateField): ScoredField | null {
    const text = field.text.toLowerCase()
    const positions = scoreTextMatch(query, text)
    if (!positions) {
        return null
    }

    const first = positions[0] ?? 0
    const last = positions[positions.length - 1] ?? first
    const span = last - first + 1
    const gaps = span - positions.length
    const contiguousBonus = text.includes(query) ? 42 : 0
    const prefixBonus = text.startsWith(query) ? 72 : 0
    const wordBonus = isWordStart(text, first) ? 36 : 0
    const acronymBonus = countWordStartMatches(text, positions) * 18
    const compactBonus = Math.max(0, 24 - gaps * 6)
    const lengthBonus = Math.max(0, 18 - Math.max(0, text.length - query.length))

    return {
        key: field.key,
        positions,
        score: field.weight + prefixBonus + wordBonus + acronymBonus + contiguousBonus + compactBonus + lengthBonus - first,
    }
}

function getBestFieldMatch(query: string, entry: InternalEntry): ScoredField | null {
    const fields: CandidateField[] = [
        { text: entry.title, weight: 150, key: 'title' },
        { text: entry.subtitle, weight: 90, key: 'subtitle' },
        { text: entry.metadata, weight: 70, key: 'subtitle' },
        ...entry.aliases.map((text) => ({ text, weight: 65, key: 'subtitle' as const })),
    ]

    return fields
        .map((field) => scoreField(query, field))
        .filter((field): field is ScoredField => field !== null)
        .sort((left, right) => right.score - left.score)[0] ?? null
}

function getTitleHighlights(query: string, entry: InternalEntry, bestMatch: ScoredField): number[] {
    if (bestMatch.key === 'title') {
        return bestMatch.positions
    }

    return scoreTextMatch(query, entry.title.toLowerCase()) ?? []
}

function getSubtitleHighlights(query: string, entry: InternalEntry, bestMatch: ScoredField): number[] {
    if (bestMatch.key === 'subtitle') {
        return bestMatch.positions
    }

    return scoreTextMatch(query, entry.subtitle.toLowerCase()) ?? []
}

function toPublicMatch(entry: InternalEntry, score: number, titleHighlights: number[], subtitleHighlights: number[]): CommandPaletteMatch {
    return {
        id: entry.id,
        kind: entry.kind,
        title: entry.title,
        subtitle: entry.subtitle,
        metadata: entry.metadata,
        status: entry.status,
        iconAppId: entry.iconAppId,
        action: entry.action,
        score,
        titleHighlights,
        subtitleHighlights,
    }
}

export function getCommandPaletteResults(
    query: string,
    windows: Record<string, PaletteWindowState | undefined>,
): CommandPaletteMatch[] {
    const normalizedQuery = query.trim().toLowerCase()
    const entries = toInternalEntries(windows)

    if (!normalizedQuery) {
        return entries
            .sort((left, right) => right.priority - left.priority)
            .map((entry) => toPublicMatch(entry, entry.priority, [], []))
    }

    return entries
        .map((entry) => {
            const bestMatch = getBestFieldMatch(normalizedQuery, entry)
            if (!bestMatch) {
                return null
            }

            return toPublicMatch(
                entry,
                entry.priority + bestMatch.score,
                getTitleHighlights(normalizedQuery, entry, bestMatch),
                getSubtitleHighlights(normalizedQuery, entry, bestMatch),
            )
        })
        .filter((entry): entry is CommandPaletteMatch => entry !== null)
        .sort((left, right) => right.score - left.score)
}

export function getCommandPaletteEmptyMessage(query: string): string {
    if (!query.trim()) {
        return 'No apps or shell actions are available in this profile.'
    }

    return `No apps or commands match "${query.trim()}".`
}

export function getCommandPaletteResultCountLabel(count: number): string {
    return `${count} result${count === 1 ? '' : 's'}`
}

export function getNextCommandPaletteIndex(
    currentIndex: number,
    direction: 1 | -1,
    totalItems: number,
): number {
    if (totalItems <= 0) {
        return -1
    }

    if (currentIndex < 0 || currentIndex >= totalItems) {
        return direction === 1 ? 0 : totalItems - 1
    }

    return (currentIndex + direction + totalItems) % totalItems
}

export function executeCommandPaletteAction(
    action: CommandPaletteAction,
    executor: CommandPaletteExecutor,
): boolean {
    if (action.kind === 'app') {
        executor.launchApp(action.appId)
        return true
    }

    if (action.kind === 'deep-link') {
        return executor.openDeepLink(action.link)
    }

    executor.lockSession()
    return true
}
