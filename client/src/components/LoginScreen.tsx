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
        <div className="fixed inset-0 overflow-hidden text-white flex flex-col items-center justify-center font-sans tracking-wide">
            <LoginBackground />

            {/* Main Content Area */}
            <div className={`relative z-10 flex flex-col items-center transition-opacity duration-700 ${isLoggingIn ? 'opacity-80' : 'opacity-100'}`}>

                {/* Avatar */}
                <LoginAvatar />

                {/* Username */}
                <h1 className="text-3xl font-light mb-8 drop-shadow-md">Administrator</h1>

                {/* Login Controls */}
                <LoginControls isLoggingIn={isLoggingIn} onLogin={handleLoginClick} />
            </div>

            {/* Dark Overlay when logging in */}
            {isLoggingIn && (
                <div className="absolute inset-0 z-0 bg-black/40 transition-opacity duration-1000 animate-fade-in"></div>
            )}

            {/* Bottom Right Controls */}
            <LoginFooter />

        </div>
    );
};

export default LoginScreen;
