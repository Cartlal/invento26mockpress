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
                // Now populated directly
                setParticipant(res.data.currentParticipantId);
            }
        } catch (err) {
            console.error("Error fetching state:", err);
        }
    };

    useEffect(() => {
        fetchState();

        socket.on("stateUpdate", (newState) => {
            setEventState(newState);
            if (newState.currentParticipantId && newState.currentParticipantId._id !== participant?._id) {
                setParticipant(newState.currentParticipantId);
                setHasVoted(false);
                setSelectedScore(5);
            }
        });

        return () => {
            socket.off("stateUpdate");
        };
    }, [participant]);

    // Check if already voted on mount or participant change
    useEffect(() => {
        const checkVotingStatus = async () => {
            if (participant?._id) {
                const deviceHash = localStorage.getItem("deviceHash") || Math.random().toString(36).substring(7);
                localStorage.setItem("deviceHash", deviceHash);
                try {
                    const res = await axios.get(`${API_URL}/vote/check/${participant._id}/${deviceHash}`);
                    if (res.data.voted) {
                        setHasVoted(true);
                    }
                } catch (err) {
                    console.error("Status check failed:", err);
                }
            }
        };
        checkVotingStatus();
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
                `VOTE CONFIRMED! \nScore: ${selectedScore}/10${voterName ? `\nAgent: ${voterName}` : ''}`,
                {
                    duration: 5000,
                    style: {
                        background: '#0a0a0a',
                        color: '#00ff41',
                        fontFamily: '"Rajdhani", monospace',
                        fontWeight: 'bold',
                        fontSize: '16px',
                        padding: '16px 20px',
                        borderRadius: '8px',
                        border: '1px solid rgba(0, 255, 65, 0.4)',
                        boxShadow: '0 0 20px rgba(0, 255, 65, 0.2)'
                    },
                    iconTheme: {
                        primary: '#00ff41',
                        secondary: '#0a0a0a',
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



    if (!eventState) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-cover bg-center opacity-10" style={{ backgroundImage: "url('/assets/invento-bg-mobile.webp')" }}></div>
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
                <div className="absolute inset-0 bg-cover bg-center opacity-10" style={{ backgroundImage: "url('/assets/invento-bg-mobile.webp')" }}></div>
                <div className="w-full max-w-md z-10">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <img src="/assets/Invento-logo.png" alt="INVENTO" className="w-24 h-24 mx-auto mb-4" />
                        <h1 className="font-orbitron text-2xl font-black text-white mb-2 tracking-wider">
                            INTO THE <span className="text-spy-red">SPYVERSE</span>
                        </h1>
                        <img src="/assets/KLE-TECH.webp" alt="KLE Tech" className="w-32 mx-auto mb-2" />

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


                </div>
            </div>
        );
    }



    // VOTING ACTIVE STATE
    return (
        <div className="h-screen bg-black flex flex-col p-6 items-center relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-cover bg-center opacity-10" style={{ backgroundImage: "url('/assets/invento-bg-mobile.webp')" }}></div>

            {/* Content Wrapper */}
            <div className="relative z-10 w-full max-w-md h-full flex flex-col justify-center gap-6 py-4">
                {/* Header: Logo & Status */}
                <div className="text-center space-y-3">
                    <img src="/assets/Invento-logo.png" alt="INVENTO" className="w-28 h-28 mx-auto" />
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-spy-green/10 border border-spy-green/50 rounded-full">
                        <div className="w-2 h-2 bg-spy-green rounded-full pulse-glow"></div>
                        <span className="font-mono-tech text-xs text-spy-green tracking-[0.2em] uppercase font-bold">VOTING ACTIVE</span>
                    </div>
                </div>



                {/* Voting Interface */}
                {hasVoted ? (
                    <div className="bg-black/80 border-2 border-spy-green hud-corners p-8 text-center backdrop-blur-sm animate-in zoom-in-95 duration-500">
                        <CheckCircle className="w-16 h-16 text-spy-green mx-auto mb-4 animate-pulse" />
                        <h3 className="font-orbitron text-xl font-bold text-spy-green mb-2 neon-green uppercase">
                            Vote Recorded
                        </h3>
                        <p className="font-mono-tech text-xs text-gray-400 tracking-wider">
                            YOUR RESPONSE HAS BEEN SAVED
                        </p>
                    </div>
                ) : (
                    <div className="w-full space-y-6">

                        {/* Score Buttons */}
                        <div className="px-2">
                            <div className="grid grid-cols-5 gap-3 py-4">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                    <button
                                        key={num}
                                        onClick={() => setSelectedScore(num)}
                                        className={`
                                            h-12 rounded-lg font-orbitron font-bold text-lg transition-all duration-200 flex items-center justify-center active:scale-95
                                            ${selectedScore === num
                                                ? 'bg-spy-green text-black scale-110 shadow-[0_0_15px_rgba(0,255,65,0.6)] border-2 border-spy-green z-10'
                                                : 'bg-black text-gray-300 border border-gray-700 hover:border-spy-green/50 opacity-90'
                                            }
                                        `}
                                    >
                                        {num}
                                    </button>
                                ))}
                            </div>
                            <div className="flex justify-between font-mono-tech text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-2">
                                <span>POOR (1-3)</span>
                                <span>AVERAGE (4-7)</span>
                                <span>EXCELLENT (8-10)</span>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            onClick={handleVote}
                            disabled={voteSubmitting}
                            className={`
                                w-full py-4 font-orbitron font-bold text-sm tracking-[0.2em]
                                border-2 transition-all duration-300 transform active:scale-95
                                ${!voteSubmitting
                                    ? 'bg-spy-green text-black border-spy-green shadow-[0_0_20px_rgba(0,255,65,0.3)]'
                                    : 'bg-dark-panel text-gray-600 border-gray-800'
                                }
                            `}
                        >
                            {voteSubmitting ? (
                                <span className="animate-pulse">TRANSMITTING...</span>
                            ) : (
                                'SUBMIT VOTE'
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Voting;
