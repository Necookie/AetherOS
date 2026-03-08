import type { ThemeTokens } from './types'
import { contrastRatio } from './themeEngine'

export interface AccessibilityReport {
    contrastRatio: number
    contrastPass: boolean
    keyboardFocusPass: boolean
    keyboardTargetPass: boolean
}

function parsePixels(value: string) {
    const parsed = Number.parseFloat(value)
    return Number.isFinite(parsed) ? parsed : 0
}

export function runAccessibilityChecks(tokens: ThemeTokens): AccessibilityReport {
    const ratio = contrastRatio(tokens.colorTextPrimary, tokens.colorSurface)
    const focusWidthPx = parsePixels(tokens.focusRingWidth)
    const minControlHeightRem = parsePixels(tokens.controlMinHeight)

    return {
        contrastRatio: ratio,
        contrastPass: ratio >= 4.5,
        keyboardFocusPass: focusWidthPx >= 2,
        keyboardTargetPass: minControlHeightRem >= 2,
    }
}
