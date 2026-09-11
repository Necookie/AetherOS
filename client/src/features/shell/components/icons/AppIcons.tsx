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
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
                    <stop offset="40%" stopColor="#ffffff" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0.05" />
                </linearGradient>
                <filter id={shadowId} x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.25" />
                </filter>
            </defs>

            {/* Apple squircle continuous rounded rect (rx=14 on 64px = ~22%) */}
            <rect width="64" height="64" rx="14" fill={`url(#${bgGradId})`} />

            {/* Content / Artwork */}
            {children}

            {/* Specular rim highlight */}
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

/** 1. App Store */
export function AppStoreIcon({ className, style }: AppIconSvgProps) {
    return (
        <BaseSquircle id="appstore" gradientStops={['#1F8FFF', '#004DB3']} className={className} style={style}>
            {/* Architectural overlapping drafting tools forming the iconic 'A' */}
            <g filter="drop-shadow(0 1.5px 2px rgba(0,0,0,0.22))">
                {/* Ruler (left diagonal bar) */}
                <rect
                    x="19"
                    y="15"
                    width="6.5"
                    height="38"
                    rx="3.25"
                    transform="rotate(-28 19 15)"
                    fill="#FFFFFF"
                />
                {/* Ruler notch marks */}
                <line x1="28" y1="29" x2="31.5" y2="31" stroke="#0050D6" strokeWidth="1" strokeLinecap="round" />
                <line x1="25" y1="35" x2="28.5" y2="37" stroke="#0050D6" strokeWidth="1" strokeLinecap="round" />
                <line x1="22" y1="41" x2="25.5" y2="43" stroke="#0050D6" strokeWidth="1" strokeLinecap="round" />

                {/* Pencil (right diagonal bar) */}
                <rect
                    x="39"
                    y="12"
                    width="6.5"
                    height="38"
                    rx="3.25"
                    transform="rotate(28 39 12)"
                    fill="#FFFFFF"
                />
                {/* Pencil lead tip tip and band */}
                <line x1="35" y1="30" x2="38.5" y2="28" stroke="#0050D6" strokeWidth="1" strokeLinecap="round" />

                {/* Paintbrush (cross bar) */}
                <rect x="14" y="34.5" width="36" height="6.5" rx="3.25" fill="#FFFFFF" />
                <rect x="18" y="35.5" width="4.5" height="4.5" rx="1.5" fill="#0066CC" fillOpacity="0.25" />
            </g>
        </BaseSquircle>
    )
}

/** 2. Aether Browser */
export function BrowserIcon({ className, style }: AppIconSvgProps) {
    return (
        <BaseSquircle id="browser" gradientStops={['#2997FF', '#0047BA']} className={className} style={style}>
            {/* Celestial & compass latitude/longitude grid rings */}
            <circle cx="32" cy="32" r="23" fill="none" stroke="#FFFFFF" strokeOpacity="0.2" strokeWidth="1" />
            <circle cx="32" cy="32" r="16" fill="none" stroke="#FFFFFF" strokeOpacity="0.15" strokeWidth="1" strokeDasharray="2.5 2.5" />
            <circle cx="32" cy="32" r="9" fill="none" stroke="#FFFFFF" strokeOpacity="0.12" strokeWidth="1" />

            {/* Cardinal tick marks */}
            <line x1="32" y1="9" x2="32" y2="12" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.8" />
            <line x1="32" y1="52" x2="32" y2="55" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.8" />
            <line x1="9" y1="32" x2="12" y2="32" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.8" />
            <line x1="52" y1="32" x2="55" y2="32" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.8" />

            {/* Rotated 45-degree nautical compass needle */}
            <g transform="rotate(42 32 32)" filter="drop-shadow(0 2px 3px rgba(0,0,0,0.3))">
                {/* North Needle (Red facet) */}
                <polygon points="32,10 35.5,32 32,32" fill="#FF453A" />
                <polygon points="32,10 32,32 28.5,32" fill="#D70015" />

                {/* South Needle (Silver facet) */}
                <polygon points="32,54 35.5,32 32,32" fill="#F2F2F7" />
                <polygon points="32,54 32,32 28.5,32" fill="#C7C7CC" />

                {/* Center Pivot Jewel */}
                <circle cx="32" cy="32" r="4.5" fill="#FFFFFF" />
                <circle cx="32" cy="32" r="2.2" fill="#0047BA" />
            </g>
        </BaseSquircle>
    )
}

/** 3. File Manager (Explorer) */
export function ExplorerIcon({ className, style }: AppIconSvgProps) {
    return (
        <BaseSquircle id="explorer" gradientStops={['#4FB5FF', '#0066CC']} className={className} style={style}>
            {/* Back Folder Tab & Plate */}
            <path
                d="M12 21 C12 18.8 13.8 17 16 17 L25 17 C27 17 28.5 18 29.5 19.5 L31.5 22 L48 22 C50.2 22 52 23.8 52 26 L52 47 C52 49.2 50.2 51 48 51 L16 51 C13.8 51 12 49.2 12 47 Z"
                fill="#004EA3"
            />

            {/* Peeking Document Sheet */}
            <g filter="drop-shadow(0 1.5px 2px rgba(0,0,0,0.18))">
                <rect x="18" y="14" width="28" height="28" rx="3" fill="#FFFFFF" />
                <polygon points="39,14 46,21 39,21" fill="#E2E8F0" />
                {/* Subtle text lines */}
                <rect x="22" y="20" width="13" height="2.5" rx="1.2" fill="#0066CC" fillOpacity="0.8" />
                <rect x="22" y="25" width="19" height="2" rx="1" fill="#94A3B8" />
                <rect x="22" y="29" width="15" height="2" rx="1" fill="#CBD5E1" />
            </g>

            {/* Front Folder Flap with Gradient */}
            <g filter="drop-shadow(0 2px 3px rgba(0,0,0,0.2))">
                <path
                    d="M12 27 C12 24.8 13.8 23 16 23 L48 23 C50.2 23 52 24.8 52 27 L52 47 C52 49.8 49.8 52 47 52 L17 52 C14.2 52 12 49.8 12 47 Z"
                    fill="url(#aether-icon-exp-front)"
                />
                <line x1="14" y1="24.5" x2="50" y2="24.5" stroke="#FFFFFF" strokeOpacity="0.45" strokeWidth="1" />
            </g>

            <defs>
                <linearGradient id="aether-icon-exp-front" x1="0" y1="23" x2="0" y2="52" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#38BEFF" />
                    <stop offset="100%" stopColor="#0077ED" />
                </linearGradient>
            </defs>
        </BaseSquircle>
    )
}

/** 4. Terminal */
export function TerminalIcon({ className, style }: AppIconSvgProps) {
    return (
        <BaseSquircle id="term" gradientStops={['#27272A', '#0F0F12']} className={className} style={style}>
            {/* Window titlebar divider line */}
            <line x1="0" y1="17" x2="64" y2="17" stroke="#FFFFFF" strokeOpacity="0.1" strokeWidth="1" />

            {/* Three traffic light dots */}
            <circle cx="13" cy="11" r="2.3" fill="#FF5F56" />
            <circle cx="18.5" cy="11" r="2.3" fill="#FFBD2E" />
            <circle cx="24" cy="11" r="2.3" fill="#28C840" />

            {/* Emerald neon glow under prompt */}
            <circle cx="21" cy="33" r="10" fill="#30D158" fillOpacity="0.15" />

            {/* Terminal prompt: > _ */}
            <path
                d="M15 25 L24 32.5 L15 40"
                fill="none"
                stroke="#30D158"
                strokeWidth="3.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="drop-shadow(0 0 3px rgba(48,209,88,0.4))"
            />
            {/* Blinking rectangular block cursor */}
            <rect x="29" y="36.5" width="13" height="3.5" rx="1" fill="#30D158" />
            {/* Secondary line preview */}
            <line x1="29" y1="29" x2="47" y2="29" stroke="#71717A" strokeWidth="2.2" strokeLinecap="round" />
        </BaseSquircle>
    )
}

/** 5. Task Manager */
export function TaskManagerIcon({ className, style }: AppIconSvgProps) {
    return (
        <BaseSquircle id="taskmgr" gradientStops={['#2B2B2F', '#141416']} className={className} style={style}>
            {/* Oscilloscope Grid Lines */}
            <line x1="12" y1="24" x2="52" y2="24" stroke="#FFFFFF" strokeOpacity="0.08" strokeWidth="1" strokeDasharray="2 2" />
            <line x1="12" y1="34" x2="52" y2="34" stroke="#FFFFFF" strokeOpacity="0.08" strokeWidth="1" strokeDasharray="2 2" />
            <line x1="12" y1="44" x2="52" y2="44" stroke="#FFFFFF" strokeOpacity="0.08" strokeWidth="1" strokeDasharray="2 2" />
            <line x1="22" y1="16" x2="22" y2="48" stroke="#FFFFFF" strokeOpacity="0.08" strokeWidth="1" strokeDasharray="2 2" />
            <line x1="32" y1="16" x2="32" y2="48" stroke="#FFFFFF" strokeOpacity="0.08" strokeWidth="1" strokeDasharray="2 2" />
            <line x1="42" y1="16" x2="42" y2="48" stroke="#FFFFFF" strokeOpacity="0.08" strokeWidth="1" strokeDasharray="2 2" />

            {/* Neon green ECG cardiogram pulse wave */}
            <path
                d="M10 35 L20 35 L24 38 L28 19 L33 46 L37 32 L41 35 L54 35"
                fill="none"
                stroke="#34C759"
                strokeWidth="3.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="drop-shadow(0 0 4px rgba(52,199,89,0.5))"
            />

            {/* Peak telemetry glowing pulse dot */}
            <circle cx="28" cy="19" r="4.5" fill="#34C759" fillOpacity="0.35" />
            <circle cx="28" cy="19" r="2.2" fill="#FFFFFF" />
        </BaseSquircle>
    )
}

/** 6. Settings */
export function SettingsIcon({ className, style }: AppIconSvgProps) {
    return (
        <BaseSquircle id="settings" gradientStops={['#8E8E93', '#48484A']} className={className} style={style}>
            {/* Precision 8-toothed mechanical gear */}
            <g filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))">
                {/* 8 Radial Gear Teeth */}
                {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
                    <rect
                        key={angle}
                        x="28.5"
                        y="9.5"
                        width="7"
                        height="9"
                        rx="1.8"
                        transform={`rotate(${angle} 32 32)`}
                        fill="#E5E5EA"
                    />
                ))}

                {/* Outer Gear Ring */}
                <circle cx="32" cy="32" r="17.5" fill="#E5E5EA" />
                {/* Concentric groove rim */}
                <circle cx="32" cy="32" r="12" fill="#8E8E93" />
                {/* Center axle bore */}
                <circle cx="32" cy="32" r="6.5" fill="#2C2C2E" />
                {/* Inner axle jewel pin */}
                <circle cx="32" cy="32" r="3" fill="#E5E5EA" />
            </g>
        </BaseSquircle>
    )
}

/** 7. Notes */
export function NotesIcon({ className, style }: AppIconSvgProps) {
    return (
        <BaseSquircle id="notes" gradientStops={['#FFBA42', '#F59E0B']} className={className} style={style}>
            {/* Ivory Paper Sheet */}
            <g filter="drop-shadow(0 2px 3px rgba(0,0,0,0.2))">
                <rect x="13" y="11" width="38" height="42" rx="4" fill="#FFFFF7" />

                {/* Warm Stitched Leather Header Strip */}
                <path d="M13 15 C13 12.8 14.8 11 17 11 L47 11 C49.2 11 51 12.8 51 15 L51 20 L13 20 Z" fill="#D97706" />
                {/* Perforated stitch line */}
                <line x1="15" y1="18.5" x2="49" y2="18.5" stroke="#FDE68A" strokeWidth="1" strokeDasharray="2 1.5" />

                {/* Ruled Notebook Lines */}
                <line x1="17" y1="26" x2="47" y2="26" stroke="#93C5FD" strokeWidth="1.2" strokeOpacity="0.75" />
                <line x1="17" y1="32" x2="47" y2="32" stroke="#93C5FD" strokeWidth="1.2" strokeOpacity="0.75" />
                <line x1="17" y1="38" x2="42" y2="38" stroke="#93C5FD" strokeWidth="1.2" strokeOpacity="0.75" />
                <line x1="17" y1="44" x2="36" y2="44" stroke="#93C5FD" strokeWidth="1.2" strokeOpacity="0.75" />

                {/* Angled Yellow Pencil */}
                <g transform="translate(38 34) rotate(-35)" filter="drop-shadow(0 1.5px 2px rgba(0,0,0,0.25))">
                    <rect x="-2" y="-12" width="5" height="20" rx="1" fill="#F59E0B" />
                    {/* Pink eraser */}
                    <rect x="-2" y="8" width="5" height="4" rx="1" fill="#F472B6" />
                    {/* Ferrule */}
                    <rect x="-2" y="6" width="5" height="2" fill="#CBD5E1" />
                    {/* Pencil wood tip and lead */}
                    <polygon points="-2,-12 3,-12 0.5,-17" fill="#FDE68A" />
                    <polygon points="-0.5,-15 1.5,-15 0.5,-17" fill="#374151" />
                </g>
            </g>
        </BaseSquircle>
    )
}

/** 8. Docs */
export function DocsIcon({ className, style }: AppIconSvgProps) {
    return (
        <BaseSquircle id="docs" gradientStops={['#2688FF', '#0052CC']} className={className} style={style}>
            {/* Crisp White Document Page with Corner Fold */}
            <g filter="drop-shadow(0 2px 4px rgba(0,0,0,0.22))">
                <path
                    d="M16 13 C16 11.3 17.3 10 19 10 L37 10 L48 21 L48 50 C48 51.7 46.7 53 45 53 L19 53 C17.3 53 16 51.7 16 50 Z"
                    fill="#FFFFFF"
                />
                {/* Folded Top-Right Corner */}
                <polygon points="37,10 37,21 48,21" fill="#003D99" fillOpacity="0.4" />
                <polygon points="37,10 37,21 48,21" fill="#E2E8F0" />

                {/* Formatted Content Lines */}
                <rect x="21" y="24" width="16" height="3.5" rx="1.75" fill="#0066CC" />
                <rect x="21" y="31" width="22" height="2.5" rx="1.25" fill="#64748B" />
                <rect x="21" y="36.5" width="22" height="2.5" rx="1.25" fill="#94A3B8" />
                <rect x="21" y="42" width="15" height="2.5" rx="1.25" fill="#CBD5E1" />
            </g>
        </BaseSquircle>
    )
}

/** 9. Boards */
export function BoardsIcon({ className, style }: AppIconSvgProps) {
    return (
        <BaseSquircle id="boards" gradientStops={['#6366F1', '#4338CA']} className={className} style={style}>
            {/* 3 Staggered Kanban Columns (To Do, In Progress, Done) */}
            <g filter="drop-shadow(0 2px 3px rgba(0,0,0,0.2))">
                {/* Column 1 (To Do) */}
                <rect x="11" y="14" width="11" height="36" rx="2.5" fill="#FFFFFF" fillOpacity="0.22" />
                <rect x="12.5" y="17" width="8" height="9" rx="1.5" fill="#FFFFFF" />
                <rect x="12.5" y="28" width="8" height="12" rx="1.5" fill="#FFFFFF" fillOpacity="0.85" />

                {/* Column 2 (In Progress) */}
                <rect x="26.5" y="14" width="11" height="36" rx="2.5" fill="#FFFFFF" fillOpacity="0.3" />
                <rect x="28" y="17" width="8" height="14" rx="1.5" fill="#FFFFFF" />
                <rect x="29.5" y="19" width="5" height="2" rx="1" fill="#38BDF8" />
                <rect x="28" y="33" width="8" height="8" rx="1.5" fill="#FFFFFF" fillOpacity="0.85" />

                {/* Column 3 (Done) */}
                <rect x="42" y="14" width="11" height="36" rx="2.5" fill="#FFFFFF" fillOpacity="0.22" />
                <rect x="43.5" y="17" width="8" height="11" rx="1.5" fill="#FFFFFF" />
                <circle cx="47.5" cy="22.5" r="1.5" fill="#22C55E" />
                <rect x="43.5" y="30" width="8" height="10" rx="1.5" fill="#FFFFFF" fillOpacity="0.75" />
            </g>
        </BaseSquircle>
    )
}

/** 10. Download Manager */
export function DownloadsIcon({ className, style }: AppIconSvgProps) {
    return (
        <BaseSquircle id="downloads" gradientStops={['#34C759', '#1E8238']} className={className} style={style}>
            <g filter="drop-shadow(0 2px 3px rgba(0,0,0,0.22))">
                {/* Aerodynamic Downward Arrow */}
                <path d="M32 14 V34" stroke="#FFFFFF" strokeWidth="4.5" strokeLinecap="round" />
                <path d="M21 26 L32 37 L43 26" fill="none" stroke="#FFFFFF" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />

                {/* Receiving Tray */}
                <path
                    d="M16 41 H48 C49.5 41 50 42 50 44 V45 C50 47.5 48 49 46 49 H18 C16 49 14 47.5 14 45 V44 C14 42 14.5 41 16 41 Z"
                    fill="#FFFFFF"
                />
            </g>
        </BaseSquircle>
    )
}

/** 11. OS Simulation Lab */
export function OsLabIcon({ className, style }: AppIconSvgProps) {
    return (
        <BaseSquircle id="os-lab" gradientStops={['#0EA5E9', '#0369A1']} className={className} style={style}>
            {/* Swirling atomic orbital rings */}
            <ellipse
                cx="32"
                cy="33"
                rx="21"
                ry="8"
                fill="none"
                stroke="#67E8F9"
                strokeWidth="1.4"
                strokeOpacity="0.6"
                transform="rotate(-30 32 33)"
            />
            <circle cx="48" cy="24" r="2" fill="#FFFFFF" />

            {/* Science Flask */}
            <g filter="drop-shadow(0 2px 3px rgba(0,0,0,0.2))">
                {/* Glowing cyan liquid inside flask */}
                <path
                    d="M21 44 L25.5 37 C28 38.5 36 35.5 38.5 37 L43 44 C44 46 43 47 41 47 H23 C21 47 20 46 21 44 Z"
                    fill="#38BDF8"
                    fillOpacity="0.9"
                />
                {/* Bubble spheres */}
                <circle cx="28" cy="34" r="1.8" fill="#FFFFFF" fillOpacity="0.9" />
                <circle cx="35" cy="31" r="1.2" fill="#FFFFFF" fillOpacity="0.8" />
                <circle cx="31.5" cy="26" r="1.5" fill="#FFFFFF" fillOpacity="0.8" />

                {/* Glass outline */}
                <path
                    d="M28 14 H36 V24 L46 41 C47.5 43.5 45.8 47 43 47 H21 C18.2 47 16.5 43.5 18 41 L28 24 Z"
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth="2.6"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                />
            </g>
        </BaseSquircle>
    )
}

/** 12. Mail */
export function MailIcon({ className, style }: AppIconSvgProps) {
    return (
        <BaseSquircle id="mail" gradientStops={['#38BDF8', '#0284C7']} className={className} style={style}>
            <g filter="drop-shadow(0 2px 3px rgba(0,0,0,0.2))">
                {/* Crisp White Envelope Body */}
                <rect x="12" y="18" width="40" height="28" rx="4" fill="#FFFFFF" />

                {/* Triangular folded flap */}
                <polygon points="12,18 32,34 52,18" fill="#F1F5F9" />
                <path d="M12 18 L32 34 L52 18" fill="none" stroke="#E2E8F0" strokeWidth="1.5" strokeLinejoin="round" />

                {/* Lower diagonal creases */}
                <line x1="12" y1="46" x2="27" y2="30" stroke="#E2E8F0" strokeWidth="1.2" />
                <line x1="52" y1="46" x2="37" y2="30" stroke="#E2E8F0" strokeWidth="1.2" />
            </g>
        </BaseSquircle>
    )
}

/** 13. DevTools Pack */
export function DevToolsIcon({ className, style }: AppIconSvgProps) {
    return (
        <BaseSquircle id="devtools" gradientStops={['#323236', '#1A1A1C']} className={className} style={style}>
            {/* Glowing amber code syntax brackets: < / > */}
            <g filter="drop-shadow(0 0 3px rgba(251,191,36,0.4))">
                <path
                    d="M21 23 L13 32 L21 41"
                    fill="none"
                    stroke="#FBBF24"
                    strokeWidth="3.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M43 23 L51 32 L43 41"
                    fill="none"
                    stroke="#FBBF24"
                    strokeWidth="3.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <line
                    x1="36"
                    y1="20"
                    x2="28"
                    y2="44"
                    stroke="#F59E0B"
                    strokeWidth="3"
                    strokeLinecap="round"
                />
            </g>
        </BaseSquircle>
    )
}

/** 14. Fallback Generic App Icon */
export function GenericAppIcon({ className, style }: AppIconSvgProps) {
    return (
        <BaseSquircle id="generic" gradientStops={['#4B5563', '#1F2937']} className={className} style={style}>
            {/* Elegant stylized app window mark */}
            <g filter="drop-shadow(0 1.5px 2px rgba(0,0,0,0.25))">
                <rect x="16" y="16" width="32" height="32" rx="5" fill="none" stroke="#FFFFFF" strokeWidth="2.5" />
                <line x1="16" y1="25" x2="48" y2="25" stroke="#FFFFFF" strokeWidth="2" strokeOpacity="0.8" />
                <circle cx="21" cy="20.5" r="1.5" fill="#FFFFFF" />
                <circle cx="26" cy="20.5" r="1.5" fill="#FFFFFF" />
                <rect x="22" y="31" width="20" height="3" rx="1.5" fill="#38BDF8" />
            </g>
        </BaseSquircle>
    )
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
}
