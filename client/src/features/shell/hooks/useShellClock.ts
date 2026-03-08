import { useEffect, useState } from 'react'

export function useShellClock(tickMs = 1000) {
    const [now, setNow] = useState(() => new Date())

    useEffect(() => {
        const interval = window.setInterval(() => {
            setNow(new Date())
        }, tickMs)

        return () => window.clearInterval(interval)
    }, [tickMs])

    return now
}
