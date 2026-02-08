import { Target } from 'lucide-react';

function StandbyView() {
    return (
        <div className="w-full max-w-6xl animate-in fade-in zoom-in duration-1000">
            <div className="flex items-center justify-center gap-20">
                {/* Left Side: Logo */}
                <div className="relative flex-shrink-0">
                    <div className="absolute -inset-10 bg-spy-red opacity-10 blur-3xl animate-pulse"></div>
                    <img
                        src="/assets/Invento-logo.png"
                        alt="INVENTO"
                        className="w-80 h-80 object-contain floating relative z-10"
                    />
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-48 h-2 bg-spy-red/20 blur-xl"></div>
                </div>

                {/* Right Side: Mission Info */}
                <div className="text-left flex-1 border-l-2 border-spy-red/20 pl-20 py-10">
                    <div className="space-y-4 mb-12">
                        <h1 className="font-orbitron text-[100px] font-black text-white leading-none tracking-wider glitch">
                            INVENTO <span className="text-spy-red">2026</span>
                        </h1>
                        <div className="inline-block bg-spy-red px-10 py-4 transform -rotate-1 shadow-[10px_10px_0_rgba(0,0,0,0.5)]">
                            <p className="font-orbitron text-3xl font-bold text-black tracking-[0.3em]">
                                MOCK PRESS CONFERENCE
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 text-spy-green bg-spy-green/5 border border-spy-green/20 p-6 backdrop-blur-sm max-w-xl">
                        <div className="relative">
                            <div className="w-5 h-5 bg-spy-green rounded-full pulse-glow"></div>
                            <div className="absolute inset-0 bg-spy-green rounded-full animate-ping opacity-30"></div>
                        </div>
                        <p className="font-mono-tech text-xl tracking-[0.4em] font-bold uppercase">
                            AWAITING NEXT TARGET...
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StandbyView;
