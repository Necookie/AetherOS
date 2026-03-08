import { APP_MANIFEST } from '../../../config/appManifest'

const PINNED_ORDER = ['appstore', 'browser', 'explorer', 'term', 'taskmgr', 'settings'] as const

const orderLookup = new Map<string, number>(PINNED_ORDER.map((id, index) => [id, index]))

export const PINNED_APP_IDS = [...PINNED_ORDER]

export const SHELL_APPS = [...APP_MANIFEST].sort((left, right) => {
    const leftOrder = orderLookup.get(left.id) ?? Number.MAX_SAFE_INTEGER
    const rightOrder = orderLookup.get(right.id) ?? Number.MAX_SAFE_INTEGER
    return leftOrder - rightOrder
})

export function filterShellApps(query: string) {
    const normalizedQuery = query.trim().toLowerCase()
    if (!normalizedQuery) {
        return SHELL_APPS
    }

    return SHELL_APPS.filter((app) => app.title.toLowerCase().includes(normalizedQuery) || app.id.includes(normalizedQuery))
}
