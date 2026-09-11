interface AetherLauncherMarkProps {
    className?: string
}

/** A compact networked-A mark designed specifically for the dock launcher. */
export default function AetherLauncherMark({ className }: AetherLauncherMarkProps) {
    return (
        <svg
            viewBox="0 0 24 24"
            className={className}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            <path
                d="M5.25 18.25 10.48 6.8a1.67 1.67 0 0 1 3.04 0l5.23 11.45M7.58 13.15h8.84M13.8 5.55l2.63-.18"
                stroke="currentColor"
                strokeWidth="1.65"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <circle cx="12" cy="5.35" r="1.7" fill="currentColor" />
            <circle cx="5" cy="18.7" r="1.7" fill="currentColor" />
            <circle cx="19" cy="18.7" r="1.7" fill="currentColor" />
            <circle cx="18.35" cy="5.25" r="1.45" fill="currentColor" />
        </svg>
    )
}
