import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { Lock, Search, SearchX, Sparkles } from 'lucide-react'
import { ShellAppIcon } from '../model/appIcons'
import { useWindowStore } from '../../../stores/windowStore'
import {
    executeCommandPaletteAction,
    getCommandPaletteEmptyMessage,
    getCommandPaletteResultCountLabel,
    getCommandPaletteResults,
    getNextCommandPaletteIndex,
    type CommandPaletteExecutor,
    type CommandPaletteMatch,
} from '../model/commandPalette'
import { getLauncherStatusLabel } from '../model/launcher'

interface AppLauncherProps {
    taskbarPosition: 'bottom' | 'top'
    query: string
    onQueryChange: (nextValue: string) => void
    onClose: () => void
    executor: CommandPaletteExecutor
}

export default function AppLauncher({
    taskbarPosition,
    query,
    onQueryChange,
    onClose,
    executor,
}: AppLauncherProps) {
    const windows = useWindowStore((state) => state.windows)
    const inputRef = useRef<HTMLInputElement>(null)
    const resultRefs = useRef<Array<HTMLButtonElement | null>>([])
    const launcherItems = useMemo(() => getCommandPaletteResults(query, windows), [query, windows])
    const emptyMessage = getCommandPaletteEmptyMessage(query)
    const [activeIndex, setActiveIndex] = useState(() => (launcherItems.length > 0 ? 0 : -1))

    useEffect(() => {
        inputRef.current?.focus()
    }, [])

    useEffect(() => {
        setActiveIndex(launcherItems.length > 0 ? 0 : -1)
        resultRefs.current = resultRefs.current.slice(0, launcherItems.length)
    }, [launcherItems.length, query])

    useEffect(() => {
        if (activeIndex < 0) {
            return
        }

        resultRefs.current[activeIndex]?.scrollIntoView({ block: 'nearest' })
    }, [activeIndex])

    const executeItem = (item: CommandPaletteMatch) => {
        const handled = executeCommandPaletteAction(item.action, executor)
        if (handled) {
            onClose()
        }
    }

    const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'ArrowDown') {
            event.preventDefault()
            setActiveIndex((current) => getNextCommandPaletteIndex(current, 1, launcherItems.length))
            return
        }

        if (event.key === 'ArrowUp') {
            event.preventDefault()
            setActiveIndex((current) => getNextCommandPaletteIndex(current, -1, launcherItems.length))
            return
        }

        if (event.key === 'Enter') {
            const item = launcherItems[activeIndex] ?? launcherItems[0]
            if (!item) {
                return
            }

            event.preventDefault()
            executeItem(item)
            return
        }

        if (event.key === 'Escape') {
            event.preventDefault()
            onClose()
        }
    }

    const activeItem = activeIndex >= 0 ? launcherItems[activeIndex] : null

    const renderHighlightedText = (text: string, positions: number[]) => {
        if (positions.length === 0) {
            return text
        }

        const highlights = new Set(positions)
        return text.split('').map((character, index) => (
            <span
                key={`${text}-${index}`}
                className={highlights.has(index) ? 'rounded-[0.3rem] bg-[color-mix(in_oklab,var(--os-accent)_18%,white_72%)] px-[0.05rem] text-slate-950' : undefined}
            >
                {character}
            </span>
        ))
    }

    const renderResultIcon = (item: CommandPaletteMatch) => {
        if (item.iconAppId) {
            return <ShellAppIcon appId={item.iconAppId ?? item.id} className="h-8 w-8" />
        }

        if (item.action.kind === 'lock-session') {
            return <Lock className="h-5 w-5 text-slate-700" />
        }
        return <Search className="h-5 w-5 text-slate-700" />
    }

    return (
        <div
            className={`animate-os-flyout-in absolute left-0 z-[var(--ds-z-flyout)] w-[min(38rem,calc(100vw-1.5rem))] rounded-[1.75rem] p-3 backdrop-blur-2xl ${taskbarPosition === 'top' ? 'top-[calc(var(--shell-topbar-height)+var(--shell-dock-height)+var(--shell-edge-gap)+0.5rem)]' : 'bottom-[calc(var(--shell-dock-height)+var(--shell-edge-gap)+0.5rem)]'}`}
            style={{
                background: 'linear-gradient(180deg, rgb(255 255 255 / 0.64), rgb(241 245 249 / 0.4))',
                border: '1px solid rgb(255 255 255 / 0.58)',
                boxShadow: '0 26px 64px rgb(15 23 42 / 0.32)',
            }}
        >
            <div className="mb-3 rounded-[1.35rem] border border-white/55 bg-[linear-gradient(180deg,rgb(255_255_255_/_0.7),rgb(255_255_255_/_0.42))] p-4">
                <div className="mb-3 flex items-center justify-between">
                    <div>
                        <p className="text-[11px] uppercase tracking-[0.16em] text-slate-600">AetherOS</p>
                        <h2 className="text-base font-semibold text-slate-900">Command Palette</h2>
                    </div>
                    <div className="flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-slate-600">
                        <Sparkles className="h-3.5 w-3.5" />
                        Keyboard-first
                    </div>
                </div>

                <label className="relative block">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ds-color-text-muted)]" />
                    <input
                        ref={inputRef}
                        value={query}
                        onChange={(event) => onQueryChange(event.target.value)}
                        onKeyDown={onKeyDown}
                        aria-autocomplete="list"
                        aria-controls="aether-command-palette-results"
                        aria-activedescendant={activeItem ? `command-palette-item-${activeItem.id}` : undefined}
                        placeholder="Search apps, settings, and shell actions"
                        className="w-full rounded-2xl border border-white/65 bg-white/85 py-3 pl-10 pr-3 text-sm text-slate-900 outline-none placeholder:text-slate-500 focus:border-white"
                        type="search"
                    />
                </label>
                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-600">
                    <span>Enter to open, arrows to navigate, Escape to close</span>
                    <span>{getCommandPaletteResultCountLabel(launcherItems.length)}</span>
                </div>
            </div>

            <div
                id="aether-command-palette-results"
                role="listbox"
                aria-label="Command palette results"
                className="grid max-h-[24rem] grid-cols-1 gap-2 overflow-y-auto pr-1"
            >
                {launcherItems.map((item, index) => {
                    const statusLabel = item.status ? getLauncherStatusLabel(item.status) : null
                    const isActive = index === activeIndex
                    return (
                        <button
                            key={item.id}
                            id={`command-palette-item-${item.id}`}
                            type="button"
                            ref={(element) => {
                                resultRefs.current[index] = element
                            }}
                            role="option"
                            aria-selected={isActive}
                            onMouseEnter={() => setActiveIndex(index)}
                            onClick={() => executeItem(item)}
                            className={`os-interactive flex items-center gap-3 rounded-2xl border p-3 text-left transition-colors ${
                                isActive
                                    ? 'border-[color-mix(in_oklab,var(--os-accent)_32%,white_48%)] bg-[linear-gradient(135deg,rgb(255_255_255_/_0.96),rgb(226_232_240_/_0.88))] shadow-[0_12px_30px_rgb(15_23_42_/_0.12)]'
                                    : 'border-white/55 bg-white/42 hover:bg-white/68'
                            }`}
                        >
                            <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${isActive ? 'bg-white' : 'bg-white/72'}`}>
                                {renderResultIcon(item)}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                    <p className="truncate text-sm font-medium text-slate-900">{renderHighlightedText(item.title, item.titleHighlights)}</p>
                                    <span className="rounded-full bg-white/75 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-600">
                                        {item.kind}
                                    </span>
                                </div>
                                <p className="mt-0.5 truncate text-xs text-slate-600">{renderHighlightedText(item.subtitle, item.subtitleHighlights)}</p>
                                <p className={`mt-1 text-[11px] ${item.status === 'running' ? 'text-emerald-700' : item.status === 'minimized' ? 'text-amber-700' : 'text-slate-500'}`}>
                                    {statusLabel ?? item.metadata}
                                </p>
                            </div>
                            <div className="hidden text-[11px] text-slate-500 sm:block">Enter</div>
                        </button>
                    )
                })}

                {launcherItems.length === 0 ? (
                    <div className="col-span-full rounded-2xl border border-dashed border-white/60 bg-[linear-gradient(180deg,rgb(255_255_255_/_0.52),rgb(255_255_255_/_0.3))] p-7 text-center">
                        <SearchX className="mx-auto h-5 w-5 text-slate-600" />
                        <p className="mt-2 text-sm font-medium text-slate-800">No results</p>
                        <p className="mt-1 text-xs text-slate-600">{emptyMessage}</p>
                        <p className="mt-2 text-[11px] uppercase tracking-[0.12em] text-slate-500">Try an app name, settings section, or command keyword</p>
                    </div>
                ) : null}
            </div>
        </div>
    )
}
