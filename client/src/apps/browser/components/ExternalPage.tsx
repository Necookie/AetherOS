import { useState } from 'react';
import { ExternalLink, Copy, Check, Globe, RefreshCw } from 'lucide-react';

interface ExternalPageProps {
    url: string;
    onOpenAgain: () => void;
    onTryEmbed?: () => void;
}

export default function ExternalPage({ url, onOpenAgain, onTryEmbed }: ExternalPageProps) {
    const [copied, setCopied] = useState(false);

    let hostname = '';
    try { hostname = new URL(url).hostname; } catch { hostname = url; }

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = url;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="flex h-full w-full select-none flex-col items-center justify-center bg-[linear-gradient(165deg,#cae8ff_0%,#d9d8ff_44%,#ffd7ea_100%)] px-6">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-white/80 bg-white/70 shadow-sm">
                <Globe className="h-7 w-7 text-sky-500" />
            </div>
            <h2 className="mb-1 text-base font-semibold text-slate-800">{hostname}</h2>
            <p className="mb-6 max-w-sm text-center text-sm leading-relaxed text-slate-600">
                This site was opened in a real browser tab for full compatibility.
            </p>
            <div className="font-term mb-6 w-full max-w-sm truncate rounded-lg border border-white/80 bg-white/80 px-3 py-2 text-center text-xs text-slate-700">
                {url}
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
                <button
                    onClick={onOpenAgain}
                    className="flex items-center gap-1.5 rounded-md bg-sky-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-sky-400 active:scale-95"
                >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Open again
                </button>

                <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 rounded-md border border-white/80 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-white active:scale-95"
                >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? 'Copied!' : 'Copy URL'}
                </button>

                {onTryEmbed && (
                    <button
                        onClick={onTryEmbed}
                        className="flex items-center gap-1.5 rounded-md border border-white/80 bg-white/80 px-4 py-2 text-sm text-slate-700 shadow-sm transition-all hover:bg-white active:scale-95"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Try embed
                    </button>
                )}
            </div>
        </div>
    );
}
