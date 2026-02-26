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
                    className="px-10 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm font-medium tracking-wider shadow-[0_4px_30px_rgba(0,0,0,0.1)]"
                >
                    Login
                </button>
            ) : (
                <div className="flex flex-col items-center animate-fade-in text-white/80">
                    <Loader2 className="w-8 h-8 animate-spin mb-3 text-white" />
                    <span className="text-sm font-light tracking-widest uppercase shadow-black drop-shadow-md">Welcome</span>
                </div>
            )}
        </div>
    )
}
