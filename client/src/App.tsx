import { useState, useEffect, useMemo, useRef } from 'react'
import DesktopShell from './components/DesktopShell'
import LoadingScreen from './components/LoadingScreen'
import LoginScreen from './components/LoginScreen'
import AppErrorBoundary from './components/system/AppErrorBoundary'
import { useKernelStore } from './stores/useKernelStore'
import { useWindowStore } from './stores/windowStore'
import { DEFAULT_APPS } from './config/windows'
import { useApplySettings } from './features/settings/useApplySettings'

type AppState = 'loading' | 'login' | 'desktop';

function App() {
    useApplySettings()

    const initKernel = useKernelStore(state => state.initKernel)
    const processes = useKernelStore(state => state.processes)
    const closeWindow = useWindowStore(state => state.closeWindow)
    const [appState, setAppState] = useState<AppState>('loading');
    const managedAppIds = useMemo(() => new Set(DEFAULT_APPS.map((app) => app.id)), [])
    const previousRunningAppIdsRef = useRef<Set<string>>(new Set())

    useEffect(() => {
        initKernel()
    }, [initKernel])

    useEffect(() => {
        const runningAppIds = new Set(
            processes
                .map((process) => process.appId)
                .filter((appId): appId is string => Boolean(appId)),
        )

        previousRunningAppIdsRef.current.forEach((appId) => {
            if (managedAppIds.has(appId) && !runningAppIds.has(appId)) {
                closeWindow(appId)
            }
        })

        previousRunningAppIdsRef.current = runningAppIds
    }, [closeWindow, managedAppIds, processes])

    return (
        <AppErrorBoundary>
            <div className="h-screen w-screen overflow-hidden text-[var(--os-text-0)]">
                {appState === 'loading' && <LoadingScreen onComplete={() => setAppState('login')} />}
                {appState === 'login' && <LoginScreen onLogin={() => setAppState('desktop')} />}
                {appState === 'desktop' && <DesktopShell />}
            </div>
        </AppErrorBoundary>
    )
}

export default App
