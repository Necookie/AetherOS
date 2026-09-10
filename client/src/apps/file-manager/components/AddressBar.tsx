import React, { useState, useRef, useEffect } from 'react';
import { useFsStore } from '../../../stores/fsStore';
import { ChevronRight } from 'lucide-react';

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
            <form onSubmit={handleSubmit} className="flex-1 max-w-2xl">
                <input
                    ref={inputRef}
                    type="text"
                    value={editPath}
                    onChange={(e) => setEditPath(e.target.value)}
                    onBlur={handleBlur}
                    onKeyDown={handleInputKeyDown}
                    className="w-full rounded-pill border border-primary-focus bg-canvas px-2 py-1 text-sm text-ink focus:outline-none focus:ring-1 focus:ring-primary-focus"
                />
            </form>
        );
    }

    const parts = currentPath.split('/').filter(Boolean);

    return (
        <div
            className="flex max-w-2xl flex-1 cursor-text items-center overflow-hidden rounded-pill border border-hairline bg-canvas px-2 py-1"
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    setIsEditing(true);
                }
            }}
        >
            <div
                className="flex cursor-pointer items-center rounded-sm px-1.5 py-0.5 text-sm font-semibold text-ink-muted transition-colors hover:bg-parchment hover:text-ink"
                onClick={(e) => { e.stopPropagation(); navigate('/'); }}
            >
                Root
            </div>
            {parts.map((part, idx) => {
                const path = '/' + parts.slice(0, idx + 1).join('/');
                return (
                    <React.Fragment key={path}>
                        <ChevronRight className="mx-0.5 h-4 w-4 text-ink-muted-48" />
                        <div
                            className="max-w-[150px] truncate rounded-sm px-1.5 py-0.5 text-ink-muted transition-colors hover:bg-parchment hover:text-ink"
                            onClick={(e) => { e.stopPropagation(); navigate(path); }}
                        >
                            {part}
                        </div>
                    </React.Fragment>
                );
            })}
        </div>
    );
}
