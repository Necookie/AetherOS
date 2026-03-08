export type AppCategory = 'system' | 'productivity' | 'developer' | 'utility'

export interface AppDependency {
    appId: string
    range: string
}

export interface AppRelease {
    version: string
    dependencies: AppDependency[]
    changelog: string
}

export interface RegistryAppMetadata {
    id: string
    title: string
    summary: string
    category: AppCategory
    iconId?: string
    launchable: boolean
    releases: AppRelease[]
}

export interface InstalledApp {
    id: string
    version: string
    installedAt: string
    source: 'system' | 'store'
}

export type LifecycleEvent = 'install' | 'launch' | 'suspend' | 'remove'

export interface LifecycleContext {
    appId: string
    version: string
    timestamp: string
}

export interface DependencyIssue {
    type: 'missing' | 'incompatible' | 'blocked'
    appId: string
    requiredRange?: string
    installedVersion?: string
    dependentAppId?: string
    message: string
}
