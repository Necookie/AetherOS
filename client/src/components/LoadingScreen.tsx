import React, { useEffect } from 'react';
import { Loader2, Hexagon } from 'lucide-react';

interface LoadingScreenProps {
    onComplete: () => void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
    // Simulate a loading time
    useEffect(() => {
        const timer = setTimeout(() => {
            onComplete();
        }, 2500);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50">
            {/* AetherOS "Logo" Replacement */}
            <div className="flex items-center justify-center mb-16 relative">
                <div className="absolute w-24 h-24 bg-blue-600 rounded-2xl opacity-60 mix-blend-screen blur-[2px] rotate-12 animate-pulse"></div>
                <div className="absolute w-24 h-24 bg-purple-600 rounded-2xl opacity-60 mix-blend-screen blur-[2px] -rotate-12 animate-pulse" style={{ animationDelay: '500ms' }}></div>
                <Hexagon className="w-16 h-16 text-white relative z-10" strokeWidth={1.5} />
            </div>

            {/* Loading Spinner */}
            <div className="flex items-center justify-center mt-8">
                <Loader2 className="w-8 h-8 text-white animate-spin opacity-80" />
            </div>
        </div>
    );
};

export default LoadingScreen;
