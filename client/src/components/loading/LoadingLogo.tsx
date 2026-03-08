import { Hexagon } from 'lucide-react'

export default function LoadingLogo() {
    return (
        <div className="flex items-center justify-center mb-16 relative">
            <div className="absolute h-24 w-24 rotate-12 rounded-2xl bg-pink-300/45 blur-[2px] animate-pulse" />
            <div className="absolute h-24 w-24 -rotate-6 rounded-2xl bg-sky-300/45 blur-[2px] animate-pulse" style={{ animationDelay: '500ms' }} />
            <Hexagon className="relative z-10 h-16 w-16 text-slate-800" strokeWidth={1.5} />
        </div>
    )
}
