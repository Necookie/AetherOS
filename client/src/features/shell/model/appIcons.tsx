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
}

const TILE_SIZES = {
    sm: { container: 'h-8 w-8 rounded-md', iconSize: 16 },
    md: { container: 'h-10 w-10 rounded-lg', iconSize: 20 },
    lg: { container: 'h-12 w-12 rounded-xl', iconSize: 24 },
    xl: { container: 'h-14 w-14 rounded-2xl', iconSize: 28 },
} as const

export function ShellAppIcon({
    appId,
    className,
    variant = 'glyph',
    size = 'md',
}: {
    appId: string
    className?: string
    variant?: 'glyph' | 'tile'
    size?: 'sm' | 'md' | 'lg' | 'xl'
}) {
    const style = APP_ICON_STYLES[appId] ?? {
        icon: Settings,
        bg: 'bg-[#636366]',
        text: 'text-white',
        border: 'border-[#48484a]',
    }
    const Icon = style.icon

    if (variant === 'tile') {
        const sizing = TILE_SIZES[size]
        return (
            <div
                className={`relative flex shrink-0 items-center justify-center border shadow-xs select-none ${sizing.container} ${style.bg} ${style.text} ${style.border ?? 'border-black/10'} ${className ?? ''}`}
                aria-hidden
            >
                <Icon size={sizing.iconSize} strokeWidth={2} />
            </div>
        )
    }

    return <Icon className={className} strokeWidth={1.75} aria-hidden />
}
