import { describe, expect, it } from 'vitest'
import { APP_REGISTRY_CATALOG } from './catalog'
import { validateDependencies, validateRemoval } from './dependencyValidator'
import type { InstalledApp } from './types'

const catalog = new Map(APP_REGISTRY_CATALOG.map((app) => [app.id, app]))

function installed(entries: Array<{ id: string; version: string }>): Record<string, InstalledApp> {
    return entries.reduce<Record<string, InstalledApp>>((acc, entry) => {
        acc[entry.id] = {
            id: entry.id,
            version: entry.version,
            installedAt: new Date(0).toISOString(),
            source: 'store',
        }
        return acc
    }, {})
}

describe('dependencyValidator', () => {
    it('reports missing dependencies for install', () => {
        const mail = catalog.get('mail')
        if (!mail) {
            throw new Error('mail metadata missing in test catalog')
        }

        const issues = validateDependencies({
            app: mail,
            version: '2.1.0',
            installed: installed([{ id: 'browser', version: '1.3.0' }]),
            catalog,
        })

        expect(issues).toHaveLength(1)
        expect(issues[0]?.type).toBe('missing')
        expect(issues[0]?.appId).toBe('notes')
    })

    it('reports incompatible dependency versions', () => {
        const devtools = catalog.get('devtools')
        if (!devtools) {
            throw new Error('devtools metadata missing in test catalog')
        }

        const issues = validateDependencies({
            app: devtools,
            version: '0.9.0',
            installed: installed([
                { id: 'term', version: '1.1.0' },
                { id: 'taskmgr', version: '1.1.0' },
            ]),
            catalog,
        })

        expect(issues).toHaveLength(1)
        expect(issues[0]?.type).toBe('incompatible')
        expect(issues[0]?.appId).toBe('term')
    })

    it('blocks removing packages that active installs depend on', () => {
        const issues = validateRemoval({
            appId: 'notes',
            installed: installed([
                { id: 'notes', version: '1.2.0' },
                { id: 'mail', version: '2.1.0' },
            ]),
            catalog,
        })

        expect(issues).toHaveLength(1)
        expect(issues[0]?.type).toBe('blocked')
        expect(issues[0]?.dependentAppId).toBe('mail')
    })
})
