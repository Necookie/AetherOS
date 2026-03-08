import React from 'react'

interface AppErrorBoundaryProps {
    children: React.ReactNode
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

    render() {
        if (!this.state.hasError) {
            return this.props.children
        }

        return (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[radial-gradient(780px_540px_at_15%_20%,#ffd3e8_0%,transparent_68%),linear-gradient(160deg,#cfe7ff_0%,#e2dbff_52%,#ffd8ea_100%)] p-4">
                <div className="max-w-lg rounded-2xl border border-white/70 bg-white/75 p-5 shadow-2xl backdrop-blur-xl">
                    <h1 className="text-lg font-semibold text-slate-900">AetherOS crashed during render</h1>
                    <p className="mt-2 text-sm text-slate-700">
                        Refresh to recover. If this keeps happening, share the error text below.
                    </p>
                    <pre className="mt-3 max-h-40 overflow-auto rounded-lg border border-slate-200/80 bg-white/80 p-3 font-term text-xs text-slate-700">
                        {this.state.message || 'Unknown error'}
                    </pre>
                    <button
                        onClick={this.handleReload}
                        className="mt-4 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
                    >
                        Reload app
                    </button>
                </div>
            </div>
        )
    }
}
