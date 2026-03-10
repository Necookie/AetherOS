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
            className={`os-desktop-bg fixed inset-0 z-50 transition-opacity duration-200 motion-reduce:transition-none ${isHandingOff ? 'opacity-0' : 'opacity-100'}`}
        >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgb(255_255_255_/_0.52),_transparent_48%)]" />
            <div className="relative flex h-full w-full items-center justify-center px-4 py-8 sm:px-6 lg:px-10">
                <div className="grid w-full max-w-6xl gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.3fr)]">
                    <section className="rounded-[28px] border border-white/70 bg-white/45 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
                        <div className="mb-8 flex items-center justify-between gap-4">
                            <div>
                                <p className="font-term text-[11px] uppercase tracking-[0.32em] text-slate-600">Boot Diagnostics</p>
                                <h1 className="mt-3 text-3xl font-light tracking-[0.04em] text-slate-900 sm:text-4xl">
                                    Starting AetherOS
                                </h1>
                            </div>
                            <div
                                className={`rounded-full px-3 py-1 font-term text-[11px] uppercase tracking-[0.22em] ${
                                    snapshot.readinessState === 'booting'
                                        ? 'bg-slate-900 text-white'
                                        : snapshot.warningCount > 0
                                          ? 'bg-amber-100 text-amber-900'
                                          : 'bg-emerald-100 text-emerald-900'
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
                                className="rounded-2xl border border-slate-200/70 bg-white/55 p-4"
                                role="progressbar"
                                aria-label="Boot progress"
                                aria-valuemin={0}
                                aria-valuemax={100}
                                aria-valuenow={snapshot.progressPercent}
                            >
                                <div className="mb-3 flex items-center justify-between gap-3">
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Startup Path</p>
                                        <p className="mt-1 text-sm text-slate-800">
                                            {activeService ? activeService.detail : 'Diagnostics complete. Handing off to session broker.'}
                                        </p>
                                    </div>
                                    <div className="font-term text-sm text-slate-700">{snapshot.progressPercent}%</div>
                                </div>

                                <div className="h-2 overflow-hidden rounded-full bg-slate-200/80">
                                    <div
                                        className="h-full rounded-full bg-slate-900 transition-[width] duration-150 ease-out motion-reduce:transition-none"
                                        style={{ width: `${snapshot.progressPercent}%` }}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-3 text-sm text-slate-700 sm:grid-cols-3">
                                <StatCard label="Services ready" value={`${snapshot.completedServices}/${snapshot.services.length}`} />
                                <StatCard label="Elapsed" value={`${snapshot.totalElapsedMs} ms`} />
                                <StatCard
                                    label="Advisories"
                                    value={snapshot.warningCount > 0 ? `${snapshot.warningCount} present` : 'Nominal'}
                                />
                            </div>
                        </div>
                    </section>

                    <section className="rounded-[28px] border border-slate-200/70 bg-slate-950/88 p-4 text-slate-100 shadow-2xl sm:p-6">
                        <div className="mb-4 flex items-center justify-between gap-4">
                            <div>
                                <p className="font-term text-[11px] uppercase tracking-[0.28em] text-slate-400">Service Panel</p>
                                <h2 className="mt-2 text-xl font-medium text-white">Startup status</h2>
                            </div>
                            <p className="font-term text-xs uppercase tracking-[0.2em] text-slate-400">
                                {snapshot.totalDurationMs} ms budget
                            </p>
                        </div>

                        <div className="space-y-3" role="status" aria-live="polite" aria-atomic="true">
                            {snapshot.services.map((service) => (
                                <DiagnosticsRow key={service.id} service={service} isActive={service.id === snapshot.activeServiceId} />
                            ))}
                        </div>

                        {advisoryServices.length > 0 ? (
                            <div className="mt-5 rounded-2xl border border-amber-300/20 bg-amber-400/10 p-4">
                                <p className="font-term text-[11px] uppercase tracking-[0.22em] text-amber-200">Advisories</p>
                                <div className="mt-3 space-y-2">
                                    {advisoryServices.map((service) =>
                                        service.warning ? (
                                            <p key={service.id} className="text-sm text-amber-50/90">
                                                <span className="font-term text-xs text-amber-200">{service.warning.code}</span>{' '}
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
            className={`rounded-2xl border px-4 py-3 transition-colors duration-150 motion-reduce:transition-none ${
                isActive
                    ? 'border-sky-300/45 bg-sky-400/10'
                    : service.state === 'warning'
                      ? 'border-amber-300/25 bg-amber-400/10'
                      : 'border-slate-800 bg-slate-900/70'
            }`}
        >
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <StatusIcon state={service.state} />
                        <p className="text-sm font-medium text-white">{service.label}</p>
                    </div>
                    <p className="mt-2 text-sm text-slate-400">{service.detail}</p>
                </div>

                <div className="text-right">
                    <p className="font-term text-[11px] uppercase tracking-[0.18em] text-slate-400">{statusText}</p>
                    <p className="mt-2 font-term text-xs text-slate-300">
                        {service.elapsedMs}/{service.durationMs} ms
                    </p>
                </div>
            </div>
        </div>
    )
}

function StatusIcon({ state }: { state: BootServiceSnapshot['state'] }) {
    if (state === 'warning') {
        return <AlertTriangle className="h-4 w-4 text-amber-300" />
    }

    if (state === 'ready') {
        return <CheckCircle2 className="h-4 w-4 text-emerald-300" />
    }

    if (state === 'starting') {
        return <Loader2 className="h-4 w-4 animate-spin text-sky-300 motion-reduce:animate-none" />
    }

    return <div className="h-2.5 w-2.5 rounded-full bg-slate-500" />
}

function StatCard({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-2xl border border-slate-200/70 bg-white/45 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
            <p className="mt-1 font-term text-sm text-slate-800">{value}</p>
        </div>
    )
}
