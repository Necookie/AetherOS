import { Hexagon } from 'lucide-react'

export default function LoadingLogo() {
    return (
        <div className="flex items-center justify-center mb-16 relative">
            <div className="absolute h-24 w-24 rotate-12 rounded-2xl bg-indigo-500/20 blur-[2px] animate-pulse" />
            <div className="absolute h-24 w-24 -rotate-6 rounded-2xl bg-slate-500/20 blur-[2px] animate-pulse" style={{ animationDelay: '500ms' }} />
            <Hexagon className="relative z-10 h-16 w-16 text-slate-100" strokeWidth={1.5} />
        </div>
    )
}
