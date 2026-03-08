import { useEffect, useState } from 'react'
import { Settings } from 'lucide-react'

const ICON_MAP: Record<string, string> = {
    browser: '/assets/candy-icons/browser.svg',
    explorer: '/assets/candy-icons/explorer.svg',
    term: '/assets/candy-icons/term.svg',
    taskmgr: '/assets/candy-icons/taskmgr.svg',
}

export function ShellAppIcon({ appId, className }: { appId: string; className?: string }) {
    const iconSrc = ICON_MAP[appId]
    const [hasError, setHasError] = useState(false)

    useEffect(() => {
        setHasError(false)
    }, [appId])

    if (!iconSrc || hasError) {
        return <Settings className={className} />
    }

    return <img src={iconSrc} className={className} aria-hidden alt="" onError={() => setHasError(true)} />
}
