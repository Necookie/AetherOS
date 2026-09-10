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
                className={highlights.has(index) ? 'rounded-xs bg-[rgba(0,102,204,0.16)] px-[0.05rem] text-ink' : undefined}
            >
                {character}
            </span>
        ))
    }

    const renderResultIcon = (item: CommandPaletteMatch) => {
        if (item.iconAppId) {
            return <ShellAppIcon appId={item.iconAppId ?? item.id} className="h-6 w-6" />
        }

        if (item.action.kind === 'lock-session') {
            return <Lock className="h-5 w-5 text-ink-muted-48" />
        }
        return <Search className="h-5 w-5 text-ink-muted-48" />
    }

    return (
        <div
            className={`absolute left-0 z-[var(--ds-z-flyout)] w-[min(38rem,calc(100vw-1.5rem))] rounded-lg border border-hairline bg-canvas p-3 ${taskbarPosition === 'top' ? 'top-[calc(var(--shell-topbar-height)+var(--shell-dock-height)+var(--shell-edge-gap)+0.5rem)]' : 'bottom-[calc(var(--shell-dock-height)+var(--shell-edge-gap)+0.5rem)]'}`}
        >
            <div className="mb-3 rounded-md border border-hairline bg-parchment p-4">
                <div className="mb-3 flex items-center justify-between">
                    <div>
                        <p className="text-[12px] text-ink-muted">AetherOS</p>
                        <h2 className="text-base font-semibold text-ink">Command Palette</h2>
                    </div>
                    <div className="flex items-center gap-2 rounded-pill border border-hairline bg-canvas px-3 py-1 text-[12px] text-ink-muted">
                        <Sparkles className="h-3.5 w-3.5" />
                        Keyboard-first
                    </div>
                </div>

                <label className="relative block">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
                    <input
                        ref={inputRef}
                        value={query}
                        onChange={(event) => onQueryChange(event.target.value)}
                        onKeyDown={onKeyDown}
                        aria-autocomplete="list"
                        aria-controls="aether-command-palette-results"
                        aria-activedescendant={activeItem ? `command-palette-item-${activeItem.id}` : undefined}
                        placeholder="Search apps, settings, and shell actions"
                        className="w-full rounded-pill border border-hairline bg-canvas py-3 pl-11 pr-4 text-sm text-ink outline-none placeholder:text-ink-muted focus:border-primary-focus focus:outline focus:outline-2 focus:outline-primary-focus"
                        type="search"
                    />
                </label>
                <div className="mt-3 flex items-center justify-between text-[12px] text-ink-muted">
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
                            className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                                isActive
                                    ? 'border-primary-focus bg-[rgba(0,102,204,0.06)]'
                                    : 'border-hairline bg-canvas hover:bg-parchment'
                            }`}
                        >
                            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-parchment text-ink">
                                {renderResultIcon(item)}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                    <p className="truncate text-sm font-semibold text-ink">{renderHighlightedText(item.title, item.titleHighlights)}</p>
                                    <span className="rounded-pill bg-parchment px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
                                        {item.kind}
                                    </span>
                                </div>
                                <p className="mt-0.5 truncate text-xs text-ink-muted">{renderHighlightedText(item.subtitle, item.subtitleHighlights)}</p>
                                <p className={`mt-1 text-[12px] ${item.status === 'running' ? 'text-primary' : item.status === 'minimized' ? 'text-ink-muted' : 'text-ink-muted-48'}`}>
                                    {statusLabel ?? item.metadata}
                                </p>
                            </div>
                            <div className="hidden text-[12px] text-ink-muted-48 sm:block">Enter</div>
                        </button>
                    )
                })}

                {launcherItems.length === 0 ? (
                    <div className="col-span-full rounded-lg border border-dashed border-hairline bg-parchment p-7 text-center">
                        <SearchX className="mx-auto h-5 w-5 text-ink-muted" />
                        <p className="mt-2 text-sm font-semibold text-ink">No results</p>
                        <p className="mt-1 text-xs text-ink-muted">{emptyMessage}</p>
                        <p className="mt-2 text-[12px] text-ink-muted-48">Try an app name, settings section, or command keyword</p>
                    </div>
                ) : null}
            </div>
        </div>
    )
}
