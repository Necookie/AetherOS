import React from 'react'

interface AppErrorBoundaryProps {
    children: React.ReactNode
    onResetDesktop?: () => void
}

interface AppErrorBoundaryState {
    hasError: boolean
    message: string
}

export default class AppErrorBoundary extends React.Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
    constructor(props: AppErrorBoundaryProps) {
        super(props)
        this.state = {
            hasError: false,
            message: '',
        }
    }

    static getDerivedStateFromError(error: unknown): AppErrorBoundaryState {
        return {
            hasError: true,
            message: error instanceof Error ? error.message : String(error),
        }
    }

    componentDidCatch(error: unknown) {
        console.error('AetherOS render crash:', error)
    }

    private handleReload = () => {
        window.location.reload()
    }

    private handleRecoverDesktop = () => {
        this.props.onResetDesktop?.()
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
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-parchment p-4">
                <div className="max-w-lg rounded-lg border border-hairline bg-canvas p-5 shadow-elevated">
                    <h1 className="text-lg font-semibold text-ink">AetherOS crashed during render</h1>
                    <p className="mt-2 text-sm text-ink-muted">
                        Refresh to recover. If this keeps happening, share the error text below.
                    </p>
                    <pre className="mt-3 max-h-40 overflow-auto rounded-md border border-hairline bg-parchment p-3 font-term text-xs text-ink-muted">
                        {this.state.message || 'Unknown error'}
                    </pre>
                    <button
                        onClick={this.handleReload}
                        className="mt-4 rounded-pill bg-primary px-4 py-2 text-sm text-white transition-transform active:scale-95"
                    >
                        Reload app
                    </button>
                    {this.props.onResetDesktop && (
                        <button
                            onClick={this.handleRecoverDesktop}
                            className="ml-2 mt-4 rounded-pill border border-primary px-4 py-2 text-sm text-primary transition-transform active:scale-95"
                        >
                            Reset desktop session
                        </button>
                    )}
                </div>
            </div>
        )
    }
}
