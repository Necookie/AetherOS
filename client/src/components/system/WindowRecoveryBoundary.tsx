import { Component, type ComponentType, type ReactNode, Suspense, lazy, useState } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import Window from './Window'
import { useWindowStore } from '../../stores/windowStore'

export function isChunkLoadError(message: string): boolean {
    return (
        message.includes('Failed to fetch dynamically imported module') ||
        message.includes('Importing a module script failed') ||
        message.includes('error loading dynamically imported module') ||
        message.includes('Loading chunk')
    )
}

interface WindowRecoveryBoundaryProps {
    windowId: string
    appTitle: string
    children: ReactNode
    onClose: () => void
    onRetry?: () => void
}

interface WindowRecoveryBoundaryState {
    hasError: boolean
    message: string
}

export class WindowRecoveryBoundaryInner extends Component<
    WindowRecoveryBoundaryProps,
    WindowRecoveryBoundaryState
> {
    constructor(props: WindowRecoveryBoundaryProps) {
        super(props)
        this.state = {
            hasError: false,
            message: '',
        }
    }

    static getDerivedStateFromError(error: unknown): WindowRecoveryBoundaryState {
        return {
            hasError: true,
            message: error instanceof Error ? error.message : String(error),
        }
    }

    componentDidCatch(error: unknown) {
        console.error(`Window crash: ${this.props.appTitle}`, error)
    }

    private handleRetry = () => {
        this.setState({
            hasError: false,
            message: '',
        })
        this.props.onRetry?.()
    }

    private handleReload = () => {
        window.location.reload()
    }

    render() {
        if (!this.state.hasError) {
            return this.props.children
        }

        const isChunkError = isChunkLoadError(this.state.message)

        return (
            <Window id={this.props.windowId} title={`${this.props.appTitle} (${isChunkError ? 'Update' : 'Recovery'})`}>
                <div className="flex h-full w-full flex-col items-center justify-center bg-canvas p-6 text-ink select-none">
                    <div className="w-full max-w-md rounded-2xl border border-hairline/80 bg-parchment/60 p-6 shadow-sm backdrop-blur-md">
                        <div className="flex items-start gap-4">
                            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${
                                isChunkError ? 'border-primary/20 bg-primary/10 text-primary' : 'border-danger/20 bg-danger/10 text-danger'
                            }`}>
                                {isChunkError ? <RefreshCw className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
                            </div>

                            <div className="min-w-0 flex-1">
                                <h2 className="text-sm font-bold text-ink">
                                    {isChunkError ? 'Application Update Available' : `${this.props.appTitle} Encountered an Issue`}
                                </h2>
                                <p className="mt-1 text-xs text-ink-muted leading-relaxed">
                                    {isChunkError
                                        ? 'A newer version of this module is available. Reload the session to fetch the latest application code.'
                                        : 'A rendering or runtime exception occurred. You can retry the window or close it to maintain session stability.'}
                                </p>

                                <div className="mt-3 max-h-24 overflow-auto rounded-lg border border-hairline bg-canvas p-2.5 font-mono text-[11px] text-ink-muted-48">
                                    {this.state.message || 'Unknown render error'}
                                </div>
                            </div>
                        </div>

                        <div className="mt-5 flex items-center justify-end gap-2 border-t border-hairline/60 pt-4">
                            <button
                                onClick={this.props.onClose}
                                className="rounded-lg border border-hairline bg-canvas px-3.5 py-1.5 text-xs font-semibold text-ink transition-all hover:bg-parchment active:scale-95"
                            >
                                Close Window
                            </button>

                            {isChunkError ? (
                                <button
                                    onClick={this.handleReload}
                                    className="rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-white shadow-xs transition-all hover:bg-primary/90 active:scale-95"
                                >
                                    Reload AetherOS
                                </button>
                            ) : (
                                <button
                                    onClick={this.handleRetry}
                                    className="rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-white shadow-xs transition-all hover:bg-primary/90 active:scale-95"
                                >
                                    Retry App
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </Window>
        )
    }
}

function WindowLoadingFallback({ windowId, appTitle }: { windowId: string; appTitle: string }) {
    return (
        <Window id={windowId} title={`${appTitle} (Loading...)`}>
            <div className="flex h-full w-full items-center justify-center bg-canvas text-ink">
                <div className="flex items-center gap-3 rounded-xl border border-hairline/80 bg-parchment px-4 py-3 shadow-2xs">
                    <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-primary" />
                    <span className="text-xs font-medium text-ink-muted">Loading {appTitle}...</span>
                </div>
            </div>
        </Window>
    )
}

type WindowAppLoader = () => Promise<{ default: ComponentType<{ id: string }> }>

export function createRecoverableLazyWindow(
    appTitle: string,
    loader: WindowAppLoader,
): ComponentType<{ id: string }> {
    const createLazyWindowApp = () => lazy(async () => {
        try {
            return await loader()
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err)
            if (isChunkLoadError(msg)) {
                const reloadKey = `aetheros_chunk_auto_reload_${appTitle}`
                const alreadyReloaded = sessionStorage.getItem(reloadKey)
                if (!alreadyReloaded) {
                    sessionStorage.setItem(reloadKey, 'true')
                    window.location.reload()
                }
            }
            throw err
        }
    })

    function RecoverableLazyWindow({ id }: { id: string }) {
        const closeWindow = useWindowStore((state) => state.closeWindow)
        const [LazyWindowApp, setLazyWindowApp] = useState(createLazyWindowApp)

        return (
            <WindowRecoveryBoundaryInner
                windowId={id}
                appTitle={appTitle}
                onClose={() => closeWindow(id)}
                onRetry={() => setLazyWindowApp(createLazyWindowApp)}
            >
                <Suspense fallback={<WindowLoadingFallback windowId={id} appTitle={appTitle} />}>
                    <LazyWindowApp id={id} />
                </Suspense>
            </WindowRecoveryBoundaryInner>
        )
    }

    RecoverableLazyWindow.displayName = `RecoverableLazyWindow(${appTitle})`
    return RecoverableLazyWindow
}
