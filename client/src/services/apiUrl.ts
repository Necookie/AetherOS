const configuredApiBaseUrl = import.meta.env.DEV
    ? import.meta.env.VITE_API_URL?.trim() ?? ''
    : ''

export function normalizeApiBaseUrl(value: string) {
    return value.replace(/\/+$/, '')
}

export function createApiUrl(path: string) {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`
    return `${normalizeApiBaseUrl(configuredApiBaseUrl)}${normalizedPath}`
}
