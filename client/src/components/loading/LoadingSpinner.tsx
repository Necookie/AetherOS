import { Loader2 } from 'lucide-react'

export default function LoadingSpinner() {
    return (
        <div className="flex items-center justify-center mt-8">
            <Loader2 className="w-8 h-8 text-white animate-spin opacity-80" />
        </div>
    )
}
