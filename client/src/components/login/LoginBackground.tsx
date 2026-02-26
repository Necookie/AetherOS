export default function LoginBackground() {
    return (
        <div className="absolute inset-0 z-0 bg-[#3a447c] overflow-hidden">
            <div className="absolute top-[-20%] left-[-20%] w-[150%] h-[150%] bg-gradient-to-br from-purple-500/80 via-indigo-600/80 to-blue-700/80 transform -rotate-12 origin-bottom-left clip-path-polygon-1 mix-blend-multiply"></div>
            <div className="absolute top-[-30%] left-[10%] w-[120%] h-[150%] bg-gradient-to-bl from-pink-500/70 via-purple-600/70 to-indigo-800/70 transform rotate-6 origin-bottom shadow-2xl mix-blend-overlay"></div>
            <div className="absolute top-[0%] right-[-10%] w-[100%] h-[120%] bg-gradient-to-tr from-blue-500/60 to-cyan-400/60 transform rotate-[25deg] origin-bottom-right shadow-[0_0_50px_rgba(0,0,0,0.5)]"></div>
            <div className="absolute top-[-10%] left-[-5%] w-[110%] h-[110%] bg-gradient-to-b from-transparent via-[#252a50]/40 to-[#0f1225]/90"></div>
            <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPHBhdGggZD0iTTAgMEw4IDhaTTAgOEw4IDBaIiBzdHJva2U9IiMwMDAiIHN0cm9rZS1vcGFjaXR5PSIwLjEiLz4KPC9zdmc+')] mix-blend-overlay"></div>
        </div>
    )
}
