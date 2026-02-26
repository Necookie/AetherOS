import type { ComponentType } from 'react'

export interface WindowBounds {
    x: number
    y: number
    width: number
    height: number
}

export interface WindowState {
    isMinimized: boolean
    isMaximized: boolean
    isFocused: boolean
    previousBounds?: WindowBounds
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
