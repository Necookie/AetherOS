/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                ink: 'var(--ds-color-text-primary)',
                'ink-muted': 'var(--ds-color-text-muted)',
                'ink-muted-80': 'var(--ds-color-text-on-pearl)',
                'ink-muted-48': 'var(--ds-color-ink-muted-48)',
                'on-dark': 'var(--ds-color-text-on-dark)',
                'on-dark-muted': 'var(--ds-color-text-on-dark-muted)',
                hairline: 'var(--ds-color-border)',
                'divider-soft': 'var(--ds-color-divider-soft)',
                primary: 'var(--ds-color-accent)',
                'primary-focus': 'var(--ds-color-accent-focus)',
                'primary-on-dark': 'var(--ds-color-accent-on-dark)',
                canvas: 'var(--ds-color-bg-canvas)',
                parchment: 'var(--ds-color-bg-canvas)',
                surface: 'var(--ds-color-surface-0)',
                pearl: 'var(--ds-color-surface-1)',
                tile: {
                    1: 'var(--ds-color-tile-1)',
                    2: 'var(--ds-color-tile-2)',
                    3: 'var(--ds-color-tile-3)',
                },
                void: 'var(--ds-color-void)',
                chip: 'var(--ds-color-chip-translucent)',
                success: 'var(--ds-color-success)',
                warning: 'var(--ds-color-warning)',
                danger: 'var(--ds-color-danger)',
            },
            fontFamily: {
                sans: 'var(--ds-font-ui)',
                display: 'var(--ds-font-display)',
                mono: 'var(--ds-font-mono)',
            },
            borderRadius: {
                none: 'var(--ds-radius-none)',
                xs: 'var(--ds-radius-xs)',
                sm: 'var(--ds-radius-sm)',
                md: 'var(--ds-radius-md)',
                lg: 'var(--ds-radius-lg)',
                pill: 'var(--ds-radius-pill)',
            },
            boxShadow: {
                elevated: 'var(--ds-shadow-elevated)',
            },
            backdropBlur: {
                frosted: '20px',
            },
        },
    },
    plugins: [],
}
