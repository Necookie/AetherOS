import { User } from 'lucide-react'

export default function LoginAvatar() {
    return (
        <div className="mb-6 flex h-32 w-32 items-center justify-center rounded-full border border-slate-600 bg-slate-900/80 shadow-2xl backdrop-blur-sm transition-transform duration-300 hover:scale-105">
            <User className="h-16 w-16 text-slate-300" strokeWidth={1.5} />
        </div>
    )
}
