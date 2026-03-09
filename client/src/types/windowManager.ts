import type { ComponentType } from 'react'

export interface WindowBounds {
    x: number
    y: number
    width: number
    height: number
}

export type SnapMode = 'left-half' | 'right-half' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

export interface WindowState {
    isMinimized: boolean
    isMaximized: boolean
    isFocused: boolean
    previousBounds?: WindowBounds
    snapMode?: SnapMode
}

export interface WindowData {
    id: string
    title: string
    component: ComponentType<{ id: string }>
    bounds: WindowBounds
    state: WindowState
}

export interface AppDefinition {
    id: string
    title: string
    component: ComponentType<{ id: string }>
    defaultBounds?: WindowBounds
}
