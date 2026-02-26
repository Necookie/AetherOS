import { useState, useEffect } from 'react'
import DesktopShell from './components/DesktopShell'
import LoadingScreen from './components/LoadingScreen'
import LoginScreen from './components/LoginScreen'
import { useKernelStore } from './stores/useKernelStore'

type AppState = 'loading' | 'login' | 'desktop';

function App() {
    const initKernel = useKernelStore(state => state.initKernel)
    const [appState, setAppState] = useState<AppState>('loading');

    useEffect(() => {
        initKernel()
    }, [initKernel])

    return (
        <div className="h-screen w-screen overflow-hidden bg-slate-50 text-gray-900 font-sans">
            {appState === 'loading' && <LoadingScreen onComplete={() => setAppState('login')} />}
            {appState === 'login' && <LoginScreen onLogin={() => setAppState('desktop')} />}
            {appState === 'desktop' && <DesktopShell />}
        </div>
    )
}

export default App
