import { useMemo, useState } from 'react'
import { Palette, Monitor, Accessibility, SlidersHorizontal, RotateCcw } from 'lucide-react'
import Window from '../../components/system/Window'
import { WALLPAPER_OPTIONS } from '../../features/settings/defaults'
import { runAccessibilityChecks } from '../../features/settings/accessibilityChecks'
import { createThemeTokens, resolveWallpaper } from '../../features/settings/themeEngine'
import { useSettingsStore } from '../../stores/settingsStore'
import type { ThemePalette } from '../../features/settings/types'

type SettingsSection = 'appearance' | 'desktop' | 'accessibility' | 'behavior'

const sectionMeta: Array<{ id: SettingsSection; label: string; icon: typeof Palette }> = [
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'desktop', label: 'Desktop', icon: Monitor },
    { id: 'accessibility', label: 'Accessibility', icon: Accessibility },
    { id: 'behavior', label: 'Behavior', icon: SlidersHorizontal },
]

function SectionButton({
    active,
    label,
    onClick,
    icon: Icon,
}: {
    active: boolean
    label: string
    onClick: () => void
    icon: typeof Palette
}) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                active ? 'bg-[color-mix(in_oklab,var(--os-accent)_20%,white_80%)] text-slate-900' : 'text-slate-700 hover:bg-white/70'
            }`}
        >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
        </button>
    )
}

function SettingsToggle({
    label,
    checked,
    onChange,
}: {
    label: string
    checked: boolean
    onChange: (next: boolean) => void
}) {
    return (
        <label className="flex items-center justify-between gap-3 rounded-lg border border-white/60 bg-white/50 px-3 py-2 text-sm text-slate-800">
            <span>{label}</span>
            <input
                type="checkbox"
                checked={checked}
                onChange={(event) => onChange(event.target.checked)}
                className="h-4 w-4 accent-[var(--os-accent)]"
            />
        </label>
    )
}

function ColorField({
    label,
    keyName,
    value,
    onUpdate,
}: {
    label: string
    keyName: keyof ThemePalette
    value: string
    onUpdate: (key: keyof ThemePalette, value: string) => void
}) {
    return (
        <label className="flex items-center justify-between gap-3 rounded-lg border border-white/60 bg-white/50 px-3 py-2 text-sm text-slate-800">
            <span>{label}</span>
            <input
                aria-label={label}
                type="color"
                value={value}
                onChange={(event) => onUpdate(keyName, event.target.value)}
                className="h-8 w-10 cursor-pointer rounded border border-slate-300 bg-transparent"
            />
        </label>
    )
}

export default function SettingsApp({ id }: { id: string }) {
    const [section, setSection] = useState<SettingsSection>('appearance')
    const {
        appearance,
        desktop,
        accessibility,
        behavior,
        setThemeMode,
        updateCustomPalette,
        setWallpaper,
        setIconScale,
        setTaskbarPosition,
        setAccentStrength,
        setDensity,
        setFontScale,
        setHighContrast,
        setReducedMotion,
        setKeyboardHints,
        setAnimations,
        setTranslucentWindows,
        setShowSecondsInClock,
        resetSettings,
    } = useSettingsStore((state) => state)

    const tokens = useMemo(() => createThemeTokens({ appearance, desktop, accessibility, behavior }), [appearance, desktop, accessibility, behavior])
    const report = useMemo(() => runAccessibilityChecks(tokens), [tokens])
    const selectedWallpaper = resolveWallpaper(appearance.wallpaperId)

    return (
        <Window id={id} title="Settings">
            <div className="grid h-full grid-cols-[14rem_1fr]">
                <aside className="border-r border-white/60 bg-white/45 p-3">
                    <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600">Personalization</div>
                    <div className="space-y-1">
                        {sectionMeta.map(({ id: sectionId, label, icon }) => (
                            <SectionButton
                                key={sectionId}
                                label={label}
                                active={section === sectionId}
                                onClick={() => setSection(sectionId)}
                                icon={icon}
                            />
                        ))}
                    </div>
                    <button
                        onClick={resetSettings}
                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-white/60 bg-white/65 px-3 py-2 text-sm font-medium text-slate-800 hover:bg-white"
                    >
                        <RotateCcw className="h-4 w-4" />
                        Reset to defaults
                    </button>
                </aside>

                <section className="overflow-y-auto p-4">
                    {section === 'appearance' && (
                        <div className="space-y-4">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">Appearance</h2>
                                <p className="text-sm text-slate-600">Theme mode, palette, and wallpaper.</p>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                {(['light', 'dark', 'custom'] as const).map((mode) => (
                                    <button
                                        key={mode}
                                        onClick={() => setThemeMode(mode)}
                                        className={`rounded-lg border px-3 py-2 text-sm capitalize transition-colors ${appearance.themeMode === mode ? 'border-transparent bg-[var(--os-accent)] text-white' : 'border-white/70 bg-white/70 text-slate-700 hover:bg-white'}`}
                                    >
                                        {mode}
                                    </button>
                                ))}
                            </div>

                            {appearance.themeMode === 'custom' && (
                                <div className="grid grid-cols-2 gap-2">
                                    <ColorField label="Canvas" keyName="canvas" value={appearance.customPalette.canvas} onUpdate={(key, value) => updateCustomPalette({ [key]: value })} />
                                    <ColorField label="Surface" keyName="surface" value={appearance.customPalette.surface} onUpdate={(key, value) => updateCustomPalette({ [key]: value })} />
                                    <ColorField label="Border" keyName="border" value={appearance.customPalette.border} onUpdate={(key, value) => updateCustomPalette({ [key]: value })} />
                                    <ColorField label="Text" keyName="textPrimary" value={appearance.customPalette.textPrimary} onUpdate={(key, value) => updateCustomPalette({ [key]: value })} />
                                    <ColorField label="Muted text" keyName="textMuted" value={appearance.customPalette.textMuted} onUpdate={(key, value) => updateCustomPalette({ [key]: value })} />
                                    <ColorField label="Accent" keyName="accent" value={appearance.customPalette.accent} onUpdate={(key, value) => updateCustomPalette({ [key]: value })} />
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-800">Wallpaper</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {WALLPAPER_OPTIONS.map((option) => (
                                        <button
                                            key={option.id}
                                            onClick={() => setWallpaper(option.id)}
                                            className={`overflow-hidden rounded-lg border text-left ${appearance.wallpaperId === option.id ? 'border-[var(--os-accent)] ring-2 ring-[color-mix(in_oklab,var(--os-accent)_25%,transparent)]' : 'border-white/70'}`}
                                        >
                                            <div
                                                className="h-16"
                                                style={{
                                                    background: option.kind === 'image'
                                                        ? `linear-gradient(180deg, rgb(2 6 23 / 0.18), rgb(2 6 23 / 0.45)), url('${option.value}') center/cover no-repeat`
                                                        : option.value,
                                                }}
                                            />
                                            <div className="bg-white/70 px-2 py-1 text-xs text-slate-700">{option.label}</div>
                                        </button>
                                    ))}
                                </div>
                                <p className="text-xs text-slate-600">Selected: {selectedWallpaper.label}</p>
                            </div>
                        </div>
                    )}

                    {section === 'desktop' && (
                        <div className="space-y-4">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">Desktop</h2>
                                <p className="text-sm text-slate-600">Icon sizing, taskbar location, and accent strength.</p>
                            </div>

                            <label className="block space-y-2 rounded-lg border border-white/70 bg-white/55 p-3">
                                <span className="text-sm text-slate-800">Icon scale: {(desktop.iconScale * 100).toFixed(0)}%</span>
                                <input
                                    type="range"
                                    min={0.8}
                                    max={1.35}
                                    step={0.05}
                                    value={desktop.iconScale}
                                    onChange={(event) => setIconScale(Number(event.target.value))}
                                    className="h-1 w-full accent-[var(--os-accent)]"
                                />
                            </label>

                            <label className="block space-y-2 rounded-lg border border-white/70 bg-white/55 p-3">
                                <span className="text-sm text-slate-800">Accent strength: {(desktop.accentStrength * 100).toFixed(0)}%</span>
                                <input
                                    type="range"
                                    min={0.7}
                                    max={1.4}
                                    step={0.05}
                                    value={desktop.accentStrength}
                                    onChange={(event) => setAccentStrength(Number(event.target.value))}
                                    className="h-1 w-full accent-[var(--os-accent)]"
                                />
                            </label>

                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => setTaskbarPosition('bottom')}
                                    className={`rounded-lg border px-3 py-2 text-sm ${desktop.taskbarPosition === 'bottom' ? 'border-transparent bg-[var(--os-accent)] text-white' : 'border-white/70 bg-white/70 text-slate-700 hover:bg-white'}`}
                                >
                                    Taskbar bottom
                                </button>
                                <button
                                    onClick={() => setTaskbarPosition('top')}
                                    className={`rounded-lg border px-3 py-2 text-sm ${desktop.taskbarPosition === 'top' ? 'border-transparent bg-[var(--os-accent)] text-white' : 'border-white/70 bg-white/70 text-slate-700 hover:bg-white'}`}
                                >
                                    Taskbar top
                                </button>
                            </div>
                        </div>
                    )}

                    {section === 'accessibility' && (
                        <div className="space-y-4">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">Accessibility</h2>
                                <p className="text-sm text-slate-600">Density, typography, and keyboard usability.</p>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                {(['comfortable', 'cozy', 'compact'] as const).map((density) => (
                                    <button
                                        key={density}
                                        onClick={() => setDensity(density)}
                                        className={`rounded-lg border px-3 py-2 text-sm capitalize ${accessibility.density === density ? 'border-transparent bg-[var(--os-accent)] text-white' : 'border-white/70 bg-white/70 text-slate-700 hover:bg-white'}`}
                                    >
                                        {density}
                                    </button>
                                ))}
                            </div>

                            <label className="block space-y-2 rounded-lg border border-white/70 bg-white/55 p-3">
                                <span className="text-sm text-slate-800">Font scale: {(accessibility.fontScale * 100).toFixed(0)}%</span>
                                <input
                                    type="range"
                                    min={0.85}
                                    max={1.35}
                                    step={0.05}
                                    value={accessibility.fontScale}
                                    onChange={(event) => setFontScale(Number(event.target.value))}
                                    className="h-1 w-full accent-[var(--os-accent)]"
                                />
                            </label>

                            <div className="space-y-2">
                                <SettingsToggle label="High contrast" checked={accessibility.highContrast} onChange={setHighContrast} />
                                <SettingsToggle label="Reduced motion" checked={accessibility.reducedMotion} onChange={setReducedMotion} />
                                <SettingsToggle label="Keyboard hints + strong focus ring" checked={accessibility.keyboardHints} onChange={setKeyboardHints} />
                            </div>

                            <div className="rounded-lg border border-white/70 bg-white/60 p-3 text-sm text-slate-700">
                                <p className="font-medium text-slate-900">Accessibility checks</p>
                                <p className="mt-1">Contrast ratio: {report.contrastRatio.toFixed(2)} ({report.contrastPass ? 'pass' : 'fail'})</p>
                                <p>Keyboard focus visibility: {report.keyboardFocusPass ? 'pass' : 'fail'}</p>
                                <p>Keyboard target sizing: {report.keyboardTargetPass ? 'pass' : 'fail'}</p>
                            </div>
                        </div>
                    )}

                    {section === 'behavior' && (
                        <div className="space-y-4">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">Behavior</h2>
                                <p className="text-sm text-slate-600">Interaction and motion behavior across shell.</p>
                            </div>

                            <div className="space-y-2">
                                <SettingsToggle label="Enable animations" checked={behavior.animations} onChange={setAnimations} />
                                <SettingsToggle label="Translucent window effects" checked={behavior.translucentWindows} onChange={setTranslucentWindows} />
                                <SettingsToggle label="Show seconds in clock" checked={behavior.showSecondsInClock} onChange={setShowSecondsInClock} />
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </Window>
    )
}
