import { Hexagon } from 'lucide-react'

export default function LoadingLogo() {
    return (
        <div className="flex items-center justify-center mb-16 relative">
            <div className="absolute w-24 h-24 bg-blue-500 rounded-2xl opacity-20 blur-[2px] rotate-12 animate-pulse"></div>
            <div className="absolute w-24 h-24 bg-indigo-500 rounded-2xl opacity-20 blur-[2px] -rotate-6 animate-pulse" style={{ animationDelay: '500ms' }}></div>
            <Hexagon className="w-16 h-16 text-white relative z-10" strokeWidth={1.5} />
        </div>
    )
}
