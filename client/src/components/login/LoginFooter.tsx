import { Globe, Power, RotateCw } from 'lucide-react'

export default function LoginFooter() {
    return (
        <div className="absolute bottom-8 right-12 z-10 flex flex-col items-end space-y-8">
            <div className="flex flex-col items-end text-sm text-white/70 space-y-2">
                <div className="mb-2">
                    <Globe className="w-5 h-5 opacity-80" />
                </div>
                <button className="text-white font-medium drop-shadow-md">English</button>
            </div>

            <div className="flex items-center space-x-6 pt-4 text-white/80">
                <button className="hover:text-white hover:scale-110 transition-all cursor-pointer" title="Shut Down">
                    <Power className="w-6 h-6" strokeWidth={1.5} />
                </button>
                <button className="hover:text-white hover:scale-110 transition-all cursor-pointer" title="Restart">
                    <RotateCw className="w-6 h-6" strokeWidth={1.5} />
                </button>
            </div>
        </div>
    )
}
