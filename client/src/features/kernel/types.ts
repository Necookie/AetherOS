export interface Process {
    pid: number
    name: string
    cpu: number
    mem: number
    disk: number
    net: number
    status: 'running' | 'waiting' | 'terminated'
}
