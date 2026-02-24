import { useEffect } from 'react'
import DesktopShell from './components/DesktopShell'
import { useKernelStore } from './stores/useKernelStore'

function App() {
    const initKernel = useKernelStore(state => state.initKernel)

    useEffect(() => {
        initKernel()
    }, [initKernel])

    return (
        <div className="h-screen w-screen overflow-hidden bg-gray-900 text-white font-sans">
            <DesktopShell />
        </div>
    )
}

export default App
