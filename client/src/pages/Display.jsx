import { useState, useEffect } from "react";
import axios from "axios";
import { socket } from "../socket";
import { toast } from "react-hot-toast";
import { Target, TrendingUp, Users, Lock } from 'lucide-react';

import { apiUrl as API_URL } from "../config";

function Display() {
    const [eventState, setEventState] = useState(null);
    const [participant, setParticipant] = useState(null);
    const [liveStats, setLiveStats] = useState({ count: 0, sum: 0 });

    const fetchParticipant = async (id) => {
        try {
            const res = await axios.get(`${API_URL}/admin/participants`);
            const current = res.data.find((p) => p._id === id);
            setParticipant(current);
        } catch (e) {
            console.error(e);
        }
    };

    const fetchState = async () => {
        try {
            const res = await axios.get(`${API_URL}/admin/state`);
            setEventState(res.data);
            if (res.data.currentParticipantId) {
                fetchParticipant(res.data.currentParticipantId);
            }
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchState();
        socket.on("stateUpdate", (newState) => {
            setEventState(newState);
            if (newState.currentParticipantId && newState.currentParticipantId !== participant?._id) {
                fetchParticipant(newState.currentParticipantId);
                setLiveStats({ count: 0, sum: 0 });
            }
        });

        socket.on("newVote", ({ participantId, score }) => {
            if (participantId === participant?._id) {
                setLiveStats(prev => ({
                    count: prev.count + 1,
                    sum: prev.sum + score
                }));
            }
        });

        return () => {
            socket.off("stateUpdate");
            socket.off("newVote");
        };
    }, [participant]);

    if (!eventState) {
        return (
            <div className="h-screen w-screen bg-black flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: "url('/assets/dev-bg.jpg')" }}></div>
                <div className="text-center z-10">
                    <img src="/assets/Invento-logo.png" alt="INVENTO" className="w-40 h-40 mx-auto mb-8 animate-pulse" />
                    <div className="w-20 h-20 border-4 border-spy-green border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                    <p className="font-mono-tech text-spy-green text-lg tracking-widest">ESTABLISHING SECURE CONNECTION...</p>
                </div>
            </div>
        );
    }

    const average = liveStats.count > 0 ? (liveStats.sum / liveStats.count).toFixed(1) : "0.0";

    return (
        <div className="h-screen w-screen bg-black overflow-hidden relative">
            {/* Background */}
            <div className="absolute inset-0 bg-cover bg-center opacity-40" style={{ backgroundImage: "url('/assets/dev-bg.jpg')" }}></div>
            <div className="absolute inset-0 spy-grid-bg opacity-20"></div>
            <div className="scanlines"></div>

            {/* Header Bar */}
            <div className="absolute top-0 left-0 right-0 bg-black/90 border-b-2 border-spy-green/30 p-4 z-50 backdrop-blur-sm">
                <div className="flex items-center justify-between max-w-7xl mx-auto">
                    <div className="flex items-center gap-4">
                        <img src="/assets/Invento-logo.png" alt="INVENTO" className="h-12" />
                        <div>
                            <h1 className="font-orbitron text-xl font-black text-white tracking-wider">
                                INTO THE <span className="text-spy-red">SPYVERSE</span>
                            </h1>
                            <span className="font-mono-tech text-xs text-gray-500 tracking-widest">MOCK PRESS PROTOCOL</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <img src="/assets/KLE-TECH.webp" alt="KLE Tech" className="h-10" />
                        <div className="font-mono-tech text-xs text-gray-500 tracking-widest">
                            {new Date().toLocaleTimeString()}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="h-full w-full flex items-center justify-center pt-24 pb-20 px-8 relative z-10">
                {/* WAITING SCREEN - No participant selected */}
                {!participant && (
                    <div className="text-center">
                        <div className="mb-12">
                            <img src="/assets/Invento-logo.png" alt="INVENTO" className="w-48 h-48 mx-auto mb-8" />
                            <h1 className="font-orbitron text-8xl font-black text-white mb-6 tracking-wider glitch">
                                INVENTO <span className="text-spy-red">2026</span>
                            </h1>
                            <div className="inline-block bg-spy-red px-8 py-3 transform -rotate-2">
                                <p className="font-orbitron text-2xl font-bold text-black tracking-widest">
                                    MOCK PRESS CONFERENCE
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center justify-center gap-4 text-spy-green">
                            <div className="w-4 h-4 bg-spy-green rounded-full pulse-glow"></div>
                            <p className="font-mono-tech text-xl tracking-widest">AWAITING NEXT TARGET...</p>
                        </div>
                    </div>
                )}

                {/* VOTING CLOSED - Participant selected but voting closed */}
                {!eventState.isVotingOpen && participant && (
                    <div className="w-full max-w-6xl">
                        <div className="grid grid-cols-2 gap-12 items-center">
                            {/* Left - Participant Info */}
                            <div>
                                <div className="flex items-center gap-3 mb-6">
                                    <Target className="w-8 h-8 text-spy-yellow" />
                                    <span className="font-mono-tech text-sm text-spy-yellow tracking-widest">
                                        NEXT TARGET
                                    </span>
                                </div>
                                <h2 className="font-orbitron text-7xl font-black text-white mb-4 leading-tight uppercase">
                                    {participant.name}
                                </h2>
                                <div className="flex items-center gap-4 text-gray-400 font-mono-tech text-sm mb-8">
                                    <span>ID: {participant.code || `P-${participant.orderNumber}`}</span>
                                    <span>•</span>
                                    <span>SEQUENCE: #{participant.orderNumber}</span>
                                </div>
                                <div className="inline-flex items-center gap-3 bg-spy-red/20 border-2 border-spy-red px-6 py-3">
                                    <Lock className="w-6 h-6 text-spy-red" />
                                    <span className="font-orbitron text-xl font-bold text-spy-red tracking-wider">
                                        VOTING LOCKED
                                    </span>
                                </div>
                            </div>

                            {/* Right - Status Panel */}
                            <div className="bg-black/80 border-2 border-spy-red hud-corners p-8 backdrop-blur-sm">
                                <div className="text-center">
                                    <div className="w-32 h-32 mx-auto mb-6 border-4 border-spy-red rounded-full flex items-center justify-center">
                                        <Lock className="w-16 h-16 text-spy-red pulse-glow" />
                                    </div>
                                    <p className="font-mono-tech text-sm text-gray-400 tracking-widest mb-2">
                                        SYSTEM STATUS
                                    </p>
                                    <p className="font-orbitron text-3xl font-bold text-spy-red neon-red">
                                        CHANNEL SECURED
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* VOTING ACTIVE - Live voting in progress */}
                {eventState.isVotingOpen && participant && (
                    <div className="w-full max-w-7xl">
                        <div className="grid grid-cols-3 gap-8 items-start">
                            {/* Left - Participant Info */}
                            <div className="col-span-2">
                                <div className="flex items-center gap-3 mb-6 animate-pulse">
                                    <div className="w-4 h-4 bg-spy-red rounded-full"></div>
                                    <span className="font-mono-tech text-lg text-spy-red tracking-widest">
                    /// LIVE TRANSMISSION ///
                                    </span>
                                </div>

                                {/* Participant Photo */}
                                {participant.photoUrl && (
                                    <div className="mb-6">
                                        <img
                                            src={participant.photoUrl}
                                            alt={participant.name}
                                            className="w-48 h-48 object-cover border-4 border-spy-green/50 shadow-neon-green"
                                        />
                                    </div>
                                )}

                                <h1 className="font-orbitron text-8xl font-black text-white mb-6 leading-none uppercase tracking-tight">
                                    {participant.name}
                                </h1>

                                <div className="flex items-center gap-6 mb-8">
                                    <div className="font-mono-tech text-sm text-gray-400">
                                        ID: <span className="text-white">{participant.code || `P-${participant.orderNumber}`}</span>
                                    </div>
                                    <div className="font-mono-tech text-sm text-gray-400">
                                        SEQUENCE: <span className="text-white">#{participant.orderNumber}</span>
                                    </div>
                                </div>

                                <div className="inline-flex items-center gap-4 bg-spy-green/20 border-2 border-spy-green px-8 py-4">
                                    <div className="relative">
                                        <div className="w-6 h-6 bg-spy-green rounded-full pulse-glow"></div>
                                        <div className="absolute inset-0 bg-spy-green rounded-full animate-ping"></div>
                                    </div>
                                    <span className="font-orbitron text-2xl font-bold text-spy-green tracking-wider">
                                        VOTING ACTIVE
                                    </span>
                                </div>
                            </div>

                            {/* Right - Live Stats */}
                            <div className="space-y-6">
                                {/* Vote Counter */}
                                <div className="bg-black/80 border-2 border-spy-green hud-corners p-6 backdrop-blur-sm">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Users className="w-5 h-5 text-spy-green" />
                                        <span className="font-mono-tech text-xs text-gray-400 tracking-widest">
                                            INCOMING VOTES
                                        </span>
                                    </div>
                                    <div className="font-orbitron text-6xl font-black text-spy-green neon-green text-center">
                                        {liveStats.count}
                                    </div>
                                </div>

                                {/* Average Score */}
                                <div className="bg-black/80 border-2 border-spy-blue hud-corners p-6 backdrop-blur-sm">
                                    <div className="flex items-center gap-2 mb-3">
                                        <TrendingUp className="w-5 h-5 text-spy-blue" />
                                        <span className="font-mono-tech text-xs text-gray-400 tracking-widest">
                                            LIVE AVERAGE
                                        </span>
                                    </div>
                                    <div className="font-orbitron text-6xl font-black text-spy-blue text-center">
                                        {average}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer Ticker */}
            <div className="absolute bottom-0 left-0 right-0 bg-spy-red border-t-4 border-spy-yellow py-3 overflow-hidden z-50">
                <div className="whitespace-nowrap animate-marquee font-mono-tech text-lg font-bold text-black tracking-wider">
                    +++ BREAKING: MOCK PRESS CONFERENCE IN PROGRESS +++ LIVE VOTING SYSTEM ACTIVE +++ PARTICIPANTS UNDER EVALUATION +++ CLASSIFIED OPERATION +++ INVENTO 2026 +++
                </div>
            </div>

            <style>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
        </div>
    );
}

export default Display;
