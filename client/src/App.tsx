import { useState, useEffect, useMemo, useRef } from 'react'
import DesktopShell from './components/DesktopShell'
import LoadingScreen from './components/LoadingScreen'
import LoginScreen from './components/LoginScreen'
import AppErrorBoundary from './components/system/AppErrorBoundary'
import { useKernelStore } from './stores/useKernelStore'
import { useWindowStore } from './stores/windowStore'
import { DEFAULT_APPS } from './config/windows'
import { useApplySettings } from './features/settings/useApplySettings'
import { useSessionStore } from './stores/useSessionStore'
import { useSettingsStore } from './stores/settingsStore'
import { useFsStore } from './stores/fsStore'
import { HOME_PATH } from './stores/fs/initialState'

function App() {
    useApplySettings()

    const initKernel = useKernelStore(state => state.initKernel)
    const processes = useKernelStore(state => state.processes)
    const closeWindow = useWindowStore(state => state.closeWindow)
    const resetWindows = useWindowStore(state => state.resetWindows)
    const isLocked = useSessionStore((state) => state.isLocked)
    const lockSession = useSessionStore((state) => state.lockSession)
    const activeUserId = useSessionStore((state) => state.activeUserId)
    const hydrateSettings = useSettingsStore((state) => state.hydrateForActiveUser)
    const fsRefresh = useFsStore((state) => state.refresh)
    const fsNavigate = useFsStore((state) => state.navigate)
    const [isBootComplete, setBootComplete] = useState(false)
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

    useEffect(() => {
        if (!activeUserId) {
            return
        }

        hydrateSettings()
        fsNavigate(HOME_PATH)
        fsRefresh()
        resetWindows()
    }, [activeUserId, fsNavigate, fsRefresh, hydrateSettings, resetWindows])

    return (
        <AppErrorBoundary
            onResetDesktop={() => {
                resetWindows()
                lockSession()
            }}
        >
            <div className="h-screen w-screen overflow-hidden text-[var(--os-text-0)]">
                {!isBootComplete && <LoadingScreen onComplete={() => setBootComplete(true)} />}
                {isBootComplete && isLocked && <LoginScreen />}
                {isBootComplete && !isLocked && <DesktopShell />}
            </div>
        </AppErrorBoundary>
    )
}

export default App
