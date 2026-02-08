import { useState, useEffect } from "react";
import axios from "axios";
import { socket } from "../socket";
import { Trophy, Medal, Award, Download, Users, TrendingUp } from 'lucide-react';

import { apiUrl as API_URL } from "../config";

function Leaderboard() {
    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchParticipants = async () => {
        try {
            const res = await axios.get(`${API_URL}/vote/leaderboard`);
            // Format scores to 2 decimal places as needed by the UI
            const formatted = res.data.map(p => ({
                ...p,
                avgScore: parseFloat(p.avgScore.toFixed(2))
            }));
            setParticipants(formatted);
            setLoading(false);
        } catch (e) {
            console.error(e);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchParticipants();

        socket.on("newVote", () => {
            fetchParticipants();
        });

        socket.on("stateUpdate", () => {
            fetchParticipants();
        });

        return () => {
            socket.off("newVote");
            socket.off("stateUpdate");
        };
    }, []);

    const exportToCSV = () => {
        const headers = ["Rank", "Name", "Code", "Total Votes", "Average Score"];
        const rows = participants.map((p, idx) => [
            idx + 1,
            p.name,
            p.code || `P-${p.orderNumber}`,
            p.totalVotes,
            p.avgScore
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map(row => row.join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `INVENTO_2026_Leaderboard_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    const getRankIcon = (rank) => {
        if (rank === 1) return <Trophy className="w-8 h-8 text-yellow-400" />;
        if (rank === 2) return <Medal className="w-8 h-8 text-gray-400" />;
        if (rank === 3) return <Award className="w-8 h-8 text-orange-600" />;
        return null;
    };

    const getRankColor = (rank) => {
        if (rank === 1) return 'border-yellow-400 bg-yellow-400/10';
        if (rank === 2) return 'border-gray-400 bg-gray-400/10';
        if (rank === 3) return 'border-orange-600 bg-orange-600/10';
        return 'border-spy-green/30 bg-black/40';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black spy-grid-bg scanlines flex items-center justify-center">
                <div className="text-center">
                    <div className="w-20 h-20 border-4 border-spy-green border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                    <p className="font-mono-tech text-spy-green text-lg tracking-widest">CALCULATING RANKINGS...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black spy-grid-bg scanlines p-6">
            {/* Header */}
            <header className="max-w-6xl mx-auto mb-8">
                <div className="bg-dark-panel border-2 border-spy-green hud-corners p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Trophy className="w-12 h-12 text-spy-green pulse-glow" />
                            <div>
                                <h1 className="font-orbitron text-3xl font-black text-white tracking-wider">
                                    FINAL LEADERBOARD
                                </h1>
                                <p className="font-mono-tech text-xs text-spy-green tracking-widest">
                                    INVENTO 2026 • INTO THE SPYVERSE
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={exportToCSV}
                            className="flex items-center gap-2 px-6 py-3 bg-spy-blue text-black font-orbitron font-bold text-sm tracking-wider border-2 border-spy-blue hover:bg-transparent hover:text-spy-blue transition-all"
                        >
                            <Download size={18} />
                            EXPORT CSV
                        </button>
                    </div>
                </div>
            </header>

            {/* Stats Summary */}
            <div className="max-w-6xl mx-auto mb-8 grid grid-cols-3 gap-4">
                <div className="bg-dark-panel border border-spy-green/30 p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Users className="w-5 h-5 text-spy-green" />
                        <span className="font-mono-tech text-xs text-gray-400">TOTAL PARTICIPANTS</span>
                    </div>
                    <p className="font-orbitron text-3xl font-black text-white">{participants.length}</p>
                </div>
                <div className="bg-dark-panel border border-spy-green/30 p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-5 h-5 text-spy-yellow" />
                        <span className="font-mono-tech text-xs text-gray-400">HIGHEST SCORE</span>
                    </div>
                    <p className="font-orbitron text-3xl font-black text-spy-yellow">
                        {participants[0]?.avgScore || 0}
                    </p>
                </div>
                <div className="bg-dark-panel border border-spy-green/30 p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Trophy className="w-5 h-5 text-yellow-400" />
                        <span className="font-mono-tech text-xs text-gray-400">WINNER</span>
                    </div>
                    <p className="font-rajdhani text-xl font-bold text-white truncate">
                        {participants[0]?.name || 'TBD'}
                    </p>
                </div>
            </div>

            {/* Leaderboard Table */}
            <div className="max-w-6xl mx-auto">
                <div className="bg-dark-panel border border-spy-green/30 overflow-hidden">
                    {/* Table Header */}
                    <div className="grid grid-cols-12 gap-4 bg-spy-green/10 border-b border-spy-green/30 p-4 font-mono-tech text-xs text-spy-green tracking-widest">
                        <div className="col-span-1">RANK</div>
                        <div className="col-span-1">PHOTO</div>
                        <div className="col-span-4">PARTICIPANT</div>
                        <div className="col-span-2">CODE</div>
                        <div className="col-span-2">VOTES</div>
                        <div className="col-span-2">SCORE</div>
                    </div>

                    {/* Table Body */}
                    <div className="divide-y divide-spy-green/10">
                        {participants.map((p, idx) => {
                            const rank = idx + 1;
                            return (
                                <div
                                    key={p._id}
                                    className={`grid grid-cols-12 gap-4 p-4 items-center transition-all hover:bg-spy-green/5 border-l-4 ${getRankColor(rank)}`}
                                >
                                    {/* Rank */}
                                    <div className="col-span-1 flex items-center gap-2">
                                        {getRankIcon(rank)}
                                        <span className="font-orbitron text-2xl font-black text-white">
                                            {rank}
                                        </span>
                                    </div>

                                    {/* Photo */}
                                    <div className="col-span-1">
                                        <div className="w-12 h-12 border border-spy-green/30 bg-black flex items-center justify-center overflow-hidden">
                                            {p.photoUrl ? (
                                                <img src={p.photoUrl} alt={p.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <Users className="w-6 h-6 text-gray-700" />
                                            )}
                                        </div>
                                    </div>

                                    {/* Name */}
                                    <div className="col-span-4">
                                        <p className="font-rajdhani text-xl font-bold text-white">
                                            {p.name}
                                        </p>
                                    </div>

                                    {/* Code */}
                                    <div className="col-span-2">
                                        <span className="font-mono-tech text-sm text-gray-400">
                                            {p.code || `P-${p.orderNumber}`}
                                        </span>
                                    </div>

                                    {/* Total Votes */}
                                    <div className="col-span-2">
                                        <div className="flex items-center gap-2">
                                            <Users className="w-4 h-4 text-spy-blue" />
                                            <span className="font-mono-tech text-lg text-white">
                                                {p.totalVotes}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Average Score */}
                                    <div className="col-span-2">
                                        <div className="inline-block px-4 py-2 bg-spy-green/20 border border-spy-green">
                                            <span className="font-orbitron text-2xl font-black text-spy-green">
                                                {p.avgScore}
                                            </span>
                                            <span className="font-mono-tech text-xs text-gray-400 ml-1">
                                                /10
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {participants.length === 0 && (
                        <div className="text-center py-20">
                            <Trophy className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                            <p className="font-mono-tech text-gray-600 text-sm">
                                NO PARTICIPANTS YET
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <footer className="max-w-6xl mx-auto mt-8 text-center">
                <p className="font-mono-tech text-xs text-gray-600">
                    INVENTO 2026 • KLE TECHNOLOGICAL UNIVERSITY • INTO THE SPYVERSE
                </p>
            </footer>
        </div>
    );
}

export default Leaderboard;
