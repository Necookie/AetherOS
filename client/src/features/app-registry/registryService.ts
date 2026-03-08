import { APP_REGISTRY_CATALOG, PREINSTALLED_APP_IDS } from './catalog'
import { validateDependencies, validateRemoval } from './dependencyValidator'
import { createAppLifecycleService } from './lifecycle'
import type { AppRelease, InstalledApp, RegistryAppMetadata } from './types'
import { compareSemver, pickLatestVersion } from './versioning'

function findRelease(app: RegistryAppMetadata, version: string): AppRelease | undefined {
    return app.releases.find((release) => release.version === version)
}

function getLatestRelease(app: RegistryAppMetadata): AppRelease | undefined {
    const latestVersion = pickLatestVersion(app.releases.map((release) => release.version))
    if (!latestVersion) {
        return undefined
    }

    return findRelease(app, latestVersion)
}

function pickInitialVersion(app: RegistryAppMetadata): string {
    return getLatestRelease(app)?.version ?? '1.0.0'
}

function createInitialInstalledMap(catalog: RegistryAppMetadata[]): Record<string, InstalledApp> {
    return PREINSTALLED_APP_IDS.reduce<Record<string, InstalledApp>>((acc, appId) => {
        const app = catalog.find((item) => item.id === appId)
        if (!app) {
            return acc
        }

        acc[app.id] = {
            id: app.id,
            version: pickInitialVersion(app),
            installedAt: new Date(0).toISOString(),
            source: 'system',
        }

        return acc
    }, {})
}

export function createAppRegistryService(catalog = APP_REGISTRY_CATALOG) {
    const catalogMap = new Map(catalog.map((app) => [app.id, app]))
    const lifecycle = createAppLifecycleService()
    const initialInstalled = createInitialInstalledMap(catalog)

    const listAvailable = () => [...catalog].sort((left, right) => left.title.localeCompare(right.title))

    const getMetadata = (appId: string) => catalogMap.get(appId)

    const getLatestVersion = (appId: string) => {
        const app = getMetadata(appId)
        if (!app) {
            return null
        }

        return getLatestRelease(app)?.version ?? null
    }

    const canLaunch = (appId: string, installed: Record<string, InstalledApp>) => {
        const app = getMetadata(appId)
        return Boolean(app?.launchable && installed[appId])
    }

    const getInstallValidation = (appId: string, version: string, installed: Record<string, InstalledApp>) => {
        const app = getMetadata(appId)
        if (!app) {
            return [{
                type: 'missing' as const,
                appId,
                message: `Unknown app: ${appId}`,
            }]
        }

        return validateDependencies({ app, version, installed, catalog: catalogMap })
    }

    const getRemovalValidation = (appId: string, installed: Record<string, InstalledApp>) => validateRemoval({
        appId,
        installed,
        catalog: catalogMap,
    })

    const getUpdateCandidates = (installed: Record<string, InstalledApp>) => {
        return Object.values(installed)
            .map((item) => {
                const app = getMetadata(item.id)
                if (!app) {
                    return null
                }

                const latest = getLatestRelease(app)
                if (!latest || compareSemver(latest.version, item.version) <= 0) {
                    return null
                }

                return {
                    appId: item.id,
                    fromVersion: item.version,
                    toVersion: latest.version,
                }
            })
            .filter((candidate): candidate is { appId: string; fromVersion: string; toVersion: string } => Boolean(candidate))
    }

    return {
        listAvailable,
        getMetadata,
        getLatestVersion,
        canLaunch,
        getInstallValidation,
        getRemovalValidation,
        getUpdateCandidates,
        initialInstalled,
        lifecycle,
    }
}

export type AppRegistryService = ReturnType<typeof createAppRegistryService>
