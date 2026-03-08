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
                    className="rounded-md border border-white/75 bg-white/70 px-10 py-2.5 text-sm font-medium tracking-wider text-slate-800 shadow-[0_8px_30px_rgba(30,58,138,0.2)] transition-all duration-300 hover:bg-white focus:outline-none focus:ring-2 focus:ring-sky-400/50"
                >
                    Login
                </button>
            ) : (
                <div className="animate-fade-in flex flex-col items-center text-slate-700">
                    <Loader2 className="mb-3 h-8 w-8 animate-spin text-slate-800" />
                    <span className="text-sm font-light uppercase tracking-widest">Welcome</span>
                </div>
            )}
        </div>
    )
}
