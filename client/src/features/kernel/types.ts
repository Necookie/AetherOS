export const PROCESS_STATUSES = ['ready', 'running', 'waiting', 'terminated'] as const

export type ProcessStatus = typeof PROCESS_STATUSES[number]

export interface Process {
    pid: number
    name: string
    appId?: string
    cpu: number
    mem: number
    disk: number
    net: number
    status: ProcessStatus
    lastTransition: string
    lastTransitionTick: number
}
