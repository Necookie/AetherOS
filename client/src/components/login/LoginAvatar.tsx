import { User } from 'lucide-react'

export default function LoginAvatar() {
    return (
        <div className="mb-6 flex h-32 w-32 items-center justify-center rounded-full border border-white/75 bg-white/55 shadow-2xl backdrop-blur-md transition-transform duration-300 hover:scale-105">
            <User className="h-16 w-16 text-slate-700" strokeWidth={1.5} />
        </div>
    )
}
