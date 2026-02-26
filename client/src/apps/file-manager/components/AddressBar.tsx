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

    if (isEditing) {
        return (
            <form onSubmit={handleSubmit} className="flex-1 max-w-2xl">
                <input
                    ref={inputRef}
                    type="text"
                    value={editPath}
                    onChange={(e) => setEditPath(e.target.value)}
                    onBlur={handleBlur}
                    className="w-full bg-[#1e1e24] border border-[#3f3f46] text-sm px-2 py-1 rounded text-gray-200 focus:outline-none focus:border-blue-500"
                />
            </form>
        );
    }

    const parts = currentPath.split('/').filter(Boolean);

    return (
        <div
            className="flex-1 max-w-2xl flex items-center bg-[#1e1e24] border border-[#3f3f46] rounded px-2 py-1 cursor-text overflow-hidden hover:border-[#52525b]"
            onClick={() => setIsEditing(true)}
        >
            <div className="flex items-center text-sm font-medium hover:bg-white/10 px-1 rounded cursor-pointer" onClick={(e) => { e.stopPropagation(); navigate('/'); }}>
                Root
            </div>
            {parts.map((part, idx) => {
                const path = '/' + parts.slice(0, idx + 1).join('/');
                return (
                    <React.Fragment key={path}>
                        <ChevronRight size={14} className="mx-0.5 text-gray-500" />
                        <div
                            className="flex items-center text-sm font-medium hover:bg-white/10 px-1 rounded cursor-pointer"
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
