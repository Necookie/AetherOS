import { create } from 'zustand'
import type { ProductivityAppId } from '../productivity'
import type { ProductivityPanel, SettingsSection, TaskManagerTab } from './types'

interface IntentEnvelope<T> {
    nonce: number
    payload: T
}

interface DeepLinkIntentStore {
    productivity: Partial<Record<ProductivityAppId, IntentEnvelope<{ recordId: string; panel?: ProductivityPanel }>>>
    settings: IntentEnvelope<{ section: SettingsSection }> | null
    taskManager: IntentEnvelope<{ tab: TaskManagerTab; processId?: number; processName?: string }> | null
    openProductivityRecord: (appId: ProductivityAppId, recordId: string, panel?: ProductivityPanel) => void
    openSettingsSection: (section: SettingsSection) => void
    openTaskManagerView: (tab: TaskManagerTab, processId?: number, processName?: string) => void
}

let nonceCounter = 0

function nextNonce() {
    nonceCounter += 1
    return nonceCounter
}

export const useDeepLinkIntentStore = create<DeepLinkIntentStore>((set) => ({
    productivity: {},
    settings: null,
    taskManager: null,
    openProductivityRecord: (appId, recordId, panel) => set((state) => ({
        productivity: {
            ...state.productivity,
            [appId]: {
                nonce: nextNonce(),
                payload: {
                    recordId,
                    panel,
                },
            },
        },
    })),
    openSettingsSection: (section) => set({
        settings: {
            nonce: nextNonce(),
            payload: { section },
        },
    }),
    openTaskManagerView: (tab, processId, processName) => set({
        taskManager: {
            nonce: nextNonce(),
            payload: { tab, processId, processName },
        },
    }),
}))

