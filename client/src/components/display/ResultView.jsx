import { Lock, Target, Award } from 'lucide-react';
import { serverUrl as SERVER_URL } from '../../config';

function ResultView({ participant }) {
    return (
        <div className="w-full h-full min-h-[60vh] flex items-center justify-center animate-in fade-in zoom-in duration-1000 px-6">
            <div className="relative group w-full max-w-4xl">
                {/* Glow behind */}
                <div className="absolute -inset-1 bg-spy-yellow opacity-10 blur-3xl animate-pulse"></div>

                {/* Main Box */}
                <div className="relative bg-black/80 border-2 border-spy-yellow/30 p-16 backdrop-blur-md shadow-[0_0_50px_rgba(255,204,0,0.15)]">
                    {/* HUD Elements */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-spy-yellow"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-spy-yellow"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-spy-yellow"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-spy-yellow"></div>

                    <div className="text-center w-full">
                        {/* Header Badge */}
                        <div className="inline-flex flex-col items-center gap-4 mb-10">
                            <div className="inline-flex items-center gap-3 px-8 py-2 bg-spy-yellow/10 border border-spy-yellow/50">
                                <Award className="w-6 h-6 text-spy-yellow" />
                                <span className="font-mono-tech text-xl text-spy-yellow tracking-[0.4em] uppercase font-bold">
                                    FINAL_EVALUATION_SCORE
                                </span>
                            </div>
                        </div>

                        {/* Large Score */}
                        <div className="font-orbitron text-[150px] font-black text-spy-yellow leading-none mb-12 drop-shadow-[0_0_80px_rgba(255,204,0,0.8)] tracking-wider">
                            {participant.finalScore ? participant.finalScore.toFixed(2) : "0.00"}
                        </div>

                        {/* Progress Bar Container */}
                        <div className="relative max-w-3xl mx-auto w-full">
                            <div className="h-6 w-full bg-black border-2 border-spy-yellow/30 rounded-full overflow-hidden shadow-[inset_0_0_20px_rgba(0,0,0,1)]">
                                <div
                                    className="h-full bg-spy-yellow shadow-[0_0_40px_rgba(255,204,0,1)] transition-all duration-[3000ms] ease-out relative"
                                    style={{ width: `${(participant.finalScore || 0) * 10}%` }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-full" style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}></div>
                                </div>
                            </div>
                            {/* Tick marks for the bar */}
                            <div className="flex justify-between mt-3 font-mono-tech text-lg text-spy-yellow/60 font-bold px-2">
                                <span>0</span>
                                <span>5.0</span>
                                <span>10.0</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ResultView;
