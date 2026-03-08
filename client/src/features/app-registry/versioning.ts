export interface Semver {
    major: number
    minor: number
    patch: number
}

const SEMVER_PATTERN = /^(\d+)\.(\d+)\.(\d+)$/

export function parseSemver(version: string): Semver | null {
    const match = version.trim().match(SEMVER_PATTERN)
    if (!match) {
        return null
    }

    const [major, minor, patch] = match.slice(1).map(Number)
    return { major, minor, patch }
}

export function compareSemver(left: string, right: string): number {
    const leftParsed = parseSemver(left)
    const rightParsed = parseSemver(right)

    if (!leftParsed || !rightParsed) {
        return 0
    }

    if (leftParsed.major !== rightParsed.major) {
        return leftParsed.major - rightParsed.major
    }

    if (leftParsed.minor !== rightParsed.minor) {
        return leftParsed.minor - rightParsed.minor
    }

    return leftParsed.patch - rightParsed.patch
}

function parseRangeToken(token: string) {
    if (!token) {
        return null
    }

    if (token.startsWith('>=')) {
        return { operator: '>=' as const, version: token.slice(2) }
    }
    if (token.startsWith('<=')) {
        return { operator: '<=' as const, version: token.slice(2) }
    }
    if (token.startsWith('>')) {
        return { operator: '>' as const, version: token.slice(1) }
    }
    if (token.startsWith('<')) {
        return { operator: '<' as const, version: token.slice(1) }
    }
    if (token.startsWith('^')) {
        return { operator: '^' as const, version: token.slice(1) }
    }
    if (token.startsWith('~')) {
        return { operator: '~' as const, version: token.slice(1) }
    }

    return { operator: '=' as const, version: token }
}

function matchesToken(version: string, token: string): boolean {
    const parsedToken = parseRangeToken(token)
    if (!parsedToken) {
        return true
    }

    const cmp = compareSemver(version, parsedToken.version)
    switch (parsedToken.operator) {
        case '>=':
            return cmp >= 0
        case '<=':
            return cmp <= 0
        case '>':
            return cmp > 0
        case '<':
            return cmp < 0
        case '=':
            return cmp === 0
        case '^': {
            const base = parseSemver(parsedToken.version)
            const candidate = parseSemver(version)
            if (!base || !candidate) {
                return false
            }

            if (candidate.major !== base.major) {
                return false
            }

            return compareSemver(version, parsedToken.version) >= 0
        }
        case '~': {
            const base = parseSemver(parsedToken.version)
            const candidate = parseSemver(version)
            if (!base || !candidate) {
                return false
            }

            if (candidate.major !== base.major || candidate.minor !== base.minor) {
                return false
            }

            return compareSemver(version, parsedToken.version) >= 0
        }
        default:
            return false
    }
}

export function satisfiesVersionRange(version: string, range: string): boolean {
    const tokens = range.split(' ').map((part) => part.trim()).filter(Boolean)

    if (tokens.length === 0 || range.trim() === '*') {
        return true
    }

    return tokens.every((token) => matchesToken(version, token))
}

export function pickLatestVersion(versions: string[]): string | null {
    if (versions.length === 0) {
        return null
    }

    const sorted = [...versions].sort((left, right) => compareSemver(right, left))
    return sorted[0] ?? null
}
