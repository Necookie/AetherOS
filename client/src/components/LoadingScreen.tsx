import React, { useEffect } from 'react';
import LoadingLogo from './loading/LoadingLogo';
import LoadingSpinner from './loading/LoadingSpinner';

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
            <LoadingLogo />
            <LoadingSpinner />
        </div>
    );
};

export default LoadingScreen;
