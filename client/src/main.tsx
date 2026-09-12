import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Automatically reload when a dynamic chunk import fails due to a new deployment
window.addEventListener('vite:preloadError', (event) => {
    console.warn('Vite preload error detected, reloading page to fetch latest deployment...', event)
    window.location.reload()
})

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
