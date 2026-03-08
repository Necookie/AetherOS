import { describe, expect, it } from 'vitest'
import { PINNED_APP_IDS, SHELL_APPS, filterShellApps } from './appCatalog'

describe('appCatalog', () => {
    it('keeps pinned apps at the front in dock order', () => {
        expect(SHELL_APPS.slice(0, PINNED_APP_IDS.length).map((app) => app.id)).toEqual(PINNED_APP_IDS)
    })

    it('filters apps by id or title', () => {
        expect(filterShellApps('browser').map((app) => app.id)).toEqual(['browser'])
        expect(filterShellApps('task').map((app) => app.id)).toEqual(['taskmgr'])
    })
})
