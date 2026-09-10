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
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-muted-48" />
                <input
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    placeholder="Search or enter URL..."
                    className={`w-full rounded-pill border py-1.5 pl-9 pr-3 text-xs
                        bg-canvas text-ink placeholder-ink-muted-48
                        focus:border-primary-focus focus:outline-none focus:ring-1 focus:ring-primary-focus
                        transition-colors duration-150
                        ${isFocused ? 'border-primary-focus' : 'border-hairline'}
                    `}
                />
            </div>
        </form>
    );
}
