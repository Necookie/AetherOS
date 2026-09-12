import React from 'react'

export interface AppIconSvgProps {
    className?: string
    style?: React.CSSProperties
    size?: number | string
}

const BaseSquircle = ({
    id,
    gradientStops,
    children,
    className = 'w-full h-full',
    style,
}: {
    id: string
    gradientStops: [string, string]
    children: React.ReactNode
    className?: string
    style?: React.CSSProperties
}) => {
    const bgGradId = `aether-appicon-bg-${id}`
    const rimGradId = `aether-appicon-rim-${id}`
    const shadowId = `aether-appicon-shadow-${id}`

    return (
        <svg
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`select-none overflow-visible drop-shadow-[0_2px_5px_rgba(0,0,0,0.18)] ${className}`}
            style={style}
            aria-hidden="true"
        >
            <defs>
                <linearGradient id={bgGradId} x1="0" y1="0" x2="0" y2="64" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor={gradientStops[0]} />
                    <stop offset="100%" stopColor={gradientStops[1]} />
                </linearGradient>
                <linearGradient id={rimGradId} x1="0" y1="0" x2="0" y2="64" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
                    <stop offset="35%" stopColor="#ffffff" stopOpacity="0.12" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0.04" />
                </linearGradient>
                <filter id={shadowId} x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.25" />
                </filter>
            </defs>

            {/* AetherOS continuous curvature rounded squircle (rx=14 on 64px = ~22%) */}
            <rect width="64" height="64" rx="14" fill={`url(#${bgGradId})`} />

            {/* Bespoke Original AetherOS Artwork */}
            {children}

            {/* Specular hairline rim highlight */}
            <rect
                x="0.5"
                y="0.5"
                width="63"
                height="63"
                rx="13.5"
                fill="none"
                stroke={`url(#${rimGradId})`}
                strokeWidth="1"
            />
        </svg>
    )
}

/**
 * 1. App Store — "Aether Modular Cube / App Nexus"
 * Original design: An isometric floating crystalline package whose 3 facets
 * reveal a glowing energy core at the center. Clean, futuristic, non-Apple.
 */
export function AppStoreIcon({ className, style }: AppIconSvgProps) {
    return (
        <BaseSquircle id="appstore" gradientStops={['#0284C7', '#0F172A']} className={className} style={style}>
            {/* Subtle orbital ring behind cube */}
            <ellipse
                cx="32"
                cy="33"
                rx="22"
                ry="9"
                fill="none"
                stroke="#38BDF8"
                strokeWidth="1"
                strokeOpacity="0.3"
                strokeDasharray="3 2"
                transform="rotate(-15 32 33)"
            />

            {/* Isometric Modular Cube with separated floating facets */}
            <g filter="drop-shadow(0 2px 4px rgba(0,0,0,0.35))">
                {/* Central energy glow */}
                <circle cx="32" cy="33" r="5" fill="#38BDF8" fillOpacity="0.6" filter="blur(2px)" />
                <circle cx="32" cy="33" r="2.5" fill="#FFFFFF" />

                {/* Top Face (Diamond) */}
                <polygon
                    points="32,15 46,23 32,31 18,23"
                    fill="url(#aether-store-top)"
                />
                {/* Etched Aether "A" chevron monogram on top facet */}
                <path
                    d="M27 25 L32 19 L37 25 M28.5 23.5 L35.5 23.5"
                    stroke="#0284C7"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* Left Face (Isometric parallelogram) */}
                <polygon
                    points="17,25 31,33 31,48 17,40"
                    fill="url(#aether-store-left)"
                />
                {/* Modular card slot lines on left face */}
                <line x1="21" y1="30" x2="27" y2="33.5" stroke="#FFFFFF" strokeOpacity="0.25" strokeWidth="1" />
                <line x1="21" y1="35" x2="27" y2="38.5" stroke="#FFFFFF" strokeOpacity="0.25" strokeWidth="1" />

                {/* Right Face (Isometric parallelogram) */}
                <polygon
                    points="33,33 47,25 47,40 33,48"
                    fill="url(#aether-store-right)"
                />
                {/* Modular status indicators on right face */}
                <circle cx="41" cy="34" r="1.5" fill="#38BDF8" />
                <circle cx="41" cy="39" r="1.5" fill="#34D399" />
            </g>

            <defs>
                <linearGradient id="aether-store-top" x1="18" y1="15" x2="46" y2="31" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#E0F2FE" />
                    <stop offset="100%" stopColor="#BAE6FD" />
                </linearGradient>
                <linearGradient id="aether-store-left" x1="17" y1="25" x2="31" y2="48" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#38BDF8" />
                    <stop offset="100%" stopColor="#0284C7" />
                </linearGradient>
                <linearGradient id="aether-store-right" x1="33" y1="25" x2="47" y2="48" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#0369A1" />
                    <stop offset="100%" stopColor="#1E3A8A" />
                </linearGradient>
            </defs>
        </BaseSquircle>
    )
}

/**
 * 2. Aether Browser — "Quantum Orbit / Web Portal"
 * Original design: Intersecting aerodynamic cyan and violet cosmic ribbons
 * encircling a luminous web gateway core. Completely distinct from Safari's needle.
 */
export function BrowserIcon({ className, style }: AppIconSvgProps) {
    return (
        <BaseSquircle id="browser" gradientStops={['#1E1B4B', '#0369A1']} className={className} style={style}>
            {/* Background constellation coordinate web */}
            <circle cx="32" cy="32" r="23" fill="none" stroke="#FFFFFF" strokeOpacity="0.12" strokeWidth="1" />
            <circle cx="32" cy="32" r="14" fill="none" stroke="#FFFFFF" strokeOpacity="0.1" strokeWidth="1" strokeDasharray="3 3" />

            {/* Central Web Portal Glow */}
            <circle cx="32" cy="32" r="8" fill="#38BDF8" fillOpacity="0.3" filter="blur(3px)" />
            <circle cx="32" cy="32" r="6" fill="#FFFFFF" />
            <circle cx="32" cy="32" r="3.5" fill="#0284C7" />

            {/* Intersecting sweeping 3D ribbons */}
            <g filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))">
                {/* Cyan sweeping ribbon (bottom-left to top-right) */}
                <path
                    d="M12 44 C12 28, 22 14, 46 14 C36 22, 28 32, 28 46 C20 48, 14 48, 12 44 Z"
                    fill="url(#aether-browser-cyan)"
                />

                {/* Violet sweeping ribbon (top-left to bottom-right) */}
                <path
                    d="M20 16 C34 16, 48 26, 48 48 C42 40, 34 32, 20 30 C18 22, 18 18, 20 16 Z"
                    fill="url(#aether-browser-violet)"
                    fillOpacity="0.9"
                />

                {/* Orbiting celestial satellite beacon */}
                <circle cx="47" cy="18" r="2.5" fill="#FFFFFF" />
                <circle cx="47" cy="18" r="4" fill="#38BDF8" fillOpacity="0.4" />
            </g>

            <defs>
                <linearGradient id="aether-browser-cyan" x1="12" y1="14" x2="46" y2="48" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#22D3EE" />
                    <stop offset="100%" stopColor="#0284C7" />
                </linearGradient>
                <linearGradient id="aether-browser-violet" x1="20" y1="16" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#A78BFA" />
                    <stop offset="100%" stopColor="#4F46E5" />
                </linearGradient>
            </defs>
        </BaseSquircle>
    )
}

/**
 * 3. File Manager — "Aether Data Vault / Storage Stack"
 * Original design: Staggered geometric glass data volumes with category index pips
 * and architectural clean lines.
 */
export function ExplorerIcon({ className, style }: AppIconSvgProps) {
    return (
        <BaseSquircle id="explorer" gradientStops={['#0284C7', '#075985']} className={className} style={style}>
            <g filter="drop-shadow(0 2px 4px rgba(0,0,0,0.25))">
                {/* Back Vault Slab (Solid Deep Blue) */}
                <rect x="13" y="16" width="38" height="32" rx="4" fill="#0C4A6E" />
                {/* Index tab on back slab */}
                <path d="M13 20 C13 17.8 14.8 16 17 16 L27 16 C29 16 30.5 17.2 31.5 18.8 L33 21 L13 21 Z" fill="#0369A1" />

                {/* Middle File Grid Sheet (Crisp White/Frosted) */}
                <rect x="17" y="20" width="34" height="28" rx="3" fill="#F8FAFC" />
                {/* Mini file system matrix grid */}
                <rect x="21" y="24" width="7" height="6" rx="1.5" fill="#0284C7" fillOpacity="0.8" />
                <rect x="31" y="24" width="7" height="6" rx="1.5" fill="#38BDF8" fillOpacity="0.7" />
                <rect x="41" y="24" width="6" height="6" rx="1.5" fill="#94A3B8" fillOpacity="0.6" />
                <rect x="21" y="33" width="12" height="2" rx="1" fill="#CBD5E1" />
                <rect x="21" y="37" width="18" height="2" rx="1" fill="#E2E8F0" />

                {/* Front Vault Pocket (Cyan to Royal Blue with Cutaway Arc) */}
                <path
                    d="M13 29 C13 26.8 14.8 25 17 25 L47 25 C49.2 25 51 26.8 51 29 L51 47 C51 49.8 48.8 52 46 52 L18 52 C15.2 52 13 49.8 13 47 Z"
                    fill="url(#aether-vault-front)"
                />
                {/* Front specular edge */}
                <line x1="15" y1="26.5" x2="49" y2="26.5" stroke="#FFFFFF" strokeOpacity="0.4" strokeWidth="1" />

                {/* Status category dots */}
                <circle cx="20" cy="46" r="2" fill="#38BDF8" />
                <circle cx="26" cy="46" r="2" fill="#34D399" />
                <circle cx="32" cy="46" r="2" fill="#FBBF24" />
            </g>

            <defs>
                <linearGradient id="aether-vault-front" x1="13" y1="25" x2="51" y2="52" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#38BDF8" />
                    <stop offset="100%" stopColor="#0284C7" />
                </linearGradient>
            </defs>
        </BaseSquircle>
    )
}

/**
 * 4. Terminal — "Aether Monolith Shell"
 * Original design: Pure carbon obsidian monolith with an electric lime/emerald
 * chevron prompt ❯ and glowing block cursor. ZERO macOS traffic lights.
 */
export function TerminalIcon({ className, style }: AppIconSvgProps) {
    return (
        <BaseSquircle id="term" gradientStops={['#18181B', '#09090B']} className={className} style={style}>
            {/* Architectural subtle top separator line */}
            <line x1="12" y1="16" x2="52" y2="16" stroke="#FFFFFF" strokeOpacity="0.1" strokeWidth="1" />

            {/* Subtle digital matrix grid dots */}
            <circle cx="15" cy="11.5" r="1.2" fill="#71717A" />
            <circle cx="20" cy="11.5" r="1.2" fill="#71717A" />
            <line x1="43" y1="11.5" x2="49" y2="11.5" stroke="#71717A" strokeWidth="1.2" strokeLinecap="round" />

            {/* Neon Green Glow backdrop */}
            <circle cx="24" cy="33" r="12" fill="#22C55E" fillOpacity="0.15" />

            {/* Bold Modern Chevron Prompt: ❯ */}
            <path
                d="M16 25 L26 33 L16 41"
                fill="none"
                stroke="#22C55E"
                strokeWidth="3.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="drop-shadow(0 0 4px rgba(34,197,94,0.5))"
            />

            {/* Glowing Block Cursor */}
            <rect x="31" y="27" width="10" height="12" rx="2" fill="#22C55E" />

            {/* Monospace Code stream line */}
            <line x1="16" y1="46" x2="38" y2="46" stroke="#71717A" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="42" y1="46" x2="48" y2="46" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />
        </BaseSquircle>
    )
}

/**
 * 5. Task Manager — "Aether Telemetry Pulse"
 * Original design: Futuristic telemetry cardiogram and activity frequency wave
 * with a glowing peak pulse beacon.
 */
export function TaskManagerIcon({ className, style }: AppIconSvgProps) {
    return (
        <BaseSquircle id="taskmgr" gradientStops={['#27272A', '#111113']} className={className} style={style}>
            {/* Oscilloscope Grid Matrix */}
            <line x1="12" y1="24" x2="52" y2="24" stroke="#FFFFFF" strokeOpacity="0.08" strokeWidth="1" strokeDasharray="2 2" />
            <line x1="12" y1="34" x2="52" y2="34" stroke="#FFFFFF" strokeOpacity="0.08" strokeWidth="1" strokeDasharray="2 2" />
            <line x1="12" y1="44" x2="52" y2="44" stroke="#FFFFFF" strokeOpacity="0.08" strokeWidth="1" strokeDasharray="2 2" />
            <line x1="22" y1="16" x2="22" y2="48" stroke="#FFFFFF" strokeOpacity="0.08" strokeWidth="1" strokeDasharray="2 2" />
            <line x1="32" y1="16" x2="32" y2="48" stroke="#FFFFFF" strokeOpacity="0.08" strokeWidth="1" strokeDasharray="2 2" />
            <line x1="42" y1="16" x2="42" y2="48" stroke="#FFFFFF" strokeOpacity="0.08" strokeWidth="1" strokeDasharray="2 2" />

            {/* Area glow fill beneath waveform */}
            <path
                d="M10 35 L20 35 L24 38 L28 19 L33 46 L37 32 L41 35 L54 35 L54 48 L10 48 Z"
                fill="#22C55E"
                fillOpacity="0.08"
            />

            {/* Vivid Emerald Telemetry Pulse Waveform */}
            <path
                d="M10 35 L20 35 L24 38 L28 19 L33 46 L37 32 L41 35 L54 35"
                fill="none"
                stroke="#22C55E"
                strokeWidth="3.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="drop-shadow(0 0 5px rgba(34,197,94,0.6))"
            />

            {/* Peak telemetry beacon */}
            <circle cx="28" cy="19" r="4.5" fill="#22C55E" fillOpacity="0.35" />
            <circle cx="28" cy="19" r="2.2" fill="#FFFFFF" />
        </BaseSquircle>
    )
}

/**
 * 6. Settings — "Aether Precision Control Hub"
 * Original design: Aerospace calibrated tuning matrix with precision rotary ring
 * and calibration indicator. Replaces Apple's mechanical gear completely.
 */
export function SettingsIcon({ className, style }: AppIconSvgProps) {
    return (
        <BaseSquircle id="settings" gradientStops={['#3F3F46', '#18181B']} className={className} style={style}>
            <g filter="drop-shadow(0 2px 4px rgba(0,0,0,0.35))">
                {/* Outer Calibrated Dial Ring with 12 Minimalist Tick Dashes */}
                <circle cx="32" cy="32" r="21" fill="none" stroke="#71717A" strokeWidth="1.5" strokeDasharray="2 7.5" />

                {/* Brushed Titanium Rotary Hub Body */}
                <circle cx="32" cy="32" r="16" fill="url(#aether-settings-hub)" />

                {/* Concentric Calibration Groove */}
                <circle cx="32" cy="32" r="11" fill="none" stroke="#27272A" strokeWidth="2" />

                {/* Center Core Cap */}
                <circle cx="32" cy="32" r="6" fill="#18181B" />

                {/* Action Blue Rotary Position Indicator Needle */}
                <line x1="32" y1="32" x2="43" y2="21" stroke="#0066CC" strokeWidth="2.8" strokeLinecap="round" />
                <circle cx="43" cy="21" r="2.2" fill="#38BDF8" />

                {/* Precision Slider Rail Dots below */}
                <circle cx="24" cy="46" r="1.5" fill="#A1A1AA" />
                <circle cx="32" cy="46" r="1.5" fill="#0066CC" />
                <circle cx="40" cy="46" r="1.5" fill="#A1A1AA" />
            </g>

            <defs>
                <linearGradient id="aether-settings-hub" x1="20" y1="16" x2="44" y2="48" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#E4E4E7" />
                    <stop offset="50%" stopColor="#A1A1AA" />
                    <stop offset="100%" stopColor="#52525B" />
                </linearGradient>
            </defs>
        </BaseSquircle>
    )
}

/**
 * 7. Notes — "Aether Slate / Quick Capture"
 * Original design: Crisp porcelain floating card with modern typography hierarchy
 * and Aether quick-action emblem. No yellow legal pad or skeuomorphic leather.
 */
export function NotesIcon({ className, style }: AppIconSvgProps) {
    return (
        <BaseSquircle id="notes" gradientStops={['#F59E0B', '#B45309']} className={className} style={style}>
            <g filter="drop-shadow(0 2px 4px rgba(0,0,0,0.22))">
                {/* Porcelain Floating Card */}
                <rect x="14" y="12" width="36" height="40" rx="5" fill="#FFFFFF" />

                {/* Top Quick-Action Header Stripe */}
                <path d="M14 17 C14 14.2 16.2 12 19 12 L45 12 C47.8 12 50 14.2 50 17 L50 20 L14 20 Z" fill="#F59E0B" />

                {/* Aether Quick-Action Spark Emblem */}
                <circle cx="20" cy="16" r="2" fill="#FFFFFF" />

                {/* Modern Content Typography Hierarchy */}
                <rect x="18" y="26" width="16" height="3" rx="1.5" fill="#0F172A" />
                <rect x="18" y="32" width="28" height="2" rx="1" fill="#94A3B8" />
                <rect x="18" y="36.5" width="24" height="2" rx="1" fill="#CBD5E1" />
                <rect x="18" y="41" width="18" height="2" rx="1" fill="#E2E8F0" />

                {/* Checkmark Completion Pill in bottom-right corner */}
                <circle cx="42" cy="42" r="5.5" fill="#10B981" />
                <path d="M39.5 42 L41.5 44 L44.5 40" fill="none" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </g>
        </BaseSquircle>
    )
}

/**
 * 8. Docs — "Aether Structured Document"
 * Original design: Architectural rich text page with formatted typography
 * hierarchy and Aether Blue left-border citation accent.
 */
export function DocsIcon({ className, style }: AppIconSvgProps) {
    return (
        <BaseSquircle id="docs" gradientStops={['#1D4ED8', '#0F172A']} className={className} style={style}>
            <g filter="drop-shadow(0 2px 4px rgba(0,0,0,0.28))">
                {/* Crisp Architectural Document Card with Folded Corner */}
                <path
                    d="M16 13 C16 11.3 17.3 10 19 10 L37 10 L48 21 L48 50 C48 51.7 46.7 53 45 53 L19 53 C17.3 53 16 51.7 16 50 Z"
                    fill="#FFFFFF"
                />
                {/* Folded Top-Right Corner */}
                <polygon points="37,10 37,21 48,21" fill="#003D99" fillOpacity="0.4" />
                <polygon points="37,10 37,21 48,21" fill="#E2E8F0" />

                {/* Aether Blue Left Citation Accent Bar */}
                <rect x="20" y="24" width="3" height="20" rx="1.5" fill="#0066CC" />

                {/* Title Line */}
                <rect x="26" y="24" width="16" height="3.5" rx="1.75" fill="#0066CC" />

                {/* Paragraph Typography Grid */}
                <rect x="26" y="31" width="17" height="2.5" rx="1.25" fill="#64748B" />
                <rect x="26" y="36.5" width="17" height="2.5" rx="1.25" fill="#94A3B8" />
                <rect x="26" y="42" width="12" height="2.5" rx="1.25" fill="#CBD5E1" />
            </g>
        </BaseSquircle>
    )
}

/**
 * 9. Boards — "Aether Flow Kanban"
 * Original design: Dynamic multi-column project board with card status pips.
 */
export function BoardsIcon({ className, style }: AppIconSvgProps) {
    return (
        <BaseSquircle id="boards" gradientStops={['#6366F1', '#312E81']} className={className} style={style}>
            <g filter="drop-shadow(0 2px 4px rgba(0,0,0,0.25))">
                {/* Column 1 (Backlog / To-Do) */}
                <rect x="11" y="14" width="11" height="36" rx="2.5" fill="#FFFFFF" fillOpacity="0.22" />
                <rect x="12.5" y="17" width="8" height="9" rx="1.5" fill="#FFFFFF" />
                <rect x="12.5" y="28" width="8" height="12" rx="1.5" fill="#FFFFFF" fillOpacity="0.85" />

                {/* Column 2 (In Progress - Highlighted) */}
                <rect x="26.5" y="14" width="11" height="36" rx="2.5" fill="#FFFFFF" fillOpacity="0.32" />
                <rect x="28" y="17" width="8" height="14" rx="1.5" fill="#FFFFFF" />
                <rect x="29.5" y="19" width="5" height="2" rx="1" fill="#38BDF8" />
                <rect x="28" y="33" width="8" height="8" rx="1.5" fill="#FFFFFF" fillOpacity="0.85" />

                {/* Column 3 (Completed / Deployed) */}
                <rect x="42" y="14" width="11" height="36" rx="2.5" fill="#FFFFFF" fillOpacity="0.22" />
                <rect x="43.5" y="17" width="8" height="11" rx="1.5" fill="#FFFFFF" />
                <circle cx="47.5" cy="22.5" r="1.5" fill="#22C55E" />
                <rect x="43.5" y="30" width="8" height="10" rx="1.5" fill="#FFFFFF" fillOpacity="0.75" />
            </g>
        </BaseSquircle>
    )
}

/**
 * 10. Download Manager — "Aether Velocity Stream"
 * Original design: Aerodynamic velocity arrow plunging into a clean magnetic receiving tray.
 */
export function DownloadsIcon({ className, style }: AppIconSvgProps) {
    return (
        <BaseSquircle id="downloads" gradientStops={['#10B981', '#047857']} className={className} style={style}>
            <g filter="drop-shadow(0 2px 3px rgba(0,0,0,0.22))">
                {/* Velocity arrow shaft & head */}
                <path d="M32 14 V34" stroke="#FFFFFF" strokeWidth="4.5" strokeLinecap="round" />
                <path d="M21 26 L32 37 L43 26" fill="none" stroke="#FFFFFF" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />

                {/* Magnetic Receiving Tray */}
                <path
                    d="M16 41 H48 C49.5 41 50 42 50 44 V45 C50 47.5 48 49 46 49 H18 C16 49 14 47.5 14 45 V44 C14 42 14.5 41 16 41 Z"
                    fill="#FFFFFF"
                />
            </g>
        </BaseSquircle>
    )
}

/**
 * 11. OS Simulation Lab — "Aether Kernel Reactor"
 * Original design: A central CPU microkernel core with 4 scheduling quadrants
 * and orbiting process telemetry particles.
 */
export function OsLabIcon({ className, style }: AppIconSvgProps) {
    return (
        <BaseSquircle id="os-lab" gradientStops={['#0284C7', '#0F172A']} className={className} style={style}>
            {/* Outer Scheduling Quadrant Rings */}
            <circle cx="32" cy="32" r="22" fill="none" stroke="#38BDF8" strokeWidth="1.2" strokeOpacity="0.3" strokeDasharray="4 4" />
            <ellipse
                cx="32"
                cy="32"
                rx="20"
                ry="8"
                fill="none"
                stroke="#67E8F9"
                strokeWidth="1.2"
                strokeOpacity="0.5"
                transform="rotate(-30 32 32)"
            />

            {/* Central Kernel CPU Core Die */}
            <g filter="drop-shadow(0 2px 4px rgba(0,0,0,0.4))">
                <rect x="22" y="22" width="20" height="20" rx="4" fill="#0C4A6E" stroke="#38BDF8" strokeWidth="1.5" />
                {/* CPU core interconnect nodes */}
                <circle cx="28" cy="28" r="2" fill="#38BDF8" />
                <circle cx="36" cy="28" r="2" fill="#34D399" />
                <circle cx="28" cy="36" r="2" fill="#818CF8" />
                <circle cx="36" cy="36" r="2" fill="#FBBF24" />
                {/* Central kernel heartbeat */}
                <circle cx="32" cy="32" r="2" fill="#FFFFFF" />
            </g>

            {/* Orbiting Process Particles */}
            <circle cx="47" cy="23" r="2.2" fill="#FFFFFF" />
            <circle cx="17" cy="41" r="1.8" fill="#38BDF8" />
        </BaseSquircle>
    )
}

/**
 * 12. Mail — "Aether Supersonic Dispatch"
 * Original design: Modern faceted white supersonic message glider in flight.
 * Fresh, creative, non-Apple.
 */
export function MailIcon({ className, style }: AppIconSvgProps) {
    return (
        <BaseSquircle id="mail" gradientStops={['#0EA5E9', '#0369A1']} className={className} style={style}>
            <g filter="drop-shadow(0 2px 4px rgba(0,0,0,0.25))">
                {/* Supersonic Folded Glider Wing Facets */}
                {/* Left Wing */}
                <polygon points="32,15 13,44 32,37" fill="#F8FAFC" />
                {/* Right Wing */}
                <polygon points="32,15 51,44 32,37" fill="#E2E8F0" />
                {/* Center Spine Fold */}
                <polygon points="32,15 30,37 32,45" fill="#CBD5E1" />
                <polygon points="32,15 34,37 32,45" fill="#94A3B8" />

                {/* Speed Contrail Line */}
                <line x1="32" y1="47" x2="32" y2="52" stroke="#FFFFFF" strokeOpacity="0.6" strokeWidth="1.5" strokeLinecap="round" />
            </g>
        </BaseSquircle>
    )
}

/**
 * 13. DevTools Pack — "Aether Logic Processor"
 * Original design: Hexagonal silicon chip with radiant code syntax logic gates.
 */
export function DevToolsIcon({ className, style }: AppIconSvgProps) {
    return (
        <BaseSquircle id="devtools" gradientStops={['#27272A', '#09090B']} className={className} style={style}>
            <g filter="drop-shadow(0 0 4px rgba(251,191,36,0.35))">
                {/* Hexagonal Processor Core Outline */}
                <polygon
                    points="32,13 49,22.5 49,41.5 32,51 15,41.5 15,22.5"
                    fill="#18181B"
                    stroke="#52525B"
                    strokeWidth="1.5"
                />

                {/* Glowing Amber Code Syntax Brackets: < / > */}
                <path
                    d="M23 26 L17 32 L23 38"
                    fill="none"
                    stroke="#FBBF24"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M41 26 L47 32 L41 38"
                    fill="none"
                    stroke="#FBBF24"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <line
                    x1="35"
                    y1="23"
                    x2="29"
                    y2="41"
                    stroke="#F59E0B"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                />
            </g>
        </BaseSquircle>
    )
}

export function TetrisIcon({ className, style }: AppIconSvgProps) {
    return (
        <BaseSquircle id="tetris" gradientStops={['#213247', '#101821']} className={className} style={style}>
            <g filter="drop-shadow(0 2px 3px rgba(0,0,0,0.28))">
                <rect x="13" y="34" width="11" height="11" rx="2" fill="#48C6E8" />
                <rect x="25.5" y="34" width="11" height="11" rx="2" fill="#48C6E8" />
                <rect x="25.5" y="21.5" width="11" height="11" rx="2" fill="#9976CF" />
                <rect x="38" y="34" width="11" height="11" rx="2" fill="#E5CA52" />
                <path d="M16 36.5H21M28.5 24H33.5M28.5 36.5H33.5M41 36.5H46" stroke="#FFFFFF" strokeOpacity="0.34" strokeWidth="1.2" strokeLinecap="round" />
            </g>
        </BaseSquircle>
    )
}

export function ChessIcon({ className, style }: AppIconSvgProps) {
    return (
        <BaseSquircle id="chess" gradientStops={['#6B7766', '#262720']} className={className} style={style}>
            <path d="M14 46H50L46 51H18L14 46Z" fill="#171915" fillOpacity="0.8" />
            <g filter="drop-shadow(0 3px 3px rgba(0,0,0,0.35))">
                <path d="M24 45H42C42 41.5 39.8 39.5 36.5 38.5C38.8 34.5 38.2 30.5 34.5 27.5L40 20L31 13L24 19L31 24C24.5 28 23.2 35 28.2 38.7C25.5 40 24 42 24 45Z" fill="#F5F1E8" />
                <path d="M31 13L40 20L34.5 27.5L31 24L24 19L31 13Z" fill="#D8CFBB" />
                <circle cx="33" cy="18.5" r="1.4" fill="#262720" />
            </g>
        </BaseSquircle>
    )
}

/** 14. Fallback Generic App Icon — "Aether Application Prism" */
export function GenericAppIcon({ className, style }: AppIconSvgProps) {
    return (
        <BaseSquircle id="generic" gradientStops={['#4B5563', '#1F2937']} className={className} style={style}>
            <g filter="drop-shadow(0 1.5px 2px rgba(0,0,0,0.25))">
                <rect x="16" y="16" width="32" height="32" rx="6" fill="none" stroke="#FFFFFF" strokeWidth="2.2" />
                <line x1="16" y1="26" x2="48" y2="26" stroke="#FFFFFF" strokeWidth="1.8" strokeOpacity="0.7" />
                <circle cx="22" cy="21" r="1.5" fill="#38BDF8" />
                <circle cx="27" cy="21" r="1.5" fill="#34D399" />
                <rect x="23" y="33" width="18" height="3" rx="1.5" fill="#38BDF8" />
            </g>
        </BaseSquircle>
    )
}

/** 15. This PC / System Workstation Icon */
export function SystemPcIcon({ className, style }: AppIconSvgProps) {
    return (
        <BaseSquircle id="pc" gradientStops={['#0284C7', '#0F172A']} className={className} style={style}>
            <g filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))">
                {/* Desktop Monitor Bezel */}
                <rect x="13" y="14" width="38" height="25" rx="3.5" fill="#0C4A6E" stroke="#38BDF8" strokeWidth="1.5" />
                {/* Inner glowing display */}
                <rect x="15" y="16" width="34" height="21" rx="2" fill="#0369A1" />
                {/* Aether Delta Core Emblem on screen */}
                <path d="M28 31 L32 23 L36 31 M29 29 L35 29" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="32" cy="27" r="1.5" fill="#38BDF8" />

                {/* Stand Neck */}
                <rect x="29" y="39" width="6" height="6" fill="#94A3B8" />
                {/* Stand Base */}
                <rect x="22" y="45" width="20" height="3" rx="1.5" fill="#E2E8F0" />
            </g>
        </BaseSquircle>
    )
}

/** 16. Dedicated Virtual Folder Icon */
export function FolderIcon({ className, style }: AppIconSvgProps) {
    return <ExplorerIcon className={className} style={style} />
}

/** 17. Dedicated Virtual File Document Icon */
export function FileDocumentIcon({ className, style }: AppIconSvgProps) {
    return <DocsIcon className={className} style={style} />
}

export const APP_ICON_COMPONENTS: Record<string, React.FC<AppIconSvgProps>> = {
    appstore: AppStoreIcon,
    browser: BrowserIcon,
    explorer: ExplorerIcon,
    term: TerminalIcon,
    taskmgr: TaskManagerIcon,
    settings: SettingsIcon,
    notes: NotesIcon,
    docs: DocsIcon,
    boards: BoardsIcon,
    downloads: DownloadsIcon,
    'os-lab': OsLabIcon,
    mail: MailIcon,
    devtools: DevToolsIcon,
    tetris: TetrisIcon,
    chess: ChessIcon,
    pc: SystemPcIcon,
    folder: FolderIcon,
    file: FileDocumentIcon,
}
