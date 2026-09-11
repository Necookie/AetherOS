import React, { useState, useRef, useEffect } from 'react';
import { useFsStore } from '../../../stores/fsStore';
import { ChevronRight, HardDrive, Home } from 'lucide-react';

export default function AddressBar() {
    const { currentPath, navigate } = useFsStore();
    const [isEditing, setIsEditing] = useState(false);
    const [editPath, setEditPath] = useState(currentPath);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setEditPath(currentPath);
    }, [currentPath]);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.key === 'l') {
                e.preventDefault();
                setIsEditing(true);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        navigate(editPath);
        setIsEditing(false);
    };

    const handleBlur = () => {
        setIsEditing(false);
        setEditPath(currentPath);
    };

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Escape') {
            setIsEditing(false);
            setEditPath(currentPath);
        }
    };

    if (isEditing) {
        return (
            <form onSubmit={handleSubmit} className="flex min-w-[220px] max-w-xl flex-1 items-center">
                <div className="relative flex w-full items-center">
                    <input
                        ref={inputRef}
                        type="text"
                        value={editPath}
                        onChange={(e) => setEditPath(e.target.value)}
                        onBlur={handleBlur}
                        onKeyDown={handleInputKeyDown}
                        className="h-7 w-full rounded-md border border-primary bg-canvas px-2.5 text-xs text-ink shadow-xs outline-none ring-2 ring-primary/20"
                    />
                </div>
            </form>
        );
    }

    const parts = currentPath.split('/').filter(Boolean);
    const isHome = currentPath.startsWith('/home/user');

    return (
        <div
            className="group flex h-7 min-w-[220px] max-w-xl flex-1 cursor-text items-center overflow-x-auto rounded-md border border-hairline bg-canvas/80 px-2 py-0.5 shadow-2xs transition-colors hover:border-ink-muted-48/50"
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    setIsEditing(true);
                }
            }}
            title="Click to edit path (Ctrl+L)"
        >
            <button
                type="button"
                className="flex shrink-0 items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium text-ink-muted transition-colors hover:bg-black/[0.05] hover:text-ink"
                onClick={(e) => { e.stopPropagation(); navigate('/'); }}
            >
                {isHome ? <Home size={13} className="text-primary" /> : <HardDrive size={13} className="text-ink-muted-48" />}
                <span>{isHome ? '~' : '/'}</span>
            </button>
            {parts.map((part, idx) => {
                const path = '/' + parts.slice(0, idx + 1).join('/');
                const isLast = idx === parts.length - 1;
                return (
                    <React.Fragment key={path}>
                        <ChevronRight className="h-3 w-3 shrink-0 text-ink-muted-48/60" />
                        <button
                            type="button"
                            className={`max-w-[140px] truncate rounded px-1.5 py-0.5 text-xs transition-colors hover:bg-black/[0.05] ${
                                isLast ? 'font-semibold text-ink' : 'text-ink-muted hover:text-ink'
                            }`}
                            onClick={(e) => { e.stopPropagation(); navigate(path); }}
                        >
                            {part}
                        </button>
                    </React.Fragment>
                );
            })}
        </div>
    );
}
