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
                    className="w-full bg-white border border-blue-400 text-sm px-2 py-1 rounded text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
            </form>
        );
    }

    const parts = currentPath.split('/').filter(Boolean);

    return (
        <div
            className="flex-1 max-w-2xl flex items-center bg-white/70 border border-gray-200 rounded px-2 py-1 cursor-text overflow-hidden hover:border-gray-300 shadow-inner"
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    setIsEditing(true);
                }
            }}
        >
            <div
                className="flex items-center text-sm font-medium px-1.5 py-0.5 rounded hover:bg-black/5 cursor-pointer text-gray-700 hover:text-gray-900"
                onClick={(e) => { e.stopPropagation(); navigate('/'); }}
            >
                Root
            </div>
            {parts.map((part, idx) => {
                const path = '/' + parts.slice(0, idx + 1).join('/');
                return (
                    <React.Fragment key={path}>
                        <ChevronRight className="w-4 h-4 text-gray-400 mx-0.5" />
                        <div
                            className="px-1.5 py-0.5 rounded hover:bg-black/5 cursor-pointer text-gray-700 hover:text-gray-900 truncate max-w-[150px]"
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
