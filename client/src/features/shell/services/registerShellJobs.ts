import type { BackgroundJobScheduler } from '../../background-jobs'
import type { CreateNotificationInput } from '../../notifications'

interface MetricsSnapshot {
    cpuUsage: number
    memUsage: number
    networkLatencyMs: number
}

interface RegisterShellJobsOptions {
    scheduler: BackgroundJobScheduler
    publishNotification: (notification: CreateNotificationInput) => string
    getMetrics: () => MetricsSnapshot
}

export function registerShellJobs({
    scheduler,
    publishNotification,
    getMetrics,
}: RegisterShellJobsOptions) {
    let cpuAlertOpen = false
    let memoryAlertOpen = false

    scheduler.register({
        id: 'system-health-check',
        intervalMs: 30_000,
        runImmediately: true,
        task: () => {
            const { cpuUsage, memUsage } = getMetrics()

            if (cpuUsage >= 85 && !cpuAlertOpen) {
                cpuAlertOpen = true
                publishNotification({
                    title: 'CPU spike detected',
                    message: `CPU usage is ${cpuUsage.toFixed(1)}%. Review heavy apps in Task Manager.`,
                    source: 'System Monitor',
                    groupKey: 'system-health',
                    priority: 'high',
                })
            } else if (cpuUsage <= 65) {
                cpuAlertOpen = false
            }

            if (memUsage >= 88 && !memoryAlertOpen) {
                memoryAlertOpen = true
                publishNotification({
                    title: 'Memory pressure warning',
                    message: `Memory usage is ${memUsage.toFixed(1)}%. Consider closing background apps.`,
                    source: 'System Monitor',
                    groupKey: 'system-health',
                    priority: 'high',
                })
            } else if (memUsage <= 70) {
                memoryAlertOpen = false
            }
        },
    })

    scheduler.register({
        id: 'latency-watch',
        intervalMs: 45_000,
        task: () => {
            const { networkLatencyMs } = getMetrics()
            if (networkLatencyMs > 160) {
                publishNotification({
                    title: 'Network latency elevated',
                    message: `Current latency is ${networkLatencyMs} ms. Connectivity may feel slow.`,
                    source: 'Network Watch',
                    groupKey: 'network-watch',
                    priority: 'normal',
                    autoCloseMs: 35_000,
                })
            }
        },
    })

    return () => {
        scheduler.unregister('system-health-check')
        scheduler.unregister('latency-watch')
    }
}
