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

export class WindowRecoveryBoundaryInner extends Component<
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
                <div className="flex h-full w-full flex-col justify-between gap-3 bg-canvas p-4 text-ink">
                    <div>
                        <h2 className="text-sm font-semibold text-ink">This window crashed</h2>
                        <p className="mt-2 text-xs text-ink-muted">
                            Retry the app or close this window to keep the desktop session stable.
                        </p>
                        <pre className="mt-3 max-h-28 overflow-auto rounded-sm border border-hairline bg-parchment p-2 font-term text-[12px] text-ink-muted">
                            {this.state.message || 'Unknown render error'}
                        </pre>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={this.handleRetry}
                            className="rounded-sm border border-hairline bg-parchment px-3 py-1.5 text-xs font-semibold text-ink transition-transform active:scale-95"
                        >
                            Retry window
                        </button>
                        <button
                            onClick={this.props.onClose}
                            className="rounded-sm border border-hairline bg-canvas px-3 py-1.5 text-xs font-semibold text-danger transition-transform active:scale-95"
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
            <div className="flex h-full w-full items-center justify-center bg-canvas text-ink">
                <div className="flex items-center gap-3 rounded-lg border border-hairline bg-parchment px-4 py-3">
                    <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-primary" />
                    <span className="text-xs text-ink-muted">Loading module</span>
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
