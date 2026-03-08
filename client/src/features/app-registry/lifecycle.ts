import type { LifecycleContext, LifecycleEvent } from './types'

type LifecycleHandler = (context: LifecycleContext) => void | Promise<void>

type LifecycleHandlers = Partial<Record<LifecycleEvent, LifecycleHandler>>

export interface AppLifecycleService {
    register: (appId: string, handlers: LifecycleHandlers) => void
    dispatch: (event: LifecycleEvent, context: LifecycleContext) => Promise<void>
}

export function createAppLifecycleService(): AppLifecycleService {
    const handlersByApp = new Map<string, LifecycleHandlers>()

    return {
        register: (appId, handlers) => {
            handlersByApp.set(appId, handlers)
        },
        dispatch: async (event, context) => {
            const handlers = handlersByApp.get(context.appId)
            const handler = handlers?.[event]
            if (!handler) {
                return
            }

            await handler(context)
        },
    }
}
