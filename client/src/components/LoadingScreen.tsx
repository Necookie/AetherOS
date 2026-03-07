import React, { useEffect, useState } from 'react';
import LoadingLogo from './loading/LoadingLogo';
import LoadingSpinner from './loading/LoadingSpinner';

interface LoadingScreenProps {
    onComplete: () => void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
    const [progress, setProgress] = useState(0);

    // Simulate a loading time
    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(p => {
                if (p >= 100) {
                    clearInterval(interval);
                    onComplete();
                    return 100;
                }
                return p + Math.floor(Math.random() * 15) + 5;
            });
        }, 300);
        return () => clearInterval(interval);
    }, [onComplete]);

    return (
        <div className="os-desktop-bg fixed inset-0 z-50 flex flex-col items-center justify-center">
            <LoadingLogo />
            <LoadingSpinner />
            <div className="mt-8 animate-pulse text-sm font-semibold uppercase tracking-[0.3em] text-slate-300">
                INITIALIZING AETHER...
            </div>
            <div className="font-term mt-2 text-[10px] text-slate-400">
                {Math.min(100, progress)}% / VFS ROOT MOUNTED
            </div>
        </div>
    );
};

export default LoadingScreen;
