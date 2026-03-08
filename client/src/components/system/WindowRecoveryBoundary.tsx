import { Component, type ComponentType, type ReactNode, Suspense, lazy } from 'react'
import Window from './Window'
import { useWindowStore } from '../../stores/windowStore'

interface WindowRecoveryBoundaryProps {
    windowId: string
    appTitle: string
    children: ReactNode
}

interface WindowRecoveryBoundaryState {
    hasError: boolean
    message: string
}

class WindowRecoveryBoundaryInner extends Component<
    WindowRecoveryBoundaryProps & { onClose: () => void },
    WindowRecoveryBoundaryState
> {
    constructor(props: WindowRecoveryBoundaryProps & { onClose: () => void }) {
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
    }

    render() {
        if (!this.state.hasError) {
            return this.props.children
        }

        return (
            <Window id={this.props.windowId} title={`${this.props.appTitle} (Recovery)`}>
                <div className="flex h-full w-full flex-col justify-between gap-3 bg-slate-950/55 p-4 text-slate-200">
                    <div>
                        <h2 className="text-sm font-semibold text-slate-100">This window crashed</h2>
                        <p className="mt-2 text-xs text-slate-300">
                            Retry the app or close this window to keep the desktop session stable.
                        </p>
                        <pre className="mt-3 max-h-28 overflow-auto rounded border border-slate-700 bg-slate-900/75 p-2 font-term text-[11px] text-slate-300">
                            {this.state.message || 'Unknown render error'}
                        </pre>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={this.handleRetry}
                            className="rounded border border-slate-500 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-100 hover:bg-slate-700"
                        >
                            Retry window
                        </button>
                        <button
                            onClick={this.props.onClose}
                            className="rounded border border-red-500/45 bg-red-900/20 px-3 py-1.5 text-xs font-medium text-red-100 hover:bg-red-900/35"
                        >
                            Close app
                        </button>
                    </div>
                </div>
            </Window>
        )
    }
}

function WindowLoadingFallback({ windowId, appTitle }: { windowId: string; appTitle: string }) {
    return (
        <Window id={windowId} title={`${appTitle} (Loading...)`}>
            <div className="flex h-full w-full items-center justify-center bg-slate-950/50 text-slate-200">
                <div className="flex items-center gap-3 rounded-xl border border-slate-700/80 bg-slate-900/60 px-4 py-3">
                    <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-400" />
                    <span className="text-xs uppercase tracking-[0.2em]">Loading module</span>
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
    const LazyWindowApp = lazy(loader)

    function RecoverableLazyWindow({ id }: { id: string }) {
        const closeWindow = useWindowStore((state) => state.closeWindow)

        return (
            <WindowRecoveryBoundaryInner windowId={id} appTitle={appTitle} onClose={() => closeWindow(id)}>
                <Suspense fallback={<WindowLoadingFallback windowId={id} appTitle={appTitle} />}>
                    <LazyWindowApp id={id} />
                </Suspense>
            </WindowRecoveryBoundaryInner>
        )
    }

    RecoverableLazyWindow.displayName = `RecoverableLazyWindow(${appTitle})`
    return RecoverableLazyWindow
}
