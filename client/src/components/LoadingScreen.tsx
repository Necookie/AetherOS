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
        <div className="fixed inset-0 bg-slate-50 flex flex-col items-center justify-center z-50">
            <LoadingLogo />
            <LoadingSpinner />
            <div className="mt-8 text-sm font-semibold tracking-[0.3em] uppercase text-gray-500 animate-pulse">
                INITIALIZING AETHER...
            </div>
            <div className="mt-2 text-[10px] text-gray-400 font-mono">
                {Math.min(100, progress)}% / VFS ROOT MOUNTED
            </div>
        </div>
    );
};

export default LoadingScreen;
