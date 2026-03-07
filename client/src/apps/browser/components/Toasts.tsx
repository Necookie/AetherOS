import { useEffect, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

export interface ToastMessage {
    id: string;
    message: string;
    type?: 'info' | 'warning' | 'error';
}

interface ToastsProps {
    toasts: ToastMessage[];
    onDismiss: (id: string) => void;
}

export default function Toasts({ toasts, onDismiss }: ToastsProps) {
    return (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none">
            {toasts.map(toast => (
                <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
            ))}
        </div>
    );
}

function Toast({ toast, onDismiss }: { toast: ToastMessage; onDismiss: (id: string) => void }) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        requestAnimationFrame(() => setVisible(true));
        const timer = setTimeout(() => {
            setVisible(false);
            setTimeout(() => onDismiss(toast.id), 200);
        }, 4000);
        return () => clearTimeout(timer);
    }, [toast.id, onDismiss]);

    const bgColor = toast.type === 'error'
        ? 'bg-red-950/90 border-red-700 text-red-200'
        : toast.type === 'warning'
            ? 'bg-amber-950/90 border-amber-700 text-amber-200'
            : 'bg-slate-900/90 border-slate-700 text-slate-100';

    return (
        <div
            className={`pointer-events-auto flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm shadow-lg backdrop-blur-md
                transition-all duration-200 ${bgColor}
                ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
            `}
        >
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1">{toast.message}</span>
            <button onClick={() => onDismiss(toast.id)} className="rounded p-0.5 hover:bg-white/10">
                <X className="w-3.5 h-3.5" />
            </button>
        </div>
    );
}
