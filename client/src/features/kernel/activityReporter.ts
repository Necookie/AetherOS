import type { KernelActivityEventPayload } from './protocol'
import { useKernelStore } from '../../stores/useKernelStore'

type ActivityDraft = Omit<KernelActivityEventPayload, 'protocolVersion'>

export function reportKernelActivity(activity: ActivityDraft) {
    useKernelStore.getState().reportActivity(activity)
}
