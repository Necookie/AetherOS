export const shellZIndex = {
    desktop: 400,
    topbar: 500,
    dock: 700,
    flyout: 900,
} as const

export const shellSizing = {
    topbarHeight: '2.75rem',
    dockHeight: '3.5rem',
    edgeGap: '0.75rem',
} as const

// Apple-derived typography scale (design.md). Sizes below 20px use
// SF Pro Text / --ds-font-ui; 20px and above use SF Pro Display / --ds-font-display.
export const typography = {
    heroDisplay: { fontSize: '56px', fontWeight: 600, lineHeight: 1.07, letterSpacing: '-0.28px' },
    displayLg: { fontSize: '40px', fontWeight: 600, lineHeight: 1.10, letterSpacing: '0' },
    displayMd: { fontSize: '34px', fontWeight: 600, lineHeight: 1.47, letterSpacing: '-0.374px' },
    lead: { fontSize: '28px', fontWeight: 400, lineHeight: 1.14, letterSpacing: '0.196px' },
    leadAiry: { fontSize: '24px', fontWeight: 300, lineHeight: 1.5, letterSpacing: '0' },
    tagline: { fontSize: '21px', fontWeight: 600, lineHeight: 1.19, letterSpacing: '0.231px' },
    bodyStrong: { fontSize: '17px', fontWeight: 600, lineHeight: 1.24, letterSpacing: '-0.374px' },
    body: { fontSize: '17px', fontWeight: 400, lineHeight: 1.47, letterSpacing: '-0.374px' },
    denseLink: { fontSize: '17px', fontWeight: 400, lineHeight: 2.41, letterSpacing: '0' },
    caption: { fontSize: '14px', fontWeight: 400, lineHeight: 1.43, letterSpacing: '-0.224px' },
    captionStrong: { fontSize: '14px', fontWeight: 600, lineHeight: 1.29, letterSpacing: '-0.224px' },
    buttonLarge: { fontSize: '18px', fontWeight: 300, lineHeight: 1.0, letterSpacing: '0' },
    buttonUtility: { fontSize: '14px', fontWeight: 400, lineHeight: 1.29, letterSpacing: '-0.224px' },
    finePrint: { fontSize: '12px', fontWeight: 400, lineHeight: 1.0, letterSpacing: '-0.12px' },
    microLegal: { fontSize: '10px', fontWeight: 400, lineHeight: 1.3, letterSpacing: '-0.08px' },
    navLink: { fontSize: '12px', fontWeight: 400, lineHeight: 1.0, letterSpacing: '-0.12px' },
} as const
