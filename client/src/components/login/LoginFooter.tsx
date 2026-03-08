import { Globe, Power, RotateCw } from 'lucide-react'

export default function LoginFooter() {
    return (
        <div className="absolute bottom-8 right-12 z-10 flex flex-col items-end space-y-8">
            <div className="flex flex-col items-end space-y-2 text-sm text-slate-700/85">
                <div className="mb-2">
                    <Globe className="h-5 w-5 opacity-80" />
                </div>
                <button className="font-medium text-slate-800">English</button>
            </div>

            <div className="flex items-center space-x-6 pt-4 text-slate-700/85">
                <button className="cursor-pointer transition-all hover:scale-110 hover:text-slate-900" title="Shut Down">
                    <Power className="h-6 w-6" strokeWidth={1.5} />
                </button>
                <button className="cursor-pointer transition-all hover:scale-110 hover:text-slate-900" title="Restart">
                    <RotateCw className="h-6 w-6" strokeWidth={1.5} />
                </button>
            </div>
        </div>
    )
}
