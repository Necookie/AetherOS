import { useEffect, useMemo, useRef, useState } from 'react'
import { Palette, Monitor, Accessibility, SlidersHorizontal, RotateCcw, Keyboard, Shield, Upload, Trash2, Package, Search, ShieldCheck } from 'lucide-react'
import Window from '../../components/system/Window'
import { getActiveAccount } from '../../features/accounts/services/sessionSelectors'
import { WALLPAPER_OPTIONS } from '../../features/settings/defaults'
import { runAccessibilityChecks } from '../../features/settings/accessibilityChecks'
import { notificationService } from '../../features/notifications/notificationStore'
import { formatPermissionRevokedMessage } from '../../features/permissions/messages'
import { permissionService } from '../../features/permissions/permissionService'
import { createThemeTokens, resolveWallpaper } from '../../features/settings/themeEngine'
import { useDeepLinkIntentStore } from '../../features/deep-links/store'
import { useSettingsStore } from '../../stores/settingsStore'
import { useSessionStore } from '../../stores/useSessionStore'
import { useWindowStore } from '../../stores/windowStore'
import { ShellAppIcon } from '../../features/shell/model/appIcons'
import { DEFAULT_APPS } from '../../config/windows'
import { registryService, useAppRegistryStore } from '../../stores/appRegistryStore'
import type { PermissionId } from '../../features/permissions/types'
import type { ThemePalette } from '../../features/settings/types'
import { SYSTEM_APP_IDS } from '../../features/app-registry/catalog'
import type { SettingsSection } from '../../features/deep-links/types'
import {
    REMAPPABLE_SHORTCUTS,
    resolveShortcutKeymap,
    SHORTCUT_ACTION_IDS,
    validateShortcutOverrides,
} from '../../features/shortcuts/shortcutConfig'

const sectionMeta: Array<{ id: SettingsSection; label: string; icon: typeof Palette }> = [
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'desktop', label: 'Desktop', icon: Monitor },
    { id: 'apps', label: 'Applications', icon: Package },
    { id: 'accessibility', label: 'Accessibility', icon: Accessibility },
    { id: 'behavior', label: 'Behavior', icon: SlidersHorizontal },
    { id: 'shortcuts', label: 'Shortcuts', icon: Keyboard },
    { id: 'permissions', label: 'Permissions', icon: Shield },
]

const SHORTCUT_LABELS: Record<string, string> = {
    [SHORTCUT_ACTION_IDS.launcherToggle]: 'Toggle launcher',
    [SHORTCUT_ACTION_IDS.openTaskManager]: 'Open Task Manager',
    [SHORTCUT_ACTION_IDS.openTerminal]: 'Open Terminal',
    [SHORTCUT_ACTION_IDS.closeFocusedWindow]: 'Close focused window',
    [SHORTCUT_ACTION_IDS.minimizeFocusedWindow]: 'Minimize focused window',
    [SHORTCUT_ACTION_IDS.maximizeFocusedWindow]: 'Maximize focused window',
}

// Segmented-control pill shared by theme mode / taskbar position / density.
function segmentClass(active: boolean) {
    return `rounded-md border px-3 py-2 text-sm capitalize transition-colors ${active ? 'border-transparent bg-primary text-white' : 'border-hairline bg-canvas text-ink-muted hover:bg-parchment'}`
}

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
            className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                active ? 'bg-[rgba(0,102,204,0.1)] text-ink' : 'text-ink-muted hover:bg-canvas'
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
        <label className="flex items-center justify-between gap-3 rounded-md border border-hairline bg-parchment px-3 py-2 text-sm text-ink">
            <span>{label}</span>
            <input
                type="checkbox"
                checked={checked}
                onChange={(event) => onChange(event.target.checked)}
                className="h-4 w-4 accent-primary"
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
        <label className="flex items-center justify-between gap-3 rounded-md border border-hairline bg-parchment px-3 py-2 text-sm text-ink">
            <span>{label}</span>
            <input
                aria-label={label}
                type="color"
                value={value}
                onChange={(event) => onUpdate(keyName, event.target.value)}
                className="h-8 w-10 cursor-pointer rounded-sm border border-hairline bg-transparent"
            />
        </label>
    )
}

export default function SettingsApp({ id }: { id: string }) {
    const [section, setSection] = useState<SettingsSection>('appearance')
    const [shortcutDrafts, setShortcutDrafts] = useState<Record<string, string>>({})
    const [permissionsVersion, setPermissionsVersion] = useState(0)
    const settingsIntent = useDeepLinkIntentStore((state) => state.settings)
    const activeUserId = useSessionStore((state) => state.activeUserId)
    const accounts = useSessionStore((state) => state.accounts)
    const {
        appearance,
        desktop,
        accessibility,
        behavior,
        shortcuts,
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
        setShortcutOverride,
        clearShortcutOverride,
        resetSettings,
        customWallpapers,
        addCustomWallpaper,
        removeCustomWallpaper,
    } = useSettingsStore((state) => state)
    const activeAccount = getActiveAccount({
        activeUserId,
        accounts,
    })

    const tokens = useMemo(
        () => createThemeTokens({ appearance, desktop, accessibility, behavior, shortcuts }),
        [appearance, desktop, accessibility, behavior, shortcuts],
    )
    const report = useMemo(() => runAccessibilityChecks(tokens), [tokens])
    const selectedWallpaper = resolveWallpaper(appearance.wallpaperId)
    const resolvedShortcutKeymap = useMemo(() => resolveShortcutKeymap(shortcuts.overrides), [shortcuts.overrides])
    const shortcutValidation = useMemo(() => validateShortcutOverrides(shortcuts.overrides), [shortcuts.overrides])
    const permissionStatuses = useMemo(() => {
        void permissionsVersion
        if (!activeUserId) {
            return []
        }

        return permissionService.listPermissionStatuses(activeUserId)
    }, [activeUserId, permissionsVersion])

    const { installed, uninstallApp, operations } = useAppRegistryStore((state) => ({
        installed: state.installed,
        uninstallApp: state.uninstallApp,
        operations: state.operations,
    }))
    const openWindow = useWindowStore((state) => state.openWindow)
    const [appSearch, setAppSearch] = useState('')
    const [confirmUninstallId, setConfirmUninstallId] = useState<string | null>(null)

    const allCatalogApps = useMemo(() => registryService.listAvailable(), [])
    const filteredApps = useMemo(() => {
        const query = appSearch.trim().toLowerCase()
        return allCatalogApps.filter((app) => {
            if (!query) return true
            return (
                app.title.toLowerCase().includes(query) ||
                app.summary.toLowerCase().includes(query) ||
                app.category.toLowerCase().includes(query) ||
                app.id.toLowerCase().includes(query)
            )
        })
    }, [allCatalogApps, appSearch])

    const fileInputRef = useRef<HTMLInputElement>(null)
    const [uploadError, setUploadError] = useState<string | null>(null)
    const [isUploading, setIsUploading] = useState(false)

    const handleWallpaperUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return
        if (!file.type.startsWith('image/')) {
            setUploadError('Please select a valid image file (PNG, JPG, WebP).')
            return
        }
        setUploadError(null)
        setIsUploading(true)
        try {
            await addCustomWallpaper(file)
        } catch (err) {
            setUploadError((err as Error).message || 'Failed to upload wallpaper.')
        } finally {
            setIsUploading(false)
            if (event.target) {
                event.target.value = ''
            }
        }
    }

    useEffect(() => {
        const drafts: Record<string, string> = {}
        REMAPPABLE_SHORTCUTS.forEach((actionId) => {
            drafts[actionId] = shortcuts.overrides[actionId] ?? resolvedShortcutKeymap[actionId]
        })
        setShortcutDrafts(drafts)
    }, [resolvedShortcutKeymap, shortcuts.overrides])

    useEffect(() => {
        if (!settingsIntent) {
            return
        }

        setSection(settingsIntent.payload.section)
    }, [settingsIntent])

    const applyShortcutDraft = (actionId: (typeof REMAPPABLE_SHORTCUTS)[number], value: string) => {
        const combo = value.trim()
        if (!combo) {
            clearShortcutOverride(actionId)
            return true
        }

        return setShortcutOverride(actionId, combo)
    }

    const revokePermission = (permission: PermissionId) => {
        if (!activeUserId) {
            return
        }

        permissionService.revoke(activeUserId, permission)
        setPermissionsVersion((current) => current + 1)
        notificationService.publish({
            title: 'Permission revoked',
            message: formatPermissionRevokedMessage(permission),
            source: 'Permissions',
            priority: 'normal',
            groupKey: 'permissions',
        })
    }

    return (
        <Window id={id} title="Settings">
            <div className="grid h-full grid-cols-[14rem_1fr] bg-canvas">
                <aside className="border-r border-hairline bg-parchment p-3">
                    <div className="mb-3 text-[12px] font-semibold text-ink-muted">Personalization</div>
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
                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-pill border border-primary px-3 py-2 text-sm font-semibold text-primary transition-transform active:scale-95"
                    >
                        <RotateCcw className="h-4 w-4" />
                        Reset to defaults
                    </button>
                </aside>

                <section className="overflow-y-auto p-4">
                    {section === 'appearance' && (
                        <div className="space-y-4">
                            <div>
                                <h2 className="text-lg font-semibold text-ink">Appearance</h2>
                                <p className="text-sm text-ink-muted">Theme mode, palette, and wallpaper.</p>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                {(['light', 'dark', 'custom'] as const).map((mode) => (
                                    <button
                                        key={mode}
                                        onClick={() => setThemeMode(mode)}
                                        className={segmentClass(appearance.themeMode === mode)}
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

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-semibold text-ink">Wallpaper</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleWallpaperUpload}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={isUploading}
                                            className="flex items-center gap-1.5 rounded-md border border-hairline bg-canvas px-2.5 py-1 text-xs font-medium text-ink transition-colors hover:bg-parchment active:scale-95 disabled:opacity-50"
                                        >
                                            <Upload className="h-3.5 w-3.5" />
                                            {isUploading ? 'Uploading...' : 'Upload Wallpaper'}
                                        </button>
                                    </div>
                                </div>

                                {uploadError && (
                                    <p className="text-xs text-danger">{uploadError}</p>
                                )}

                                <div className="grid grid-cols-3 gap-2.5">
                                    {[...WALLPAPER_OPTIONS, ...customWallpapers].map((option) => {
                                        const isCustom = option.id.startsWith('custom-')
                                        const isSelected = appearance.wallpaperId === option.id

                                        return (
                                            <div
                                                key={option.id}
                                                className={`group relative overflow-hidden rounded-md border text-left transition-all ${
                                                    isSelected ? 'border-primary-focus ring-1 ring-primary-focus' : 'border-hairline hover:border-ink-muted/50'
                                                }`}
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() => setWallpaper(option.id)}
                                                    className="block w-full text-left"
                                                >
                                                    <div
                                                        className="h-16 w-full"
                                                        style={{
                                                            background: option.kind === 'image'
                                                                ? `linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.35)), url('${option.value}') center/cover no-repeat`
                                                                : option.value,
                                                        }}
                                                    />
                                                    <div className="flex items-center justify-between bg-parchment px-2 py-1 text-xs text-ink-muted">
                                                        <span className="truncate">{option.label}</span>
                                                        {isCustom && (
                                                            <span className="ml-1 rounded bg-canvas px-1 text-[10px] text-ink-muted-48 border border-hairline">
                                                                Custom
                                                            </span>
                                                        )}
                                                    </div>
                                                </button>

                                                {isCustom && (
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            void removeCustomWallpaper(option.id)
                                                        }}
                                                        className="absolute right-1.5 top-1.5 rounded bg-black/60 p-1 text-white opacity-0 transition-opacity hover:bg-danger group-hover:opacity-100"
                                                        title="Delete custom wallpaper"
                                                        aria-label="Delete custom wallpaper"
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </button>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                                <p className="text-xs text-ink-muted">Selected: {selectedWallpaper.label}</p>
                            </div>
                        </div>
                    )}

                    {section === 'desktop' && (
                        <div className="space-y-4">
                            <div>
                                <h2 className="text-lg font-semibold text-ink">Desktop</h2>
                                <p className="text-sm text-ink-muted">Icon sizing, taskbar location, and accent strength.</p>
                            </div>

                            <label className="block space-y-2 rounded-md border border-hairline bg-parchment p-3">
                                <span className="text-sm text-ink">Icon scale: {(desktop.iconScale * 100).toFixed(0)}%</span>
                                <input
                                    type="range"
                                    min={0.8}
                                    max={1.35}
                                    step={0.05}
                                    value={desktop.iconScale}
                                    onChange={(event) => setIconScale(Number(event.target.value))}
                                    className="h-1 w-full accent-primary"
                                />
                            </label>

                            <label className="block space-y-2 rounded-md border border-hairline bg-parchment p-3">
                                <span className="text-sm text-ink">Accent strength: {(desktop.accentStrength * 100).toFixed(0)}%</span>
                                <input
                                    type="range"
                                    min={0.7}
                                    max={1.4}
                                    step={0.05}
                                    value={desktop.accentStrength}
                                    onChange={(event) => setAccentStrength(Number(event.target.value))}
                                    className="h-1 w-full accent-primary"
                                />
                            </label>

                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => setTaskbarPosition('bottom')}
                                    className={segmentClass(desktop.taskbarPosition === 'bottom')}
                                >
                                    Taskbar bottom
                                </button>
                                <button
                                    onClick={() => setTaskbarPosition('top')}
                                    className={segmentClass(desktop.taskbarPosition === 'top')}
                                >
                                    Taskbar top
                                </button>
                            </div>
                        </div>
                    )}

                    {section === 'apps' && (
                        <div className="space-y-4">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <h2 className="text-lg font-semibold text-ink">Applications</h2>
                                    <p className="text-sm text-ink-muted">Manage installed applications and system components.</p>
                                </div>
                                <button
                                    onClick={() => {
                                        const appStoreDef = DEFAULT_APPS.find((a) => a.id === 'appstore')
                                        if (appStoreDef) openWindow(appStoreDef)
                                    }}
                                    className="inline-flex items-center gap-1.5 rounded-pill bg-primary px-3 py-1.5 text-xs font-semibold text-white transition-all hover:opacity-90 active:scale-95"
                                >
                                    <Package className="h-3.5 w-3.5" />
                                    Open App Store
                                </button>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="relative flex-1">
                                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted-48" />
                                    <input
                                        type="search"
                                        placeholder="Search installed applications..."
                                        value={appSearch}
                                        onChange={(e) => setAppSearch(e.target.value)}
                                        className="w-full rounded-pill border border-hairline bg-canvas py-1.5 pl-9 pr-3 text-sm text-ink placeholder:text-ink-muted-48 focus:border-primary-focus focus:outline-none"
                                    />
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-ink-muted">
                                    <span className="rounded-pill border border-hairline bg-parchment px-2.5 py-1">
                                        {Object.keys(installed).length} Installed
                                    </span>
                                    <span className="rounded-pill border border-hairline bg-parchment px-2.5 py-1">
                                        {SYSTEM_APP_IDS.length} System
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-2.5">
                                {filteredApps.map((app) => {
                                    const installedApp = installed[app.id]
                                    const isSystem = (SYSTEM_APP_IDS as readonly string[]).includes(app.id)
                                    const operation = operations[app.id]
                                    const isBusy = operation && ['installing', 'updating', 'removing'].includes(operation.state)
                                    const isConfirming = confirmUninstallId === app.id
                                    const latestVersion = registryService.getLatestVersion(app.id) ?? '1.0.0'
                                    const appDef = DEFAULT_APPS.find((a) => a.id === app.id)

                                    return (
                                        <article
                                            key={app.id}
                                            className="flex flex-col gap-3 rounded-lg border border-hairline bg-parchment p-3 transition-colors sm:flex-row sm:items-center sm:justify-between"
                                        >
                                            <div className="flex items-center gap-3">
                                                <ShellAppIcon appId={app.id} variant="tile" size="md" />
                                                <div>
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <h3 className="text-sm font-semibold text-ink">{app.title}</h3>
                                                        {isSystem ? (
                                                            <span className="inline-flex items-center gap-1 rounded-pill border border-sky-200 bg-sky-50 px-2 py-0.5 text-[10px] font-semibold text-[#0066cc]">
                                                                <ShieldCheck className="h-3 w-3" /> Built-in
                                                            </span>
                                                        ) : installedApp ? (
                                                            <span className="rounded-pill border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                                                                Installed
                                                            </span>
                                                        ) : (
                                                            <span className="rounded-pill border border-hairline bg-canvas px-2 py-0.5 text-[10px] text-ink-muted">
                                                                Not installed
                                                            </span>
                                                        )}
                                                        <span className="rounded-pill border border-hairline bg-canvas px-2 py-0.5 text-[10px] uppercase tracking-wider text-ink-muted-48">
                                                            {app.category}
                                                        </span>
                                                    </div>
                                                    <p className="mt-0.5 text-xs text-ink-muted">{app.summary}</p>
                                                    <p className="mt-1 text-[11px] text-ink-muted-48">
                                                        Version: {installedApp ? installedApp.version : latestVersion}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 sm:self-center">
                                                {isSystem ? (
                                                    <span
                                                        className="cursor-not-allowed select-none rounded-md border border-hairline bg-canvas px-3 py-1.5 text-xs text-ink-muted-48"
                                                        title="Built-in system components cannot be uninstalled"
                                                    >
                                                        Protected
                                                    </span>
                                                ) : installedApp ? (
                                                    isConfirming ? (
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-xs font-medium text-danger">Uninstall?</span>
                                                            <button
                                                                onClick={async () => {
                                                                    setConfirmUninstallId(null)
                                                                    await uninstallApp(app.id)
                                                                }}
                                                                disabled={isBusy}
                                                                className="rounded-md bg-danger px-2.5 py-1 text-xs font-semibold text-white transition-all active:scale-95 disabled:opacity-50"
                                                            >
                                                                Confirm
                                                            </button>
                                                            <button
                                                                onClick={() => setConfirmUninstallId(null)}
                                                                className="rounded-md border border-hairline bg-canvas px-2.5 py-1 text-xs text-ink transition-colors hover:bg-parchment"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => setConfirmUninstallId(app.id)}
                                                            disabled={isBusy}
                                                            className="inline-flex items-center gap-1 rounded-md border border-hairline bg-canvas px-3 py-1.5 text-xs font-semibold text-danger transition-all hover:bg-red-50 active:scale-95 disabled:opacity-50"
                                                            title={`Uninstall ${app.title}`}
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                            Uninstall
                                                        </button>
                                                    )
                                                ) : (
                                                    <button
                                                        onClick={() => {
                                                            const appStoreDef = DEFAULT_APPS.find((a) => a.id === 'appstore')
                                                            if (appStoreDef) openWindow(appStoreDef)
                                                        }}
                                                        className="rounded-md border border-hairline bg-canvas px-3 py-1.5 text-xs font-semibold text-primary transition-all hover:bg-parchment active:scale-95"
                                                    >
                                                        Get in Store
                                                    </button>
                                                )}

                                                {appDef && installedApp && (
                                                    <button
                                                        onClick={() => openWindow(appDef)}
                                                        className="rounded-md border border-hairline bg-canvas px-3 py-1.5 text-xs font-semibold text-ink transition-all hover:bg-parchment active:scale-95"
                                                    >
                                                        Open
                                                    </button>
                                                )}
                                            </div>
                                        </article>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {section === 'accessibility' && (
                        <div className="space-y-4">
                            <div>
                                <h2 className="text-lg font-semibold text-ink">Accessibility</h2>
                                <p className="text-sm text-ink-muted">Density, typography, and keyboard usability.</p>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                {(['comfortable', 'cozy', 'compact'] as const).map((density) => (
                                    <button
                                        key={density}
                                        onClick={() => setDensity(density)}
                                        className={segmentClass(accessibility.density === density)}
                                    >
                                        {density}
                                    </button>
                                ))}
                            </div>

                            <label className="block space-y-2 rounded-md border border-hairline bg-parchment p-3">
                                <span className="text-sm text-ink">Font scale: {(accessibility.fontScale * 100).toFixed(0)}%</span>
                                <input
                                    type="range"
                                    min={0.85}
                                    max={1.35}
                                    step={0.05}
                                    value={accessibility.fontScale}
                                    onChange={(event) => setFontScale(Number(event.target.value))}
                                    className="h-1 w-full accent-primary"
                                />
                            </label>

                            <div className="space-y-2">
                                <SettingsToggle label="High contrast" checked={accessibility.highContrast} onChange={setHighContrast} />
                                <SettingsToggle label="Reduced motion" checked={accessibility.reducedMotion} onChange={setReducedMotion} />
                                <SettingsToggle label="Keyboard hints + strong focus ring" checked={accessibility.keyboardHints} onChange={setKeyboardHints} />
                            </div>

                            <div className="rounded-md border border-hairline bg-parchment p-3 text-sm text-ink-muted">
                                <p className="font-semibold text-ink">Accessibility checks</p>
                                <p className="mt-1">Contrast ratio: {report.contrastRatio.toFixed(2)} ({report.contrastPass ? 'pass' : 'fail'})</p>
                                <p>Keyboard focus visibility: {report.keyboardFocusPass ? 'pass' : 'fail'}</p>
                                <p>Keyboard target sizing: {report.keyboardTargetPass ? 'pass' : 'fail'}</p>
                            </div>
                        </div>
                    )}

                    {section === 'behavior' && (
                        <div className="space-y-4">
                            <div>
                                <h2 className="text-lg font-semibold text-ink">Behavior</h2>
                                <p className="text-sm text-ink-muted">Interaction and motion behavior across shell.</p>
                            </div>

                            <div className="space-y-2">
                                <SettingsToggle label="Enable animations" checked={behavior.animations} onChange={setAnimations} />
                                <SettingsToggle label="Translucent window effects" checked={behavior.translucentWindows} onChange={setTranslucentWindows} />
                                <SettingsToggle label="Show seconds in clock" checked={behavior.showSecondsInClock} onChange={setShowSecondsInClock} />
                            </div>
                        </div>
                    )}

                    {section === 'shortcuts' && (
                        <div className="space-y-4">
                            <div>
                                <h2 className="text-lg font-semibold text-ink">Shortcuts</h2>
                                <p className="text-sm text-ink-muted">Browser-safe keymap with remappable entries.</p>
                            </div>
                            <div className="space-y-2 rounded-md border border-hairline bg-parchment p-3">
                                <p className="text-xs text-ink-muted">Fixed defaults: App switcher next `Ctrl+Alt+]`, previous `Ctrl+Alt+[`.</p>
                                {REMAPPABLE_SHORTCUTS.map((actionId) => (
                                    <div key={actionId} className="grid grid-cols-[14rem_1fr_auto] items-center gap-2 text-sm">
                                        <label className="text-ink">{SHORTCUT_LABELS[actionId]}</label>
                                        <input
                                            value={shortcutDrafts[actionId] ?? ''}
                                            onChange={(event) => {
                                                const combo = event.target.value
                                                setShortcutDrafts((current) => ({
                                                    ...current,
                                                    [actionId]: combo,
                                                }))
                                            }}
                                            onBlur={(event) => {
                                                const accepted = applyShortcutDraft(actionId, event.target.value)
                                                if (accepted) {
                                                    return
                                                }

                                                event.currentTarget.setCustomValidity('Invalid or conflicting shortcut.')
                                                event.currentTarget.reportValidity()
                                                event.currentTarget.setCustomValidity('')
                                                setShortcutDrafts((current) => ({
                                                    ...current,
                                                    [actionId]: shortcuts.overrides[actionId] ?? resolvedShortcutKeymap[actionId],
                                                }))
                                            }}
                                            placeholder={resolvedShortcutKeymap[actionId]}
                                            className="rounded-sm border border-hairline bg-canvas px-2 py-1 text-sm text-ink"
                                        />
                                        <button
                                            onClick={() => {
                                                clearShortcutOverride(actionId)
                                                setShortcutDrafts((current) => ({
                                                    ...current,
                                                    [actionId]: resolvedShortcutKeymap[actionId],
                                                }))
                                            }}
                                            className="rounded-sm border border-hairline px-2 py-1 text-xs text-ink-muted transition-colors hover:bg-canvas"
                                        >
                                            Reset
                                        </button>
                                    </div>
                                ))}
                                {shortcutValidation.conflicts.length > 0 && (
                                    <p className="text-xs text-danger">Conflicting shortcuts detected. Reset one mapping to continue.</p>
                                )}
                            </div>
                        </div>
                    )}

                    {section === 'permissions' && (
                        <div className="space-y-4">
                            <div>
                                <h2 className="text-lg font-semibold text-ink">Permission Center</h2>
                                <p className="text-sm text-ink-muted">Review saved capabilities for the current profile and revoke them instantly.</p>
                            </div>

                            <div className="rounded-lg border border-hairline bg-parchment p-4 text-sm text-ink-muted">
                                <p className="text-xs font-semibold text-ink-muted">Active profile</p>
                                <p className="mt-2 text-base font-semibold text-ink">
                                    {activeAccount ? `${activeAccount.displayName} (${activeAccount.role})` : 'No active profile'}
                                </p>
                                <p className="mt-1 text-sm text-ink-muted">Revoking a grant takes effect immediately. The next protected action will ask again.</p>
                            </div>

                            <div className="space-y-3">
                                {permissionStatuses.map((status) => (
                                    <article key={status.id} className="rounded-lg border border-hairline bg-parchment p-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-sm font-semibold text-ink">{status.label}</h3>
                                                    <span className={`rounded-pill px-2 py-0.5 text-[12px] font-semibold ${status.granted ? 'bg-[rgba(26,127,55,0.12)] text-success' : 'bg-canvas text-ink-muted'}`}>
                                                        {status.granted ? 'Granted' : 'Not granted'}
                                                    </span>
                                                </div>
                                                <p className="mt-1 text-sm text-ink-muted">{status.description}</p>
                                                <p className="mt-2 text-xs text-ink-muted-48">{status.category}</p>
                                            </div>
                                            <button
                                                onClick={() => revokePermission(status.id)}
                                                disabled={!status.granted}
                                                className="rounded-md border border-hairline bg-canvas px-3 py-2 text-xs font-semibold text-ink transition-colors hover:bg-parchment disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                Revoke
                                            </button>
                                        </div>

                                        <div className="mt-3 rounded-md border border-hairline bg-canvas p-3 text-xs text-ink-muted">
                                            {status.grant ? (
                                                <>
                                                    <p className="text-ink">Granted because: {status.grant.source.reason}</p>
                                                    <p className="mt-1">Saved at: {new Date(status.grant.grantedAt).toLocaleString()}</p>
                                                </>
                                            ) : (
                                                <p className="text-ink">This capability is not currently saved for the active profile.</p>
                                            )}
                                            <p className="mt-2">{status.recovery}</p>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </Window>
    )
}
