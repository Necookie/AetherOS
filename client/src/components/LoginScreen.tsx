import React, { useState } from 'react';
import LoginBackground from './login/LoginBackground';
import LoginAvatar from './login/LoginAvatar';
import LoginControls from './login/LoginControls';
import LoginFooter from './login/LoginFooter';

interface LoginScreenProps {
    onLogin: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    const handleLoginClick = () => {
        setIsLoggingIn(true);
        // Simulate login delay
        setTimeout(() => {
            onLogin();
        }, 2000);
    };

    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden tracking-wide text-slate-100">
            <LoginBackground />
            <div className={`relative z-10 flex flex-col items-center transition-opacity duration-700 ${isLoggingIn ? 'opacity-80' : 'opacity-100'}`}>
                <LoginAvatar />
                <h1 className="mb-8 text-3xl font-light">Administrator</h1>
                <LoginControls isLoggingIn={isLoggingIn} onLogin={handleLoginClick} />
            </div>
            {isLoggingIn && (
                <div className="absolute inset-0 z-0 animate-fade-in bg-black/40 transition-opacity duration-1000"></div>
            )}
            <LoginFooter />
        </div>
    );
};

export default LoginScreen;
