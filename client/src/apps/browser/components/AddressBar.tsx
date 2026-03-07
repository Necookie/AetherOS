import { useState, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';

interface AddressBarProps {
    displayUrl: string;
    onSubmit: (value: string) => void;
    focusTrigger: number; // Increment to force focus
}

export default function AddressBar({ displayUrl, onSubmit, focusTrigger }: AddressBarProps) {
    const [value, setValue] = useState(displayUrl);
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Sync external URL changes into the input (only when not focused)
    useEffect(() => {
        if (!isFocused) {
            setValue(displayUrl);
        }
    }, [displayUrl, isFocused]);

    // Handle Ctrl+L focus trigger
    useEffect(() => {
        if (focusTrigger > 0 && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [focusTrigger]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (value.trim()) {
            onSubmit(value.trim());
            inputRef.current?.blur();
        }
    };

    const handleFocus = () => {
        setIsFocused(true);
        // Select all text on focus
        setTimeout(() => inputRef.current?.select(), 0);
    };

    const handleBlur = () => {
        setIsFocused(false);
        setValue(displayUrl);
    };

    return (
        <form onSubmit={handleSubmit} className="flex-1 min-w-0">
            <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                <input
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    placeholder="Search or enter URL..."
                    className={`w-full rounded-md border py-1.5 pl-8 pr-3 text-xs
                        bg-slate-900/70 text-slate-200 placeholder-slate-500
                        focus:border-indigo-400 focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-400/30
                        transition-all duration-150
                        ${isFocused ? 'border-indigo-400' : 'border-slate-700'}
                    `}
                />
            </div>
        </form>
    );
}
