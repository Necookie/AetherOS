import type { ComponentType } from 'react'

export interface DesktopWindowDef {
    id: string
    title: string
    component: ComponentType<{ onClose: () => void }>
    isOpen: boolean
}
