import { Hexagon } from 'lucide-react'

export default function LoadingLogo() {
    return (
        <div className="mb-16 flex items-center justify-center">
            <Hexagon className="h-16 w-16 text-ink" strokeWidth={1.5} />
        </div>
    )
}
