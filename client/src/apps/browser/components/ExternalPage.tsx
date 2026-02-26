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
        <div className="flex flex-col items-center justify-center h-full w-full bg-gradient-to-b from-white/60 to-gray-50/40 select-none px-6">
            {/* Icon */}
            <div className="w-16 h-16 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-5 shadow-sm">
                <Globe className="w-7 h-7 text-indigo-400" />
            </div>

            {/* Hostname title */}
            <h2 className="text-base font-semibold text-gray-700 mb-1">{hostname}</h2>

            {/* Message */}
            <p className="text-sm text-gray-500 text-center max-w-sm mb-6 leading-relaxed">
                This site was opened in a real browser tab for full compatibility.
            </p>

            {/* URL display */}
            <div className="w-full max-w-sm bg-gray-100/70 rounded-lg px-3 py-2 mb-6 text-xs text-gray-500 font-mono truncate text-center border border-gray-200/60">
                {url}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 justify-center">
                <button
                    onClick={onOpenAgain}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-500 text-white text-sm font-medium
                        hover:bg-indigo-600 active:scale-95 transition-all shadow-sm"
                >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Open again
                </button>

                <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/80 text-gray-700 text-sm font-medium
                        border border-gray-200 hover:bg-gray-100 active:scale-95 transition-all shadow-sm"
                >
                    {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied!' : 'Copy URL'}
                </button>

                {onTryEmbed && (
                    <button
                        onClick={onTryEmbed}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/80 text-gray-500 text-sm
                            border border-gray-200 hover:bg-gray-100 active:scale-95 transition-all shadow-sm"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Try embed
                    </button>
                )}
            </div>
        </div>
    );
}
