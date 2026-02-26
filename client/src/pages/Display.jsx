import { useState, useEffect } from "react";
import axios from "axios";
import { socket } from "../socket";
import StandbyView from "../components/display/StandbyView";
import ResultView from "../components/display/ResultView";
import QRView from "../components/display/QRView";
import { apiUrl as API_URL } from "../config";
import '../index1.css';

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
            if (res.data.currentParticipantId) setParticipant(res.data.currentParticipantId);
        } catch (e) { console.error(e); }
    };

    useEffect(() => {
        fetchState();
        socket.emit("joinRoom", "admin");

        socket.on("stateUpdate", (newState) => {
            setEventState(newState);
            const newP = newState.currentParticipantId;
            if (newP) {
                if (newP._id !== participant?._id) setLiveStats({ count: 0, sum: 0 });
                setParticipant(newP);
            } else {
                setParticipant(null);
                setLiveStats({ count: 0, sum: 0 });
            }
        });

        socket.on("newVote", ({ participantId, score }) => {
            const currentId = participant?._id || participant;
            if (participantId === (typeof currentId === "string" ? currentId : currentId?._id)) {
                setLiveStats(prev => ({ count: prev.count + 1, sum: prev.sum + score }));
            }
        });

        return () => { socket.off("stateUpdate"); socket.off("newVote"); };
    }, [participant]);

    if (!eventState) {
        return (
            <div className="h-screen w-screen bg-black flex flex-col items-center justify-center gap-4">
                <div className="h-px w-full bg-[#C0392B] absolute top-0 left-0" />
                <div className="w-8 h-8 border border-white/10 border-t-[#C0392B] rounded-full animate-spin" />
                <p className="text-[10px] tracking-[0.5em] text-white/20 uppercase">Initializing...</p>
            </div>
        );
    }

    const renderContent = () => {
        if (!eventState) return <StandbyView />;
        if (eventState.displayMode === "qr") return <QRView qrCodeUrl={eventState.qrCodeUrl} />;
        if (eventState.displayMode === "waiting" || !participant) return <StandbyView />;
        if (eventState.displayMode === "result") return <ResultView participant={participant} />;
        if (eventState.displayMode === "voting_open") return <QRView qrCodeUrl={eventState.qrCodeUrl} />;
        if (eventState.isVotingOpen) return <QRView qrCodeUrl={eventState.qrCodeUrl} />;
        if (participant.status === "completed" || participant.finalScore > 0) return <ResultView participant={participant} />;
        return <StandbyView />;
    };

    return (
        <div className="h-screen w-screen bg-black overflow-hidden relative flex flex-col"
            style={{ fontFamily: "Inter, sans-serif" }}>
            {/* Red top rule */}
            <div className="h-px w-full bg-[#C0392B] flex-shrink-0" />

            {/* Header */}
            <header className="flex items-center justify-between px-8 py-4 border-b border-white/[0.06] flex-shrink-0 bg-black/95 z-50">
                <div className="flex items-center gap-5">
                    <img src="/assets/Invento-logo.png" alt="INVENTO" className="h-14 opacity-90" />
                    <div>
                        <h1 className="text-base text-[25px] font-black text-white uppercase tracking-wider leading-none">
                            Into the <span className="text-[#C0392B]">Spyverse</span>
                        </h1>
                        <p className="text-[10px] text-white/20 tracking-[0.35em] uppercase mt-0.5">Mock Press Protocol</p>
                    </div>
                </div>
                <div className="flex items-center gap-5">
                    <img src="/assets/KLE-TECH.webp" alt="KLE Tech" className="h-16 opacity-90" />
                    <div className="border border-white/[0.06] px-4 py-2">
                        <span className="text-[#C0392B] font-bold text-m tracking-widest font-mono">{time}</span>
                    </div>
                </div>
            </header>

            {/* Main content */}
            <div className="flex-1 flex items-center justify-center overflow-hidden relative">
                {renderContent()}
            </div>
        </div>
    );
}

export default Display;