import { Loader2 } from 'lucide-react'

export default function LoadingSpinner() {
    return (
        <div className="flex items-center justify-center mt-8">
            <Loader2 className="h-8 w-8 animate-spin text-slate-300 opacity-80" />
        </div>
    )
}
