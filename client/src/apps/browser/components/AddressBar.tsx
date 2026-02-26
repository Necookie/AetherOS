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
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                <input
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    placeholder="Search or enter URL..."
                    className={`w-full pl-8 pr-3 py-1.5 rounded-lg text-xs bg-gray-100/70 border 
                        text-gray-700 placeholder-gray-400
                        focus:outline-none focus:ring-2 focus:ring-indigo-300/50 focus:border-indigo-200 focus:bg-white/90
                        transition-all duration-150
                        ${isFocused ? 'border-indigo-200' : 'border-gray-200/60'}
                    `}
                />
            </div>
        </form>
    );
}
