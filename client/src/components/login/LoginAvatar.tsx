import { User } from 'lucide-react'

export default function LoginAvatar() {
    return (
        <div className="w-32 h-32 rounded-full bg-slate-200/90 flex items-center justify-center mb-6 shadow-2xl backdrop-blur-sm border border-white/10 transition-transform hover:scale-105 duration-300">
            <User className="w-16 h-16 text-slate-700" strokeWidth={1.5} />
        </div>
    )
}
