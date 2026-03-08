import type { InstalledApp, RegistryAppMetadata, DependencyIssue } from './types'
import { satisfiesVersionRange } from './versioning'

function getRelease(app: RegistryAppMetadata, version: string) {
    return app.releases.find((release) => release.version === version)
}

export function validateDependencies({
    app,
    version,
    installed,
    catalog,
}: {
    app: RegistryAppMetadata
    version: string
    installed: Record<string, InstalledApp>
    catalog: Map<string, RegistryAppMetadata>
}): DependencyIssue[] {
    const release = getRelease(app, version)
    if (!release) {
        return [{
            type: 'incompatible',
            appId: app.id,
            message: `Version ${version} is not available for ${app.title}.`,
        }]
    }

    const issues: DependencyIssue[] = []

    release.dependencies.forEach((dependency) => {
        const installedDependency = installed[dependency.appId]
        const dependencyApp = catalog.get(dependency.appId)
        const dependencyTitle = dependencyApp?.title ?? dependency.appId

        if (!installedDependency) {
            issues.push({
                type: 'missing',
                appId: dependency.appId,
                requiredRange: dependency.range,
                message: `${dependencyTitle} ${dependency.range} is required.`,
            })
            return
        }

        if (!satisfiesVersionRange(installedDependency.version, dependency.range)) {
            issues.push({
                type: 'incompatible',
                appId: dependency.appId,
                requiredRange: dependency.range,
                installedVersion: installedDependency.version,
                message: `${dependencyTitle} ${dependency.range} is required, found ${installedDependency.version}.`,
            })
        }
    })

    return issues
}

export function validateRemoval({
    appId,
    installed,
    catalog,
}: {
    appId: string
    installed: Record<string, InstalledApp>
    catalog: Map<string, RegistryAppMetadata>
}): DependencyIssue[] {
    const issues: DependencyIssue[] = []

    Object.values(installed).forEach((candidate) => {
        if (candidate.id === appId) {
            return
        }

        const candidateMetadata = catalog.get(candidate.id)
        if (!candidateMetadata) {
            return
        }

        const release = candidateMetadata.releases.find((item) => item.version === candidate.version)
        if (!release) {
            return
        }

        release.dependencies.forEach((dependency) => {
            if (dependency.appId !== appId) {
                return
            }

            issues.push({
                type: 'blocked',
                appId,
                dependentAppId: candidate.id,
                requiredRange: dependency.range,
                message: `${candidateMetadata.title} depends on ${appId} ${dependency.range}.`,
            })
        })
    })

    return issues
}
