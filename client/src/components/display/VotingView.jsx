import { Users, TrendingUp } from 'lucide-react';

function VotingView({ participant, liveStats, average }) {
    return (
        <div className="w-full max-w-7xl animate-in fade-in slide-in-from-right-10 duration-700 px-6">
            <div className="flex items-start gap-16">
                {/* Left Side: Photo Dossier */}
                {participant.photoUrl && (
                    <div className="relative group flex-shrink-0">
                        <div className="absolute -inset-4 bg-spy-green opacity-10 blur-2xl"></div>
                        <div className="relative">
                            {/* HUD Corners for Image */}
                            <div className="absolute -top-4 -left-4 w-12 h-12 border-t-4 border-l-4 border-spy-green"></div>
                            <div className="absolute -top-4 -right-4 w-12 h-12 border-t-4 border-r-4 border-spy-green"></div>
                            <div className="absolute -bottom-4 -left-4 w-12 h-12 border-b-4 border-l-4 border-spy-green"></div>
                            <div className="absolute -bottom-4 -right-4 w-12 h-12 border-b-4 border-r-4 border-spy-green"></div>

                            <img
                                src={participant.photoUrl}
                                alt={participant.name}
                                className="w-[450px] h-[450px] object-cover border-2 border-spy-green/30"
                            />
                        </div>
                    </div>
                )}

                {/* Right Side: Identity Details */}
                <div className="flex-1 text-left">
                    <div className="flex items-center gap-3 mb-6">
                        <TrendingUp className="w-10 h-10 text-spy-green" />
                        <span className="font-mono-tech text-xl text-spy-green tracking-[0.4em] uppercase font-bold">
                            LIVE INTELLIGENCE STREAMING
                        </span>
                    </div>

                    <h1 className="font-orbitron text-[90px] font-black text-white mb-4 leading-none uppercase drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                        {participant.name}
                    </h1>

                    <div className="flex gap-8 text-gray-500 font-mono-tech text-xl mb-12">
                        <span>ID: <span className="text-white">{participant.code || `P-${participant.orderNumber}`}</span></span>
                        <span className="text-spy-green">|</span>
                        <span>SEQUENCE: <span className="text-white">#{participant.orderNumber}</span></span>
                    </div>

                    <div className="flex flex-col gap-8">
                        <div className="inline-flex items-center gap-6 bg-spy-green/10 border-2 border-spy-green px-10 py-5 group hover:bg-spy-green/20 transition-all max-w-md">
                            <div className="relative">
                                <div className="w-6 h-6 bg-spy-green rounded-full pulse-glow"></div>
                                <div className="absolute inset-0 bg-spy-green rounded-full animate-ping"></div>
                            </div>
                            <span className="font-orbitron text-3xl font-black text-spy-green tracking-[0.2em]">
                                VOTING ACTIVE
                            </span>
                        </div>
                        <p className="font-mono-tech text-xs text-gray-500 tracking-[0.5em] pl-2 uppercase">
                            +++ SECURE JUDGE TERMINALS ENCRYPTED +++
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default VotingView;
