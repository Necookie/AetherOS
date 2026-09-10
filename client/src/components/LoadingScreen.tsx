import { AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react'
import LoadingLogo from './loading/LoadingLogo'
import { useBootDiagnostics } from '../features/boot-diagnostics/useBootDiagnostics'
import type { BootServiceSnapshot } from '../features/boot-diagnostics/types'

interface LoadingScreenProps {
    onComplete: () => void
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
    const snapshot = useBootDiagnostics({ onComplete })
    const isHandingOff = snapshot.readinessState !== 'booting'
    const activeService = snapshot.services.find((service) => service.id === snapshot.activeServiceId) ?? null
    const advisoryServices = snapshot.services.filter((service) => service.state === 'warning')

    return (
        <div
            className={`fixed inset-0 z-50 bg-parchment transition-opacity duration-200 motion-reduce:transition-none ${isHandingOff ? 'opacity-0' : 'opacity-100'}`}
        >
            <div className="flex h-full w-full items-center justify-center px-4 py-8 sm:px-6 lg:px-10">
                <div className="grid w-full max-w-6xl gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.3fr)]">
                    {/* Parchment tile: boot progress */}
                    <section className="rounded-lg border border-hairline bg-canvas p-6 shadow-elevated sm:p-8">
                        <div className="mb-8 flex items-center justify-between gap-4">
                            <div>
                                <p className="font-term text-[12px] text-ink-muted">Boot Diagnostics</p>
                                <h1 className="mt-3 text-[34px] font-semibold leading-tight tracking-[-0.374px] text-ink">
                                    Starting AetherOS
                                </h1>
                            </div>
                            <div
                                className={`rounded-pill px-3 py-1 font-term text-[12px] ${
                                    snapshot.readinessState === 'booting'
                                        ? 'bg-ink text-on-dark'
                                        : snapshot.warningCount > 0
                                          ? 'bg-warning text-on-dark'
                                          : 'bg-primary text-on-dark'
                                }`}
                            >
                                {snapshot.readinessState === 'booting'
                                    ? 'Booting'
                                    : snapshot.warningCount > 0
                                      ? 'Ready with advisory'
                                      : 'Ready'}
                            </div>
                        </div>

                        <LoadingLogo />

                        <div className="space-y-4">
                            <div
                                className="rounded-md border border-hairline bg-parchment p-4"
                                role="progressbar"
                                aria-label="Boot progress"
                                aria-valuemin={0}
                                aria-valuemax={100}
                                aria-valuenow={snapshot.progressPercent}
                            >
                                <div className="mb-3 flex items-center justify-between gap-3">
                                    <div>
                                        <p className="text-xs text-ink-muted">Startup Path</p>
                                        <p className="mt-1 text-sm text-ink">
                                            {activeService ? activeService.detail : 'Diagnostics complete. Handing off to session broker.'}
                                        </p>
                                    </div>
                                    <div className="font-term text-sm text-ink-muted">{snapshot.progressPercent}%</div>
                                </div>

                                <div className="h-2 overflow-hidden rounded-full bg-hairline">
                                    <div
                                        className="h-full rounded-full bg-primary transition-[width] duration-150 ease-out motion-reduce:transition-none"
                                        style={{ width: `${snapshot.progressPercent}%` }}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-3 text-sm text-ink sm:grid-cols-3">
                                <StatCard label="Services ready" value={`${snapshot.completedServices}/${snapshot.services.length}`} />
                                <StatCard label="Elapsed" value={`${snapshot.totalElapsedMs} ms`} />
                                <StatCard
                                    label="Advisories"
                                    value={snapshot.warningCount > 0 ? `${snapshot.warningCount} present` : 'Nominal'}
                                />
                            </div>
                        </div>
                    </section>

                    {/* Dark tile: live service panel — the color change is the divider */}
                    <section className="rounded-lg border border-hairline bg-tile-1 p-4 text-on-dark sm:p-6">
                        <div className="mb-4 flex items-center justify-between gap-4">
                            <div>
                                <p className="font-term text-[12px] text-on-dark-muted">Service Panel</p>
                                <h2 className="mt-2 text-xl font-semibold text-on-dark">Startup status</h2>
                            </div>
                            <p className="font-term text-xs text-on-dark-muted">
                                {snapshot.totalDurationMs} ms budget
                            </p>
                        </div>

                        <div className="space-y-3" role="status" aria-live="polite" aria-atomic="true">
                            {snapshot.services.map((service) => (
                                <DiagnosticsRow key={service.id} service={service} isActive={service.id === snapshot.activeServiceId} />
                            ))}
                        </div>

                        {advisoryServices.length > 0 ? (
                            <div className="mt-5 rounded-md border border-[rgba(255,149,0,0.4)] bg-tile-2 p-4">
                                <p className="font-term text-[12px] text-warning">Advisories</p>
                                <div className="mt-3 space-y-2">
                                    {advisoryServices.map((service) =>
                                        service.warning ? (
                                            <p key={service.id} className="text-sm text-on-dark-muted">
                                                <span className="font-term text-xs text-warning">{service.warning.code}</span>{' '}
                                                {service.warning.message}
                                            </p>
                                        ) : null,
                                    )}
                                </div>
                            </div>
                        ) : null}
                    </section>
                </div>
            </div>
        </div>
    )
}

function DiagnosticsRow({ service, isActive }: { service: BootServiceSnapshot; isActive: boolean }) {
    const statusText =
        service.state === 'warning' ? 'Advisory' : service.state === 'ready' ? 'Ready' : service.state === 'starting' ? 'Starting' : 'Queued'

    return (
        <div
            className={`rounded-md border px-4 py-3 transition-colors duration-150 motion-reduce:transition-none ${
                isActive
                    ? 'border-primary-on-dark bg-tile-2'
                    : service.state === 'warning'
                      ? 'border-[rgba(255,149,0,0.4)] bg-tile-2'
                      : 'border-white/10 bg-tile-1'
            }`}
        >
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <StatusIcon state={service.state} />
                        <p className="text-sm font-semibold text-on-dark">{service.label}</p>
                    </div>
                    <p className="mt-2 text-sm text-on-dark-muted">{service.detail}</p>
                </div>

                <div className="text-right">
                    <p className="font-term text-[12px] text-on-dark-muted">{statusText}</p>
                    <p className="mt-2 font-term text-xs text-on-dark-muted">
                        {service.elapsedMs}/{service.durationMs} ms
                    </p>
                </div>
            </div>
        </div>
    )
}

function StatusIcon({ state }: { state: BootServiceSnapshot['state'] }) {
    if (state === 'warning') {
        return <AlertTriangle className="h-4 w-4 text-warning" />
    }

    if (state === 'ready') {
        return <CheckCircle2 className="h-4 w-4 text-primary-on-dark" />
    }

    if (state === 'starting') {
        return <Loader2 className="h-4 w-4 animate-spin text-primary-on-dark motion-reduce:animate-none" />
    }

    return <div className="h-2.5 w-2.5 rounded-full bg-on-dark-muted" />
}

function StatCard({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-md border border-hairline bg-parchment px-4 py-3">
            <p className="text-xs text-ink-muted">{label}</p>
            <p className="mt-1 font-term text-sm text-ink">{value}</p>
        </div>
    )
}
