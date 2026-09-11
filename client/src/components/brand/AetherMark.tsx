import { useId } from 'react'

interface AetherMarkProps {
    className?: string
    title?: string
}

/** A compact A monogram with a detached orbital point. */
export default function AetherMark({ className, title }: AetherMarkProps) {
    const titleId = useId()

    return (
        <svg
            viewBox="0 0 64 64"
            className={className}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            role={title ? 'img' : undefined}
            aria-hidden={title ? undefined : true}
            aria-labelledby={title ? titleId : undefined}
        >
            {title ? <title id={titleId}>{title}</title> : null}
            <path
                fill="currentColor"
                fillRule="evenodd"
                d="M28.03 11.9a4.36 4.36 0 0 1 7.94 0L53.2 49.72h-9.32l-4.1-9.4H24.22l-4.1 9.4H10.8L28.03 11.9Zm-.57 20.98h9.08L32 22.47l-4.54 10.41Z"
                clipRule="evenodd"
            />
            <circle cx="49.5" cy="15.5" r="4.5" fill="currentColor" />
        </svg>
    )
}
