import { useRef, useEffect, useCallback } from 'react';

interface WebViewProps {
    url: string;
    onLoad: () => void;
    onError: (reason: string) => void;
}

const LOAD_TIMEOUT_MS = 5000;

export default function WebView({ url, onLoad, onError }: WebViewProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const clearLoadTimeout = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    }, []);

    useEffect(() => {
        clearLoadTimeout();

        // Start a timeout; if the iframe doesn't fire onload within LOAD_TIMEOUT_MS,
        // we treat it as a failure and fall back to external.
        timeoutRef.current = setTimeout(() => {
            onError('timeout');
        }, LOAD_TIMEOUT_MS);

        return clearLoadTimeout;
    }, [url, onError, clearLoadTimeout]);

    const handleLoad = () => {
        clearLoadTimeout();
        onLoad();
    };

    if (!url) return null;

    return (
        <iframe
            ref={iframeRef}
            key={url} // forces re-mount on URL change for clean reload
            src={url}
            title="Web Content"
            className="w-full h-full border-0 bg-white"
            sandbox="allow-forms allow-scripts allow-popups allow-popups-to-escape-sandbox"
            referrerPolicy="no-referrer"
            loading="eager"
            onLoad={handleLoad}
            onError={() => { clearLoadTimeout(); onError('load-error'); }}
        />
    );
}
