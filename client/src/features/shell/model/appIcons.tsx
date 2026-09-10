import { Activity, Download, FileText, FlaskConical, FolderOpen, Globe, Kanban, Settings, StickyNote, Store, Terminal, type LucideIcon } from 'lucide-react'

// Flat, single-tone glyphs (currentColor) replace the old rainbow-gradient
// candy-icon SVGs — design.md: one accent, no decorative gradients.
const ICON_MAP: Record<string, LucideIcon> = {
    appstore: Store,
    browser: Globe,
    explorer: FolderOpen,
    term: Terminal,
    taskmgr: Activity,
    settings: Settings,
    notes: StickyNote,
    docs: FileText,
    boards: Kanban,
    'os-lab': FlaskConical,
    downloads: Download,
}

export function ShellAppIcon({ appId, className }: { appId: string; className?: string }) {
    const Icon = ICON_MAP[appId] ?? Settings
    return <Icon className={className} strokeWidth={1.75} aria-hidden />
}
