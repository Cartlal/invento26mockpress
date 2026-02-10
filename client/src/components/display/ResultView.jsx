import { Lock, Target, Award } from 'lucide-react';
import { serverUrl as SERVER_URL } from '../../config';

function ResultView({ participant }) {
    return (
        <div className="w-full max-w-7xl animate-in fade-in slide-in-from-bottom-10 duration-1000 px-6">
            <div className="flex items-center gap-20">
                {/* Left Side: Photo Dossier */}
                {participant.photoUrl ? (
                    <div className="relative group flex-shrink-0">
                        <div className="absolute -inset-6 bg-spy-yellow opacity-10 blur-3xl"></div>
                        <div className="relative">
                            {/* HUD Corners for Image */}
                            <div className="absolute -top-4 -left-4 w-12 h-12 border-t-4 border-l-4 border-spy-yellow"></div>
                            <div className="absolute -top-4 -right-4 w-12 h-12 border-t-4 border-r-4 border-spy-yellow"></div>
                            <div className="absolute -bottom-4 -left-4 w-12 h-12 border-b-4 border-l-4 border-spy-yellow"></div>
                            <div className="absolute -bottom-4 -right-4 w-12 h-12 border-b-4 border-r-4 border-spy-yellow"></div>

                            <img
                                src={`${SERVER_URL}${participant.photoUrl}`}
                                alt={participant.name}
                                className="w-[450px] h-[450px] object-cover border-2 border-spy-yellow/30 shadow-[0_0_50px_rgba(255,204,0,0.15)]"
                            />
                        </div>
                    </div>
                ) : (
                    <div className="w-[450px] h-[450px] bg-dark-panel border-2 border-spy-yellow/20 flex items-center justify-center">
                        <Target className="w-24 h-24 text-spy-yellow opacity-20" />
                    </div>
                )}

                {/* Right Side: Identity & Results */}
                <div className="flex-1 text-left pt-4">
                    <h1 className="font-orbitron text-[90px] font-black text-white mb-8 leading-tight uppercase drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                        {participant.name}
                    </h1>

                    <div className="inline-block relative">
                        <div className="absolute -inset-4 bg-spy-yellow opacity-5 blur-2xl"></div>
                        <div className="relative bg-black/40 border-l-8 border-spy-yellow p-10 backdrop-blur-md">
                            <div className="font-mono-tech text-xl text-spy-yellow tracking-[0.5em] mb-4 uppercase font-bold opacity-70 flex items-center gap-3">
                                <Award className="w-6 h-6" />
                                FINAL_AVERAGE_SCORE
                            </div>

                            <div className="font-orbitron text-[110px] font-black text-spy-yellow leading-none mb-6 drop-shadow-[0_0_60px_rgba(255,204,0,0.6)]">
                                {participant.finalScore ? participant.finalScore.toFixed(2) : "0.00"}
                            </div>

                            <div className="h-4 w-full bg-gray-900 rounded-full overflow-hidden border border-white/10 max-w-lg">
                                <div
                                    className="h-full bg-spy-yellow shadow-[0_0_30px_rgba(255,204,0,1)] transition-all duration-[3000ms] ease-out"
                                    style={{ width: `${(participant.finalScore || 0) * 10}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ResultView;
