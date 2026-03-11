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
import { getActiveAccount } from './features/accounts/services/sessionSelectors'

function App() {
    useApplySettings()

    const initKernel = useKernelStore(state => state.initKernel)
    const processes = useKernelStore(state => state.processes)
    const closeWindowImmediate = useWindowStore(state => state.closeWindowImmediate)
    const resetWindows = useWindowStore(state => state.resetWindows)
    const isLocked = useSessionStore((state) => state.isLocked)
    const lockSession = useSessionStore((state) => state.lockSession)
    const activeUserId = useSessionStore((state) => state.activeUserId)
    const sessionAccounts = useSessionStore((state) => state.accounts)
    const hydrateSettings = useSettingsStore((state) => state.hydrateForActiveUser)
    const fsRefresh = useFsStore((state) => state.refresh)
    const fsNavigate = useFsStore((state) => state.navigate)
    const [isBootComplete, setBootComplete] = useState(false)
    const managedAppIds = useMemo(() => new Set(DEFAULT_APPS.map((app) => app.id)), [])
    const previousRunningAppIdsRef = useRef<Set<string>>(new Set())
    const activeAccount = useMemo(
        () => getActiveAccount({ activeUserId, accounts: sessionAccounts }),
        [activeUserId, sessionAccounts],
    )

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
                closeWindowImmediate(appId)
            }
        })

        previousRunningAppIdsRef.current = runningAppIds
    }, [closeWindowImmediate, managedAppIds, processes])

    useEffect(() => {
        if (!activeUserId) {
            return
        }

        hydrateSettings()
        fsNavigate(HOME_PATH)
        fsRefresh()
        resetWindows()
    }, [activeUserId, fsNavigate, fsRefresh, hydrateSettings, resetWindows])

    const shouldShowLogin = isBootComplete && (isLocked || !activeAccount)

    return (
        <AppErrorBoundary
            onResetDesktop={() => {
                resetWindows()
                lockSession()
            }}
        >
            <div className="h-screen w-screen overflow-hidden text-[var(--os-text-0)]">
                <div className="pointer-events-none fixed left-3 top-3 z-[10000] max-w-[22rem] rounded-lg border border-black/20 bg-black/75 px-3 py-2 font-term text-[11px] leading-5 text-white shadow-lg">
                    <div>debug.bootComplete: {String(isBootComplete)}</div>
                    <div>debug.isLocked: {String(isLocked)}</div>
                    <div>debug.activeUserId: {activeUserId ?? 'null'}</div>
                    <div>debug.activeAccount: {activeAccount?.id ?? 'null'}</div>
                    <div>debug.showLogin: {String(shouldShowLogin)}</div>
                    <div>debug.showDesktop: {String(isBootComplete && !shouldShowLogin)}</div>
                    <div>debug.processes: {processes.length}</div>
                </div>
                {!isBootComplete && <LoadingScreen onComplete={() => setBootComplete(true)} />}
                {shouldShowLogin && <LoginScreen />}
                {isBootComplete && !shouldShowLogin && <DesktopShell />}
            </div>
        </AppErrorBoundary>
    )
}

export default App
