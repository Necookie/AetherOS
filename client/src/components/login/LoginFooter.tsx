import { Globe, Power, RotateCw } from 'lucide-react'

export default function LoginFooter() {
    return (
        <div className="absolute bottom-8 right-12 z-10 flex flex-col items-end space-y-8">
            <div className="flex flex-col items-end space-y-2 text-sm text-on-dark-muted">
                <div className="mb-2">
                    <Globe className="h-5 w-5" />
                </div>
                <button className="font-semibold text-on-dark transition-transform active:scale-95">English</button>
            </div>

            <div className="flex items-center space-x-6 text-on-dark-muted">
                <button className="transition-transform active:scale-95 hover:text-on-dark" title="Shut Down">
                    <Power className="h-6 w-6" strokeWidth={1.5} />
                </button>
                <button className="transition-transform active:scale-95 hover:text-on-dark" title="Restart">
                    <RotateCw className="h-6 w-6" strokeWidth={1.5} />
                </button>
            </div>
        </div>
    )
}
