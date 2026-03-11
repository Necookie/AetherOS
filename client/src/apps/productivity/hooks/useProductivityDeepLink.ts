import { useEffect } from 'react'
import type { RefObject } from 'react'
import { useDeepLinkIntentStore } from '../../../features/deep-links/store'
import type { ProductivityAppId } from '../../../features/productivity'

interface FocusRefs {
    editor?: RefObject<HTMLElement | null>
    links?: RefObject<HTMLElement | null>
    attachments?: RefObject<HTMLElement | null>
}

interface Options {
    appId: ProductivityAppId
    selectRecord: (recordId: string) => void
    refs?: FocusRefs
}

export function useProductivityDeepLink({ appId, selectRecord, refs }: Options) {
    const intent = useDeepLinkIntentStore((state) => state.productivity[appId])
    const editorRef = refs?.editor
    const linksRef = refs?.links
    const attachmentsRef = refs?.attachments

    useEffect(() => {
        if (!intent) {
            return
        }

        selectRecord(intent.payload.recordId)

        const targetRef = intent.payload.panel === 'links'
            ? linksRef
            : intent.payload.panel === 'attachments'
                ? attachmentsRef
                : editorRef
        const timerId = window.setTimeout(() => {
            targetRef?.current?.focus()
        }, 40)

        return () => window.clearTimeout(timerId)
    }, [attachmentsRef, editorRef, intent, linksRef, selectRecord])
}
