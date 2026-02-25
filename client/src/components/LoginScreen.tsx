import React, { useState } from 'react';
import { User, Globe, Power, RotateCw, Loader2 } from 'lucide-react';

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
            {/* Background - Abstract Polygonal/Layered look mimicking the referenced image */}
            <div className="absolute inset-0 z-0 bg-[#3a447c] overflow-hidden">
                {/* We use rotated and clipped divs to simulate the folded geometric structure */}
                <div className="absolute top-[-20%] left-[-20%] w-[150%] h-[150%] bg-gradient-to-br from-purple-500/80 via-indigo-600/80 to-blue-700/80 transform -rotate-12 origin-bottom-left clip-path-polygon-1 mix-blend-multiply"></div>
                <div className="absolute top-[-30%] left-[10%] w-[120%] h-[150%] bg-gradient-to-bl from-pink-500/70 via-purple-600/70 to-indigo-800/70 transform rotate-6 origin-bottom shadow-2xl mix-blend-overlay"></div>
                <div className="absolute top-[0%] right-[-10%] w-[100%] h-[120%] bg-gradient-to-tr from-blue-500/60 to-cyan-400/60 transform rotate-[25deg] origin-bottom-right shadow-[0_0_50px_rgba(0,0,0,0.5)]"></div>
                <div className="absolute top-[-10%] left-[-5%] w-[110%] h-[110%] bg-gradient-to-b from-transparent via-[#252a50]/40 to-[#0f1225]/90"></div>

                {/* A subtle texture overlay */}
                <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPHBhdGggZD0iTTAgMEw4IDhaTTAgOEw4IDBaIiBzdHJva2U9IiMwMDAiIHN0cm9rZS1vcGFjaXR5PSIwLjEiLz4KPC9zdmc+')] mix-blend-overlay"></div>
            </div>

            {/* Main Content Area */}
            <div className={`relative z-10 flex flex-col items-center transition-opacity duration-700 ${isLoggingIn ? 'opacity-80' : 'opacity-100'}`}>

                {/* Avatar */}
                <div className="w-32 h-32 rounded-full bg-slate-200/90 flex items-center justify-center mb-6 shadow-2xl backdrop-blur-sm border border-white/10 transition-transform hover:scale-105 duration-300">
                    <User className="w-16 h-16 text-slate-700" strokeWidth={1.5} />
                </div>

                {/* Username */}
                <h1 className="text-3xl font-light mb-8 drop-shadow-md">Administrator</h1>

                {/* Login Controls */}
                <div className="h-16 flex items-center justify-center">
                    {!isLoggingIn ? (
                        <button
                            onClick={handleLoginClick}
                            className="px-10 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm font-medium tracking-wider shadow-[0_4px_30px_rgba(0,0,0,0.1)]"
                        >
                            Login
                        </button>
                    ) : (
                        <div className="flex flex-col items-center animate-fade-in text-white/80">
                            <Loader2 className="w-8 h-8 animate-spin mb-3 text-white" />
                            <span className="text-sm font-light tracking-widest uppercase shadow-black drop-shadow-md">Welcome</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Dark Overlay when logging in */}
            {isLoggingIn && (
                <div className="absolute inset-0 z-0 bg-black/40 transition-opacity duration-1000 animate-fade-in"></div>
            )}

            {/* Bottom Right Controls */}
            <div className="absolute bottom-8 right-12 z-10 flex flex-col items-end space-y-8">

                {/* Language Selection */}
                <div className="flex flex-col items-end text-sm text-white/70 space-y-2">
                    <div className="mb-2">
                        <Globe className="w-5 h-5 opacity-80" />
                    </div>
                    <button className="text-white font-medium drop-shadow-md">English</button>
                </div>

                {/* Power Icons */}
                <div className="flex items-center space-x-6 pt-4 text-white/80">
                    <button className="hover:text-white hover:scale-110 transition-all cursor-pointer" title="Shut Down">
                        <Power className="w-6 h-6" strokeWidth={1.5} />
                    </button>
                    <button className="hover:text-white hover:scale-110 transition-all cursor-pointer" title="Restart">
                        <RotateCw className="w-6 h-6" strokeWidth={1.5} />
                    </button>
                </div>

            </div>

        </div>
    );
};

export default LoginScreen;
