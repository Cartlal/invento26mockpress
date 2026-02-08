import { useState, useEffect } from "react";
import axios from "axios";
import { socket } from "../socket";
import { Users, UserCheck, Activity, Mic, List, Eye, Clock } from 'lucide-react';

import { apiUrl as API_URL } from "../config";

function LiveMonitor({ participants, eventState }) {
    const [stats, setStats] = useState({
        liveUsers: 0,
        participantCount: 0,
        totalVotes: 0,
        uniqueVoterCount: 0
    });
    const [recentVoters, setRecentVoters] = useState([]);
    const [selectedVoter, setSelectedVoter] = useState(null);
    const [voterHistory, setVoterHistory] = useState([]);

    const currentParticipant = participants.find(p => p._id === eventState?.currentParticipantId);

    // Calculate Upcoming Participants (Next 3 in order)
    const upcomingParticipants = participants
        .filter(p => !currentParticipant || p.orderNumber > currentParticipant.orderNumber)
        .sort((a, b) => a.orderNumber - b.orderNumber)
        .slice(0, 3);

    const fetchStats = async () => {
        try {
            const res = await axios.get(`${API_URL}/admin/stats`);
            setStats(prev => ({ ...prev, ...res.data }));

            // Also fetch active voters list
            const votersRes = await axios.get(`${API_URL}/admin/voters`);
            setRecentVoters(votersRes.data);
        } catch (err) {
            console.error("Failed to fetch stats", err);
        }
    };

    const fetchVoterHistory = async (phone) => {
        try {
            const res = await axios.get(`${API_URL}/admin/voter-history/${phone}`);
            setVoterHistory(res.data);
        } catch (err) {
            console.error("Failed to fetch history", err);
        }
    };

    useEffect(() => {
        fetchStats();
        const interval = setInterval(fetchStats, 5000); // Poll every 5s

        socket.on('userCount', (count) => {
            setStats(prev => ({ ...prev, liveUsers: count }));
        });

        return () => {
            clearInterval(interval);
            socket.off('userCount');
        };
    }, []);

    return (
        <div className="space-y-6">
            {/* Top Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-dark-panel border border-spy-green/30 p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <Eye className="w-4 h-4 text-spy-green" />
                        <span className="font-mono-tech text-xs text-gray-400">LIVE UPLINKS</span>
                    </div>
                    <div className="font-orbitron text-2xl font-bold text-white">{stats.liveUsers}</div>
                </div>
                <div className="bg-dark-panel border border-spy-blue/30 p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <Users className="w-4 h-4 text-spy-blue" />
                        <span className="font-mono-tech text-xs text-gray-400">TOTAL VOTERS</span>
                    </div>
                    <div className="font-orbitron text-2xl font-bold text-white">{stats.uniqueVoterCount}</div>
                </div>
                <div className="bg-dark-panel border border-spy-red/30 p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <UserCheck className="w-4 h-4 text-spy-red" />
                        <span className="font-mono-tech text-xs text-gray-400">PARTICIPANTS</span>
                    </div>
                    <div className="font-orbitron text-2xl font-bold text-white">{stats.participantCount}</div>
                </div>
                <div className="bg-dark-panel border border-yellow-500/30 p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <Activity className="w-4 h-4 text-yellow-500" />
                        <span className="font-mono-tech text-xs text-gray-400">TOTAL INTEL</span>
                    </div>
                    <div className="font-orbitron text-2xl font-bold text-white">{stats.totalVotes}</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Current Stage & Queue */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Current Stage */}
                    <div className="bg-dark-panel border-2 border-spy-green p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-spy-green text-black text-xs font-bold px-2 py-1">
                            LIVE
                        </div>
                        <h3 className="font-orbitron text-lg font-bold text-spy-green mb-4">CURRENT TARGET</h3>

                        {currentParticipant ? (
                            <div className="text-center">
                                <div className="w-32 h-32 mx-auto mb-4 border-2 border-spy-green rounded-full overflow-hidden p-1">
                                    <div className="w-full h-full rounded-full bg-cover bg-center"
                                        style={{ backgroundImage: `url(${currentParticipant.photoUrl || '/assets/spy-avatar.png'})` }}>
                                    </div>
                                </div>
                                <h2 className="font-orbitron text-xl font-bold text-white">{currentParticipant.name}</h2>
                                <p className="font-mono-tech text-xs text-gray-400">ID: {currentParticipant.code}</p>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500 font-mono-tech">
                                NO ACTIVE TARGET
                            </div>
                        )}
                    </div>

                    {/* Upcoming Queue */}
                    <div className="bg-dark-panel border border-gray-700 p-4">
                        <h3 className="font-orbitron text-sm font-bold text-gray-300 mb-3 flex items-center gap-2">
                            <List className="w-4 h-4" />
                            NEXT TARGETS (ON DECK)
                        </h3>
                        <div className="space-y-2">
                            {upcomingParticipants.length > 0 ? (
                                upcomingParticipants.map((p, idx) => (
                                    <div key={p._id} className="flex items-center gap-3 p-2 bg-gray-900 border border-gray-800">
                                        <div className="font-mono-tech text-xs text-gray-500">#{idx + 1}</div>
                                        <div className="w-8 h-8 rounded bg-cover bg-center"
                                            style={{ backgroundImage: `url(${p.photoUrl || '/assets/spy-avatar.png'})` }}>
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-rajdhani font-bold text-white truncate">{p.name}</p>
                                            <p className="font-mono-tech text-[10px] text-gray-500">{p.code}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center font-mono-tech text-xs text-gray-600 py-4">END OF LINE</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Live Voter Feed */}
                <div className="lg:col-span-2 bg-dark-panel border border-spy-blue/30 flex flex-col h-[500px]">
                    <div className="p-4 border-b border-spy-blue/20 flex justify-between items-center">
                        <h3 className="font-orbitron text-lg font-bold text-spy-blue flex items-center gap-2">
                            <Activity className="w-5 h-5" />
                            ACTIVE AGENTS (VOTERS)
                        </h3>
                        <span className="font-mono-tech text-xs text-spy-blue animate-pulse">● RECEIVING DATA</span>
                    </div>

                    <div className="flex-grow overflow-y-auto p-4">
                        <table className="w-full text-left font-mono-tech text-sm">
                            <thead className="text-gray-500 border-b border-gray-800">
                                <tr>
                                    <th className="pb-2">AGENT NAME</th>
                                    <th className="pb-2">Secure Line</th>
                                    <th className="pb-2 text-center">Total Intel</th>
                                    <th className="pb-2 text-right">Last Active</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {recentVoters.map((voter) => (
                                    <tr
                                        key={voter._id}
                                        className="hover:bg-spy-blue/10 cursor-pointer transition-colors"
                                        onClick={() => {
                                            setSelectedVoter(voter);
                                            fetchVoterHistory(voter._id); // _id is the phone number here
                                        }}
                                    >
                                        <td className="py-3 font-bold text-white">{voter.name}</td>
                                        <td className="py-3 text-spy-blue">{voter._id}</td>
                                        <td className="py-3 text-center">{voter.totalVotes}</td>
                                        <td className="py-3 text-right text-gray-500">
                                            {new Date(voter.lastActive).toLocaleTimeString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Voter History Modal */}
            {selectedVoter && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-dark-panel border-2 border-spy-blue w-full max-w-2xl max-h-[80vh] flex flex-col">
                        <div className="p-6 border-b border-gray-800 flex justify-between items-start">
                            <div>
                                <h2 className="font-orbitron text-xl font-bold text-white mb-1">AGENT DOSSIER</h2>
                                <p className="font-mono-tech text-spy-blue">ID: {selectedVoter.name}</p>
                                <p className="font-mono-tech text-xs text-gray-500">LINE: {selectedVoter._id}</p>
                            </div>
                            <button
                                onClick={() => setSelectedVoter(null)}
                                className="text-gray-500 hover:text-white"
                            >
                                CLOSE [X]
                            </button>
                        </div>

                        <div className="flex-grow overflow-y-auto p-6">
                            <h3 className="font-mono-tech text-xs text-gray-400 mb-4 tracking-widest">TRANSMISSION HISTORY</h3>
                            <div className="space-y-3">
                                {voterHistory.map((vote, i) => (
                                    <div key={i} className="flex justify-between items-center bg-gray-900 p-3 border border-gray-800">
                                        <div>
                                            <p className="font-bold text-white">{vote.participantId?.name || 'Unknown Target'}</p>
                                            <p className="font-mono-tech text-[10px] text-gray-500">
                                                {new Date(vote.timestamp).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className={`font-orbitron text-xl font-bold ${vote.score >= 8 ? 'text-spy-green' :
                                                vote.score >= 5 ? 'text-spy-yellow' : 'text-spy-red'
                                                }`}>
                                                {vote.score}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                {voterHistory.length === 0 && (
                                    <p className="text-center text-gray-500 italic">No records found.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default LiveMonitor;
