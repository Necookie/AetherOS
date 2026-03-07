import { Loader2 } from 'lucide-react'

interface LoginControlsProps {
    isLoggingIn: boolean
    onLogin: () => void
}

export default function LoginControls({ isLoggingIn, onLogin }: LoginControlsProps) {
    return (
        <div className="h-16 flex items-center justify-center">
            {!isLoggingIn ? (
                <button
                    onClick={onLogin}
                    className="rounded-md border border-slate-500 bg-slate-800/80 px-10 py-2.5 text-sm font-medium tracking-wider text-slate-100 shadow-[0_8px_30px_rgba(2,6,23,0.35)] transition-all duration-300 hover:bg-slate-700/90 focus:outline-none focus:ring-2 focus:ring-indigo-400/50"
                >
                    Login
                </button>
            ) : (
                <div className="animate-fade-in flex flex-col items-center text-slate-300">
                    <Loader2 className="mb-3 h-8 w-8 animate-spin text-slate-100" />
                    <span className="text-sm font-light uppercase tracking-widest">Welcome</span>
                </div>
            )}
        </div>
    )
}
