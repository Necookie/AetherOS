import { describe, expect, it, vi } from 'vitest'
import { createProcessRecord, formatProcessStatus, isActiveProcess, TERMINATED_RETENTION_TICKS, transitionProcess } from './processModel'

describe('processModel', () => {
    it('creates records with professor-required statuses', () => {
        expect(formatProcessStatus('ready')).toBe('Ready')
        expect(formatProcessStatus('running')).toBe('Running')
        expect(formatProcessStatus('waiting')).toBe('Waiting')
        expect(formatProcessStatus('terminated')).toBe('Terminated')
    })

    it('marks transitioned processes with explicit flow labels', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0)

        const process = createProcessRecord({
            pid: 7,
            name: 'browser',
            cpu: 5,
            mem: 256,
            disk: 2,
            net: 4,
            status: 'ready',
        })

        const running = transitionProcess(process, 'running', 3, 'CPU dispatch')
        expect(running.lastTransition).toBe('Ready -> Running (CPU dispatch)')
        expect(running.lastTransitionTick).toBe(3)
        expect(running.runTicksRemaining).toBe(1)

        vi.restoreAllMocks()
    })

    it('treats terminated processes as inactive but retains them briefly', () => {
        const process = transitionProcess(
            createProcessRecord({
                pid: 8,
                name: 'taskmgr',
                cpu: 2,
                mem: 128,
                disk: 1,
                net: 1,
                status: 'running',
            }),
            'terminated',
            4,
            'Process killed',
        )

        expect(isActiveProcess(process)).toBe(false)
        expect(process.terminatedTicksRemaining).toBe(TERMINATED_RETENTION_TICKS)
    })
})
