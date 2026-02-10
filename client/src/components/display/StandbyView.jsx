import { Target } from 'lucide-react';

function StandbyView() {
    return (
        <div className="w-full max-w-6xl animate-in fade-in zoom-in duration-1000">
            <div className="flex items-center justify-center gap-20">
                {/* Left Side: Logo */}
                <div className="relative flex-shrink-0">
                    <img
                        src="/assets/Invento-logo.png"
                        alt="INVENTO"
                        className="w-80 h-80 object-contain relative z-10"
                    />
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
                </div>
            </div>
        </div>
    );
}

export default StandbyView;
