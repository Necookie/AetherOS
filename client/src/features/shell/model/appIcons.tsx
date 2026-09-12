import {
    Activity,
    Code2,
    Download,
    FileText,
    FlaskConical,
    FolderOpen,
    Globe,
    Kanban,
    Mail,
    Settings,
    StickyNote,
    Store,
    Terminal,
    Blocks,
    type LucideIcon,
} from 'lucide-react'

export interface AppIconStyle {
    icon: LucideIcon
    bg: string
    text: string
    border?: string
}

export const APP_ICON_STYLES: Record<string, AppIconStyle> = {
    appstore: {
        icon: Store,
        bg: 'bg-[#0066cc]',
        text: 'text-white',
        border: 'border-[#0055b3]',
    },
    browser: {
        icon: Globe,
        bg: 'bg-[#0071e3]',
        text: 'text-white',
        border: 'border-[#005bb5]',
    },
    explorer: {
        icon: FolderOpen,
        bg: 'bg-[#0a84ff]',
        text: 'text-white',
        border: 'border-[#0070df]',
    },
    term: {
        icon: Terminal,
        bg: 'bg-[#1c1c1e]',
        text: 'text-[#30d158]',
        border: 'border-[#2c2c2e]',
    },
    taskmgr: {
        icon: Activity,
        bg: 'bg-[#242426]',
        text: 'text-[#34c759]',
        border: 'border-[#38383a]',
    },
    settings: {
        icon: Settings,
        bg: 'bg-[#636366]',
        text: 'text-white',
        border: 'border-[#48484a]',
    },
    notes: {
        icon: StickyNote,
        bg: 'bg-[#ff9f0a]',
        text: 'text-white',
        border: 'border-[#d98200]',
    },
    docs: {
        icon: FileText,
        bg: 'bg-[#0066cc]',
        text: 'text-white',
        border: 'border-[#0055b3]',
    },
    boards: {
        icon: Kanban,
        bg: 'bg-[#5e5ce6]',
        text: 'text-white',
        border: 'border-[#4b48b8]',
    },
    'os-lab': {
        icon: FlaskConical,
        bg: 'bg-[#32ade6]',
        text: 'text-white',
        border: 'border-[#208bbd]',
    },
    downloads: {
        icon: Download,
        bg: 'bg-[#34c759]',
        text: 'text-white',
        border: 'border-[#248a3d]',
    },
    mail: {
        icon: Mail,
        bg: 'bg-[#007aff]',
        text: 'text-white',
        border: 'border-[#0062cc]',
    },
    devtools: {
        icon: Code2,
        bg: 'bg-[#3a3a3c]',
        text: 'text-[#ffd60a]',
        border: 'border-[#48484a]',
    },
    tetris: {
        icon: Blocks,
        bg: 'bg-[#172333]',
        text: 'text-[#48c6e8]',
        border: 'border-[#2a3d52]',
    },
}

import { APP_ICON_COMPONENTS, GenericAppIcon } from '../components/icons/AppIcons'

export type ShellAppIconSize = 'xs' | 'sm' | 'md' | 'dock' | 'lg' | 'xl'

const SIZES: Record<ShellAppIconSize, string> = {
    xs: 'h-5 w-5',
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    dock: 'h-9 w-9',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
}

export function ShellAppIcon({
    appId,
    className,
    variant = 'tile',
    size = 'md',
}: {
    appId: string
    className?: string
    variant?: 'glyph' | 'tile'
    size?: ShellAppIconSize
}) {
    if (variant === 'glyph') {
        const style = APP_ICON_STYLES[appId] ?? {
            icon: Settings,
            bg: 'bg-[#636366]',
            text: 'text-white',
            border: 'border-[#48484a]',
        }
        const Icon = style.icon
        return <Icon className={className} strokeWidth={1.75} aria-hidden />
    }

    const AppIconComponent = APP_ICON_COMPONENTS[appId] ?? GenericAppIcon
    const sizeClass = SIZES[size] ?? SIZES.md

    return (
        <div className={`relative shrink-0 select-none flex items-center justify-center ${sizeClass} ${className ?? ''}`} aria-hidden>
            <AppIconComponent className="w-full h-full" />
        </div>
    )
}
