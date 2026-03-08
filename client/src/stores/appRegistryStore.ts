import { create } from 'zustand'
import { createAppRegistryService } from '../features/app-registry/registryService'
import type { DependencyIssue, InstalledApp } from '../features/app-registry/types'

export type OperationState = 'idle' | 'installing' | 'updating' | 'removing' | 'error'

export interface AppOperation {
    state: OperationState
    progress: number
    message: string | null
}

interface AppRegistryStore {
    installed: Record<string, InstalledApp>
    operations: Record<string, AppOperation>
    issuesByApp: Record<string, DependencyIssue[]>
    installApp: (appId: string) => Promise<void>
    updateApp: (appId: string) => Promise<void>
    uninstallApp: (appId: string) => Promise<void>
    clearIssues: (appId: string) => void
    dispatchLifecycleEvent: (event: 'launch' | 'suspend', appId: string) => Promise<void>
}

const registryService = createAppRegistryService()

function wait(ms: number) {
    return new Promise<void>((resolve) => {
        window.setTimeout(resolve, ms)
    })
}

function operationMessage(state: OperationState) {
    switch (state) {
        case 'installing':
            return 'Installing package...'
        case 'updating':
            return 'Applying update...'
        case 'removing':
            return 'Removing package...'
        case 'error':
            return 'Action blocked by validation checks.'
        default:
            return null
    }
}

function toLifecycleVersion(appId: string, installed: Record<string, InstalledApp>) {
    return installed[appId]?.version ?? '0.0.0'
}

async function runOperationProgress(appId: string, state: OperationState, set: (partial: Partial<AppRegistryStore>) => void, get: () => AppRegistryStore) {
    const checkpoints = [14, 31, 53, 78, 100]

    for (const progress of checkpoints) {
        await wait(110)
        const current = get().operations[appId]
        if (!current || current.state !== state) {
            return false
        }

        set({
            operations: {
                ...get().operations,
                [appId]: {
                    state,
                    progress,
                    message: operationMessage(state),
                },
            },
        })
    }

    return true
}

export const useAppRegistryStore = create<AppRegistryStore>((set, get) => ({
    installed: registryService.initialInstalled,
    operations: {},
    issuesByApp: {},
    clearIssues: (appId) => set((state) => ({
        issuesByApp: {
            ...state.issuesByApp,
            [appId]: [],
        },
    })),
    dispatchLifecycleEvent: async (event, appId) => {
        await registryService.lifecycle.dispatch(event, {
            appId,
            version: toLifecycleVersion(appId, get().installed),
            timestamp: new Date().toISOString(),
        })
    },
    installApp: async (appId) => {
        const installed = get().installed
        const targetVersion = registryService.getLatestVersion(appId)

        if (!targetVersion) {
            return
        }

        const issues = registryService.getInstallValidation(appId, targetVersion, installed)
        if (issues.length > 0) {
            set((state) => ({
                issuesByApp: {
                    ...state.issuesByApp,
                    [appId]: issues,
                },
                operations: {
                    ...state.operations,
                    [appId]: {
                        state: 'error',
                        progress: 0,
                        message: operationMessage('error'),
                    },
                },
            }))
            return
        }

        set((state) => ({
            issuesByApp: {
                ...state.issuesByApp,
                [appId]: [],
            },
            operations: {
                ...state.operations,
                [appId]: {
                    state: 'installing',
                    progress: 0,
                    message: operationMessage('installing'),
                },
            },
        }))

        const completed = await runOperationProgress(appId, 'installing', set, get)
        if (!completed) {
            return
        }

        const now = new Date().toISOString()
        set((state) => ({
            installed: {
                ...state.installed,
                [appId]: {
                    id: appId,
                    version: targetVersion,
                    installedAt: now,
                    source: 'store',
                },
            },
            operations: {
                ...state.operations,
                [appId]: {
                    state: 'idle',
                    progress: 100,
                    message: 'Installed successfully.',
                },
            },
        }))

        await registryService.lifecycle.dispatch('install', {
            appId,
            version: targetVersion,
            timestamp: now,
        })
    },
    updateApp: async (appId) => {
        const installed = get().installed
        const current = installed[appId]
        const targetVersion = registryService.getLatestVersion(appId)
        if (!current || !targetVersion || current.version === targetVersion) {
            return
        }

        const issues = registryService.getInstallValidation(appId, targetVersion, installed)
        if (issues.length > 0) {
            set((state) => ({
                issuesByApp: {
                    ...state.issuesByApp,
                    [appId]: issues,
                },
                operations: {
                    ...state.operations,
                    [appId]: {
                        state: 'error',
                        progress: 0,
                        message: operationMessage('error'),
                    },
                },
            }))
            return
        }

        set((state) => ({
            issuesByApp: {
                ...state.issuesByApp,
                [appId]: [],
            },
            operations: {
                ...state.operations,
                [appId]: {
                    state: 'updating',
                    progress: 0,
                    message: operationMessage('updating'),
                },
            },
        }))

        const completed = await runOperationProgress(appId, 'updating', set, get)
        if (!completed) {
            return
        }

        const now = new Date().toISOString()
        set((state) => ({
            installed: {
                ...state.installed,
                [appId]: {
                    ...state.installed[appId],
                    version: targetVersion,
                    installedAt: now,
                },
            },
            operations: {
                ...state.operations,
                [appId]: {
                    state: 'idle',
                    progress: 100,
                    message: `Updated to ${targetVersion}.`,
                },
            },
        }))
    },
    uninstallApp: async (appId) => {
        const installed = get().installed
        if (!installed[appId]) {
            return
        }

        const issues = registryService.getRemovalValidation(appId, installed)
        if (issues.length > 0) {
            set((state) => ({
                issuesByApp: {
                    ...state.issuesByApp,
                    [appId]: issues,
                },
                operations: {
                    ...state.operations,
                    [appId]: {
                        state: 'error',
                        progress: 0,
                        message: operationMessage('error'),
                    },
                },
            }))
            return
        }

        set((state) => ({
            issuesByApp: {
                ...state.issuesByApp,
                [appId]: [],
            },
            operations: {
                ...state.operations,
                [appId]: {
                    state: 'removing',
                    progress: 0,
                    message: operationMessage('removing'),
                },
            },
        }))

        const completed = await runOperationProgress(appId, 'removing', set, get)
        if (!completed) {
            return
        }

        const now = new Date().toISOString()
        const removedVersion = installed[appId]?.version ?? '0.0.0'
        set((state) => {
            const nextInstalled = { ...state.installed }
            delete nextInstalled[appId]
            return {
                installed: nextInstalled,
                operations: {
                    ...state.operations,
                    [appId]: {
                        state: 'idle',
                        progress: 100,
                        message: 'Uninstalled successfully.',
                    },
                },
            }
        })

        await registryService.lifecycle.dispatch('remove', {
            appId,
            version: removedVersion,
            timestamp: now,
        })
    },
}))

export { registryService }
export const registerAppLifecycleHooks = registryService.lifecycle.register
