const DEFAULT_USER_ID = 'admin'

type UserScopeListener = (userId: string) => void

let activeUserId = DEFAULT_USER_ID
const listeners = new Set<UserScopeListener>()

export function getActiveUserId() {
    return activeUserId
}

export function setActiveUserId(userId: string) {
    if (activeUserId === userId) {
        return
    }

    activeUserId = userId
    listeners.forEach((listener) => listener(userId))
}

export function onActiveUserChange(listener: UserScopeListener) {
    listeners.add(listener)
    return () => {
        listeners.delete(listener)
    }
}

export function getScopedStorageKey(baseKey: string, userId = activeUserId) {
    return `${baseKey}.${userId}`
}

export function resetUserScopeForTests() {
    activeUserId = DEFAULT_USER_ID
    listeners.clear()
}
