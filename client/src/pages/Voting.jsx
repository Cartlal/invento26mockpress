import { useState, useEffect } from "react";
import { socket } from "../socket";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Lock, Target, CheckCircle, Gauge } from 'lucide-react';

import { apiUrl as API_URL } from "../config";

function Voting() {
    const [eventState, setEventState] = useState(null);
    const [participant, setParticipant] = useState(null);
    const [hasVoted, setHasVoted] = useState(false);
    const [voteSubmitting, setVoteSubmitting] = useState(false);
    const [selectedScore, setSelectedScore] = useState(5);
    const [voterName, setVoterName] = useState("");
    const [voterPhone, setVoterPhone] = useState("");
    const [isNameless, setIsNameless] = useState(true);

    useEffect(() => {
        // Check for existing session
        const storedName = localStorage.getItem("voterName");
        const storedPhone = localStorage.getItem("voterPhone");
        if (storedName) {
            setVoterName(storedName);
            if (storedPhone) setVoterPhone(storedPhone);
            setIsNameless(false);
        }
    }, []);

    const handleNameSubmit = (e) => {
        e.preventDefault();
        if (!voterName.trim()) return;
        if (!voterPhone.trim() || voterPhone.length < 10) {
            toast.error("INVALID PHONE NUMBER");
            return;
        }

        localStorage.setItem("voterName", voterName.trim());
        localStorage.setItem("voterPhone", voterPhone.trim());
        setIsNameless(false);
        toast.success(`IDENTITY CONFIRMED`, {
            style: { background: '#00ff41', color: '#000', fontFamily: 'monospace' }
        });
    };

    const fetchParticipant = async (id) => {
        try {
            const res = await axios.get(`${API_URL}/admin/participants`);
            const current = res.data.find((p) => p._id === id);
            setParticipant(current);
        } catch (err) {
            console.error("Error fetching participant:", err);
        }
    };

    const fetchState = async () => {
        try {
            const res = await axios.get(`${API_URL}/admin/state`);
            setEventState(res.data);
            if (res.data.currentParticipantId) {
                fetchParticipant(res.data.currentParticipantId);
            }
        } catch (err) {
            console.error("Error fetching state:", err);
        }
    };

    useEffect(() => {
        fetchState();

        socket.on("stateUpdate", (newState) => {
            setEventState(newState);
            if (newState.currentParticipantId && newState.currentParticipantId !== participant?._id) {
                fetchParticipant(newState.currentParticipantId);
                setHasVoted(false);
                setSelectedScore(5);
            }
        });

        return () => {
            socket.off("stateUpdate");
        };
    }, [participant]);

    const handleVote = async () => {
        if (voteSubmitting) return;
        setVoteSubmitting(true);

        const deviceHash = localStorage.getItem("deviceHash") || Math.random().toString(36).substring(7);
        localStorage.setItem("deviceHash", deviceHash);

        try {
            await axios.post(`${API_URL}/vote`, {
                participantId: participant._id,
                score: selectedScore,
                deviceHash,
                voterName,
                voterPhone // Send phone with vote
            });
            setHasVoted(true);

            // Show success confirmation
            toast.success(
                `✅ VOTE CONFIRMED!\nScore: ${selectedScore}/10\nAgent: ${voterName}`,
                {
                    duration: 5000,
                    style: {
                        background: '#00ff41',
                        color: '#000',
                        fontFamily: 'monospace',
                        fontWeight: 'bold',
                        fontSize: '14px',
                        padding: '20px',
                        borderRadius: '0',
                        border: '2px solid #00ff41'
                    }
                }
            );
        } catch (err) {
            const errorMsg = err.response?.data?.error || "TRANSMISSION FAILED";
            toast.error(errorMsg, {
                duration: 4000,
                style: {
                    background: '#ff0000',
                    color: '#fff',
                    fontFamily: 'monospace',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    padding: '20px',
                    borderRadius: '0',
                    border: '2px solid #ff0000'
                }
            });
        } finally {
            setVoteSubmitting(false);
        }
    };

    const getScoreColor = (score) => {
        if (score <= 4) return 'text-spy-red';
        if (score <= 7) return 'text-spy-yellow';
        return 'text-spy-green';
    };

    const getScoreLabel = (score) => {
        if (score <= 3) return 'POOR';
        if (score <= 5) return 'AVERAGE';
        if (score <= 7) return 'GOOD';
        if (score <= 9) return 'EXCELLENT';
        return 'OUTSTANDING';
    };

    // Get spy character image based on score mood
    const getSpyImage = (score) => {
        if (score <= 2) return '/assets/Events/specials.png'; // Investigating (magnifying glass)
        if (score <= 4) return '/assets/Events/cdc.png'; // Stern detective (arms crossed)
        if (score <= 6) return '/assets/Events/gaming.png'; // Casual spy (headset)
        if (score <= 8) return '/assets/Events/wec.png'; // Professional female agent
        if (score === 9) return '/assets/spy2.png'; // Happy spy
        return '/assets/spy1.png'; // Elite spy (10/10)
    };

    // NAME ENTRY SCREEN (UPDATED)
    if (isNameless) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: "url('/assets/invento-bg-mobile.webp')" }}></div>
                <div className="w-full max-w-md z-10">
                    <div className="text-center mb-8">
                        <img src="/assets/Invento-logo.png" alt="INVENTO" className="w-24 h-24 mx-auto mb-4" />
                        <h1 className="font-orbitron text-2xl font-black text-white mb-2 tracking-wider">
                            IDENTITY REQUIRED
                        </h1>
                        <p className="font-mono-tech text-xs text-spy-blue tracking-widest">
                            PLEASE ENTER YOUR DETAILS TO PROCEED
                        </p>
                    </div>

                    <div className="bg-dark-panel border-2 border-spy-blue hud-corners p-8 backdrop-blur-sm">
                        <form onSubmit={handleNameSubmit} className="space-y-6">
                            <div>
                                <label className="block font-mono-tech text-xs text-spy-blue tracking-widest mb-2">
                                    CODENAME / ALIAS
                                </label>
                                <input
                                    type="text"
                                    value={voterName}
                                    onChange={(e) => setVoterName(e.target.value)}
                                    className="w-full bg-black border-2 border-spy-blue/50 focus:border-spy-blue px-4 py-3 font-rajdhani text-white text-lg outline-none transition-all placeholder-gray-700 text-center uppercase tracking-widest"
                                    placeholder="ENTER NAME"
                                    required
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="block font-mono-tech text-xs text-spy-blue tracking-widest mb-2">
                                    SECURE CONTACT (PHONE)
                                </label>
                                <input
                                    type="tel"
                                    value={voterPhone}
                                    onChange={(e) => setVoterPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                    className="w-full bg-black border-2 border-spy-blue/50 focus:border-spy-blue px-4 py-3 font-mono-tech text-white text-lg outline-none transition-all placeholder-gray-700 text-center tracking-widest"
                                    placeholder="XXX-XXX-XXXX"
                                    required
                                    pattern="[0-9]{10}"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-4 bg-spy-blue text-black font-orbitron font-bold text-sm tracking-widest border-2 border-spy-blue hover:bg-transparent hover:text-spy-blue transition-all"
                            >
                                AUTHENTICATE
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    if (!eventState) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: "url('/assets/invento-bg-mobile.webp')" }}></div>
                <div className="text-center z-10">
                    <img src="/assets/Invento-logo.png" alt="INVENTO" className="w-32 h-32 mx-auto mb-6 animate-pulse" />
                    <div className="w-16 h-16 border-4 border-spy-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="font-mono-tech text-spy-green text-sm tracking-widest">INITIALIZING SECURE CONNECTION...</p>
                </div>
            </div>
        );
    }

    // VOTING CLOSED STATE
    if (!eventState.isVotingOpen) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: "url('/assets/invento-bg-mobile.webp')" }}></div>
                <div className="w-full max-w-md z-10">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <img src="/assets/Invento-logo.png" alt="INVENTO" className="w-24 h-24 mx-auto mb-4" />
                        <h1 className="font-orbitron text-2xl font-black text-white mb-2 tracking-wider">
                            INTO THE <span className="text-spy-red">SPYVERSE</span>
                        </h1>
                        <img src="/assets/KLE-TECH.webp" alt="KLE Tech" className="w-32 mx-auto mb-2" />
                        <div className="flex justify-center gap-2 mt-2">
                            <span className="font-mono-tech text-xs text-gray-500 tracking-widest">AGENT: {voterName.toUpperCase()}</span>
                            <button onClick={() => setIsNameless(true)} className="text-[10px] text-spy-blue underline">CHANGE</button>
                        </div>
                    </div>

                    {/* Status Panel */}
                    <div className="bg-black/80 border-2 border-spy-red hud-corners p-8 mb-6 backdrop-blur-sm">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <Lock className="w-8 h-8 text-spy-red animate-pulse" />
                            <div className="w-3 h-3 bg-spy-red rounded-full pulse-glow"></div>
                        </div>
                        <h2 className="font-orbitron text-2xl font-bold text-spy-red text-center mb-2 neon-red">
                            {participant ? 'VOTING CLOSED' : 'NO PARTICIPANT ACTIVE'}
                        </h2>
                        <p className="font-mono-tech text-xs text-gray-400 text-center tracking-wider">
                            {participant
                                ? 'AWAITING NEXT VOTING SESSION'
                                : 'WAITING FOR ORGANIZERS TO SELECT PARTICIPANT'}
                        </p>
                    </div>

                    {/* Next Target Info */}
                    {participant && (
                        <div className="bg-black/60 border border-dark-border p-4 backdrop-blur-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                <span className="font-mono-tech text-xs text-yellow-500 tracking-wider">STANDBY TARGET</span>
                            </div>
                            <p className="font-rajdhani text-lg font-semibold text-white">{participant.name}</p>
                            <p className="font-mono-tech text-xs text-gray-500">ID: {participant.code || `P-${participant.orderNumber}`}</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // VOTING ACTIVE STATE
    return (
        <div className="min-h-screen bg-black flex flex-col p-4 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-cover bg-center opacity-25" style={{ backgroundImage: "url('/assets/invento-bg-mobile.webp')" }}></div>

            {/* Header */}
            <div className="w-full max-w-md mx-auto mb-6 z-10">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-spy-green rounded-full pulse-glow"></div>
                        <span className="font-mono-tech text-xs text-spy-green tracking-wider">LIVE UPLINK</span>
                    </div>
                    <img src="/assets/Invento-logo.png" alt="Logo" className="h-10" />
                </div>
                <div className="text-right">
                    <span className="font-mono-tech text-[10px] text-gray-400 tracking-widest">AGENT: {voterName.toUpperCase()}</span>
                </div>
            </div>

            {/* Main Content */}
            <div className="w-full max-w-md mx-auto flex-grow flex flex-col z-10">
                {/* Target Dossier */}
                {participant && (
                    <div className="bg-black/80 border-2 border-spy-green hud-corners p-6 mb-6 backdrop-blur-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <Target className="w-5 h-5 text-spy-green" />
                            <span className="font-mono-tech text-xs text-spy-green tracking-wider">ACTIVE TARGET</span>
                        </div>

                        <div className="mb-4">
                            <h2 className="font-orbitron text-2xl font-black text-white mb-1 tracking-wide uppercase">
                                {participant.name}
                            </h2>
                            <div className="flex items-center gap-3 text-xs font-mono-tech text-gray-400">
                                <span>ID: {participant.code || `P-${participant.orderNumber}`}</span>
                                <span className="text-spy-green">• SEQUENCE: #{participant.orderNumber}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 bg-spy-green/10 border border-spy-green/30 px-3 py-2">
                            <div className="w-2 h-2 bg-spy-green rounded-full animate-pulse"></div>
                            <span className="font-mono-tech text-xs text-spy-green tracking-wider">AWAITING ASSESSMENT</span>
                        </div>
                    </div>
                )}

                {/* Voting Interface */}
                {hasVoted ? (
                    <div className="bg-black/80 border-2 border-spy-green hud-corners p-8 text-center backdrop-blur-sm">
                        <img src={getSpyImage(selectedScore)} alt="Spy" className="w-32 h-32 mx-auto mb-4" />
                        <CheckCircle className="w-16 h-16 text-spy-green mx-auto mb-4 animate-pulse" />
                        <h3 className="font-orbitron text-xl font-bold text-spy-green mb-2 neon-green">
                            INTEL TRANSMITTED
                        </h3>
                        <p className="font-mono-tech text-xs text-gray-400 tracking-wider">
                            VOTE SECURED IN ARCHIVES
                        </p>
                        <div className="mt-4 font-mono-tech text-sm text-gray-500">
                            SCORE SUBMITTED: <span className="text-spy-green font-bold">{selectedScore}/10</span>
                        </div>
                    </div>
                ) : (
                    <div className="flex-grow flex flex-col justify-end">
                        <div className="mb-6">
                            {/* Score Display */}
                            <div className="bg-black/80 border-2 border-spy-green/50 p-6 mb-6 text-center backdrop-blur-sm">
                                <div className="flex items-center justify-center gap-3 mb-3">
                                    <Gauge className="w-6 h-6 text-spy-green" />
                                    <span className="font-mono-tech text-xs text-gray-400 tracking-wider">RATING SELECTOR</span>
                                </div>
                                <img src={getSpyImage(selectedScore)} alt="Spy" className="w-24 h-24 mx-auto mb-3" />
                                <div className={`font-orbitron text-5xl font-black mb-2 ${getScoreColor(selectedScore)}`}>
                                    {selectedScore}
                                </div>
                                <div className="font-mono-tech text-sm text-gray-400 tracking-wider">
                                    {getScoreLabel(selectedScore)}
                                </div>
                            </div>

                            {/* Slider with Pin */}
                            <div className="mb-6">
                                <div className="flex justify-between mb-3 font-mono-tech text-xs text-gray-400">
                                    <span>1</span>
                                    <span>5</span>
                                    <span>10</span>
                                </div>

                                {/* Slider Container */}
                                <div className="relative py-6">
                                    {/* Gradient Track */}
                                    <div
                                        className="absolute top-1/2 -translate-y-1/2 w-full h-3 rounded-full pointer-events-none"
                                        style={{ background: 'linear-gradient(to right, #ff0000 0%, #ffcc00 50%, #00ff41 100%)' }}
                                    ></div>

                                    {/* Pin Thumb */}
                                    <img
                                        src="/assets/pin.png"
                                        alt="Pin"
                                        className="absolute w-10 h-10 pointer-events-none transition-all duration-75 ease-out"
                                        style={{
                                            left: `calc(${((selectedScore - 1) / 9) * 100}%)`,
                                            top: '-4px',
                                            transform: 'translateX(-50%)',
                                            filter: 'drop-shadow(0 0 15px rgba(0, 255, 65, 0.8))',
                                            zIndex: 10
                                        }}
                                    />

                                    {/* Actual Range Input */}
                                    <input
                                        type="range"
                                        min="1"
                                        max="10"
                                        value={selectedScore}
                                        onChange={(e) => setSelectedScore(parseInt(e.target.value))}
                                        className="absolute top-1/2 -translate-y-1/2 w-full h-12 opacity-0 cursor-pointer z-20"
                                        style={{ margin: 0 }}
                                    />
                                </div>

                                <div className="flex justify-between font-mono-tech text-xs">
                                    <span className="text-spy-red">POOR</span>
                                    <span className="text-spy-yellow">AVERAGE</span>
                                    <span className="text-spy-green">EXCELLENT</span>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                onClick={handleVote}
                                disabled={voteSubmitting}
                                className={`
                  w-full py-4 font-orbitron font-bold text-sm tracking-widest
                  border-2 transition-all duration-200
                  ${!voteSubmitting
                                        ? 'bg-spy-green text-black border-spy-green hover:scale-105'
                                        : 'bg-dark-panel text-gray-600 border-gray-800 cursor-not-allowed'
                                    }
                `}
                                style={{
                                    boxShadow: !voteSubmitting ? '0 0 20px rgba(0, 255, 65, 0.5)' : 'none'
                                }}
                            >
                                {voteSubmitting ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                                        TRANSMITTING...
                                    </span>
                                ) : (
                                    'SUBMIT INTEL'
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="w-full max-w-md mx-auto mt-6 pt-4 border-t border-gray-900 z-10">
                <div className="flex items-center justify-center gap-2 mb-2">
                    <img src="/assets/KLE-TECH.webp" alt="KLE Tech" className="h-6" />
                </div>
                <p className="font-mono-tech text-xs text-center text-gray-600 tracking-wider">
                    CLASSIFIED • INVENTO 2026 • MOCK PRESS PROTOCOL
                </p>
            </div>
        </div>
    );
}

export default Voting;
