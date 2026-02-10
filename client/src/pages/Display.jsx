import { useState, useEffect } from "react";
import axios from "axios";
import { socket } from "../socket";
import StandbyView from "../components/display/StandbyView";
import VotingView from "../components/display/VotingView";
import ResultView from "../components/display/ResultView";
import QRView from "../components/display/QRView";
import Leaderboard from "./Leaderboard";
import GalleryStoryView from "../components/display/GalleryStoryView";

import { apiUrl as API_URL } from "../config";

function Display() {
    const [eventState, setEventState] = useState(null);
    const [participant, setParticipant] = useState(null);
    const [liveStats, setLiveStats] = useState({ count: 0, sum: 0 });
    const [time, setTime] = useState(new Date().toLocaleTimeString());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
        return () => clearInterval(timer);
    }, []);


    const fetchState = async () => {
        try {
            const res = await axios.get(`${API_URL}/admin/state`);
            setEventState(res.data);
            if (res.data.currentParticipantId) {
                setParticipant(res.data.currentParticipantId);
            }
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchState();

        // Join admin room to receive live stats (new votes)
        socket.emit('joinRoom', 'admin');

        socket.on("stateUpdate", (newState) => {
            console.log("📟 Display: State Update Received", newState.displayMode);
            setEventState(newState);
            const newP = newState.currentParticipantId;

            // Always update participant to get latest fields (status, finalScore, etc.)
            if (newP) {
                // If it's a NEW participant, reset live stats
                if (newP._id !== participant?._id) {
                    setLiveStats({ count: 0, sum: 0 });
                }
                setParticipant(newP);
            } else {
                setParticipant(null);
                setLiveStats({ count: 0, sum: 0 });
            }
        });

        socket.on("newVote", ({ participantId, score }) => {
            const currentId = participant?._id || participant; // Fallback for various data shapes
            if (participantId === (typeof currentId === 'string' ? currentId : currentId?._id)) {
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
                <div className="absolute inset-0 bg-cover bg-center opacity-10" style={{ backgroundImage: "url('/assets/Invento-bg.webp')" }}></div>
                <div className="text-center z-10">
                    <img src="/assets/Invento-logo.png" alt="INVENTO" className="w-40 h-40 mx-auto mb-8 animate-pulse" />
                    <div className="w-20 h-20 border-4 border-spy-green border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                    <p className="font-mono-tech text-spy-green text-lg tracking-widest uppercase">Initializing Protocol Spyglass...</p>
                </div>
            </div>
        );
    }

    const average = liveStats.count > 0 ? (liveStats.sum / liveStats.count).toFixed(1) : "0.0";

    const renderContent = () => {
        if (!eventState) return <StandbyView />;

        // PRIORITY 1: Explicit Manual Overrides from Display Control
        if (eventState.displayMode === 'qr') {
            return <QRView qrCodeUrl={eventState.qrCodeUrl} />;
        }

        if (eventState.displayMode === 'waiting' || !participant) {
            return <StandbyView />;
        }

        if (eventState.displayMode === 'result') {
            return <ResultView participant={participant} />;
        }

        if (eventState.displayMode === 'voting_open') {
            return <VotingView participant={participant} liveStats={liveStats} average={average} />;
        }

        if (eventState.displayMode === 'leaderboard') {
            return <Leaderboard isDisplay={true} />;
        }

        if (eventState.displayMode === 'gallery') {
            return <GalleryStoryView eventState={eventState} />;
        }

        // PRIORITY 2: Dynamic fallback logic based on boolean voting state
        if (eventState.isVotingOpen) {
            return <VotingView participant={participant} liveStats={liveStats} average={average} />;
        }

        // PRIORITY 3: If voting is closed, show result if completed, else show standby
        if (participant.status === 'completed' || participant.finalScore > 0) {
            return <ResultView participant={participant} />;
        }

        return <StandbyView />;
    };

    return (
        <div className="h-screen w-screen bg-black overflow-hidden relative font-rajdhani">
            {/* Background Layers */}
            <div className="absolute inset-0 bg-cover bg-center opacity-10 transition-opacity duration-1000" style={{ backgroundImage: "url('/assets/Invento-bg.webp')" }}></div>
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
                            <span className="font-mono-tech text-xs text-gray-500 tracking-widest uppercase">Mock Press Protocol</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <img src="/assets/KLE-TECH.webp" alt="KLE Tech" className="h-10" />
                        <div className="font-mono-tech text-xs text-spy-green tracking-[0.3em] border-2 border-spy-green bg-spy-green/10 px-4 py-2 font-bold shadow-[0_0_15px_rgba(0,255,65,0.2)]">
                            {time}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="h-full w-full flex items-center justify-center pt-24 pb-20 px-12 relative z-10 overflow-hidden">
                {renderContent()}
            </div>

            {/* Footer Ticker */}
            <div className="absolute bottom-0 left-0 right-0 bg-spy-red border-t-4 border-spy-yellow py-3 overflow-hidden z-20">
                <div className="whitespace-nowrap animate-marquee font-mono-tech text-lg font-bold text-black tracking-wider uppercase">
                    +++ BREAKING: MOCK PRESS CONFERENCE IN PROGRESS +++ TARGET IDENTIFIED: {participant?.name || "NONE"} +++ LIVE VOTING PROTOCOL ENGAGED +++ SYSTEM AUTHENTICATED +++ INVENTO 2026 +++ MISSION STATUS: ACTIVE +++
                </div>
            </div>

            <style>{`
                @keyframes marquee {
                    0% { transform: translateX(10%); }
                    100% { transform: translateX(-100%); }
                }
                .animate-marquee {
                    animation: marquee 30s linear infinite;
                }
                .floating {
                    animation: floating 3s ease-in-out infinite;
                }
                @keyframes floating {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-20px); }
                }
            `}</style>
        </div>
    );
}

export default Display;
