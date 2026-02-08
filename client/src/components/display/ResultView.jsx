import { Lock, Target, Award } from 'lucide-react';

function ResultView({ participant }) {
    return (
        <div className="w-full max-w-[90vw] animate-in fade-in slide-in-from-bottom-10 duration-1000 px-10">
            <div className="flex items-center justify-between gap-12">

                {/* 1. LEFT: Target Photo */}
                {participant.photoUrl ? (
                    <div className="relative group flex-shrink-0">
                        <div className="absolute -inset-4 bg-spy-yellow opacity-10 blur-2xl"></div>
                        <div className="relative">
                            <div className="absolute -top-3 -left-3 w-8 h-8 border-t-4 border-l-4 border-spy-yellow"></div>
                            <div className="absolute -top-3 -right-3 w-8 h-8 border-t-4 border-r-4 border-spy-yellow"></div>
                            <div className="absolute -bottom-3 -left-3 w-8 h-8 border-b-4 border-l-4 border-spy-yellow"></div>
                            <div className="absolute -bottom-3 -right-3 w-8 h-8 border-b-4 border-r-4 border-spy-yellow"></div>

                            <img
                                src={participant.photoUrl}
                                alt={participant.name}
                                className="w-[300px] h-[300px] object-cover border-2 border-spy-yellow/30 shadow-[0_0_50px_rgba(255,204,0,0.1)]"
                            />
                        </div>
                    </div>
                ) : (
                    <div className="w-[300px] h-[300px] bg-dark-panel border-2 border-spy-yellow/20 flex items-center justify-center">
                        <Target className="w-20 h-20 text-spy-yellow opacity-20" />
                    </div>
                )}

                {/* 2. CENTER: Identity (Expanded) */}
                <div className="flex-1 text-center px-4">
                    <div className="flex flex-col items-center">
                        <div className="flex items-center gap-3 mb-4 opacity-70">
                            <Target className="w-6 h-6 text-spy-yellow" />
                            <span className="font-mono-tech text-sm text-spy-yellow tracking-[0.5em] uppercase font-bold">
                                TARGET_EVALUATION_COMPLETE
                            </span>
                        </div>

                        <h2 className="font-orbitron text-[80px] font-black text-white mb-6 leading-tight uppercase drop-shadow-[0_0_40px_rgba(255,255,255,0.15)] max-w-2xl">
                            {participant.name}
                        </h2>

                        <div className="flex gap-8 text-gray-500 font-mono-tech text-lg">
                            <span>ID: <span className="text-white">{participant.code || `P-${participant.orderNumber}`}</span></span>
                            <span className="text-spy-yellow opacity-30">|</span>
                            <span>SEQ: <span className="text-white">#{participant.orderNumber}</span></span>
                        </div>
                    </div>
                </div>

                {/* 3. RIGHT: Final Score Card */}
                <div className="relative flex-shrink-0 w-[350px]">
                    <div className="absolute -inset-6 bg-spy-yellow opacity-10 blur-3xl"></div>
                    <div className="bg-black/90 border-4 border-spy-yellow hud-corners p-10 backdrop-blur-md relative overflow-hidden text-center">
                        <div className="font-mono-tech text-xs text-gray-400 tracking-[0.3em] mb-4 uppercase">
                            AGGREGATED_SCORE //
                        </div>

                        <div className="font-orbitron text-[90px] font-black text-spy-yellow leading-none mb-6 drop-shadow-[0_0_50px_rgba(255,204,0,0.5)]">
                            {participant.finalScore ? participant.finalScore.toFixed(2) : "0.00"}
                        </div>

                        <div className="h-3 w-full bg-gray-900 rounded-full overflow-hidden mb-6 border border-white/10">
                            <div
                                className="h-full bg-spy-yellow shadow-[0_0_30px_rgba(255,204,0,1)] transition-all duration-[3000ms] ease-out"
                                style={{ width: `${(participant.finalScore || 0) * 10}%` }}
                            ></div>
                        </div>

                        <p className="font-mono-tech text-[10px] text-spy-yellow font-black tracking-[0.4em] animate-pulse">
                            ARCHIVE_SECURED_0x26
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default ResultView;
