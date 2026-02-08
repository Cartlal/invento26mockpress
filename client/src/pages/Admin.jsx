import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { socket } from "../socket";
import { toast } from "react-hot-toast";
import {
    Shield,
    Activity,
    Users,
    PlayCircle,
    StopCircle,
    Trash2,
    PlusCircle,
    Monitor,
    TrendingUp,
    Lock,
    Unlock,
    LogOut,
    Edit
} from 'lucide-react';

import AnalyticsPanel from '../components/AnalyticsPanel';

const API_URL = "http://localhost:5000/api";

function Admin() {
    const navigate = useNavigate();
    const [view, setView] = useState('dashboard'); // 'dashboard', 'analytics', 'advanced'
    const [participants, setParticipants] = useState([]);
    const [eventState, setEventState] = useState({ isVotingOpen: false, currentParticipantId: null });
    const [liveVotes, setLiveVotes] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', orderNumber: '', code: '', photoUrl: '' });
    const [imagePreview, setImagePreview] = useState(null);

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        toast.success("Logged out successfully", {
            style: { background: '#00ff41', color: '#000', fontFamily: 'monospace' }
        });
        navigate('/login');
    };

    const fetchParticipants = async () => {
        try {
            const res = await axios.get(`${API_URL}/admin/participants`);
            setParticipants(res.data);
        } catch (e) {
            console.error(e);
        }
    };

    const fetchState = async () => {
        try {
            const res = await axios.get(`${API_URL}/admin/state`);
            setEventState(res.data);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchParticipants();
        fetchState();

        socket.on("stateUpdate", (newState) => setEventState(newState));
        socket.on("newVote", ({ participantId, score }) => {
            setLiveVotes(prev => ({
                ...prev,
                [participantId]: {
                    count: (prev[participantId]?.count || 0) + 1,
                    sum: (prev[participantId]?.sum || 0) + score
                }
            }));
        });

        return () => {
            socket.off("stateUpdate");
            socket.off("newVote");
        };
    }, []);

    const updateState = async (updates) => {
        try {
            await axios.post(`${API_URL}/admin/state`, updates);
            toast.success("Command Executed", {
                style: { background: '#00ff41', color: '#000', fontFamily: 'monospace' }
            });
        } catch (err) {
            toast.error("Command Failed");
        }
    };

    const handleCreateParticipant = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            toast.error("Name is required");
            return;
        }

        try {
            await axios.post(`${API_URL}/admin/participant`, {
                name: formData.name,
                orderNumber: parseInt(formData.orderNumber) || participants.length + 1,
                code: formData.code,
                photoUrl: formData.photoUrl
            });
            fetchParticipants();
            toast.success("Participant Added", {
                style: { background: '#00ff41', color: '#000', fontFamily: 'monospace' }
            });
            setShowModal(false);
            setFormData({ name: '', orderNumber: '', code: '', photoUrl: '' });
            setImagePreview(null);
        } catch (e) {
            toast.error("Failed to add participant");
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error("Image size must be less than 5MB");
                return;
            }

            // Convert to base64
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
                setFormData({ ...formData, photoUrl: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this participant? This action cannot be undone.")) return;
        try {
            await axios.delete(`${API_URL}/admin/participant/${id}`);
            fetchParticipants();
            toast.success("Participant Deleted");
        } catch (e) {
            toast.error("Deletion Failed");
        }
    };

    const getStats = (pId) => {
        const stats = liveVotes[pId] || { count: 0, sum: 0 };
        const avg = stats.count > 0 ? (stats.sum / stats.count).toFixed(1) : "0.0";
        return { count: stats.count, avg };
    };

    return (
        <div className="min-h-screen bg-black spy-grid-bg scanlines p-4 md:p-8">
            {/* Header */}
            <header className="max-w-7xl mx-auto mb-8">
                <div className="bg-dark-panel border-2 border-spy-green hud-corners p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Shield className="w-10 h-10 text-spy-green pulse-glow" />
                            <div>
                                <h1 className="font-orbitron text-2xl md:text-3xl font-black text-white tracking-wider">
                                    MISSION CONTROL
                                </h1>
                                <p className="font-mono-tech text-xs text-spy-green tracking-widest">
                                    CLEARANCE LEVEL: ADMINISTRATOR
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowModal(true)}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-spy-green text-black font-orbitron font-bold text-sm tracking-wider border-2 border-spy-green hover:bg-transparent hover:text-spy-green transition-all"
                        >
                            <PlusCircle size={18} />
                            NEW PARTICIPANT
                        </button>
                        <button
                            onClick={handleLogout}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-spy-red text-white font-orbitron font-bold text-sm tracking-wider border-2 border-spy-red hover:bg-transparent hover:text-spy-red transition-all"
                        >
                            <LogOut size={18} />
                            LOGOUT
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <div className="max-w-7xl mx-auto space-y-6">

                {/* View Toggles */}
                <div className="flex gap-4 border-b border-spy-green/30 pb-4">
                    <button
                        onClick={() => setView('dashboard')}
                        className={`font-orbitron text-sm tracking-widest px-4 py-2 border-b-2 transition-all ${view === 'dashboard' ? 'border-spy-green text-spy-green' : 'border-transparent text-gray-500 hover:text-gray-300'
                            }`}
                    >
                        DASHBOARD
                    </button>
                    <button
                        onClick={() => setView('analytics')}
                        className={`font-orbitron text-sm tracking-widest px-4 py-2 border-b-2 transition-all ${view === 'analytics' ? 'border-spy-green text-spy-green' : 'border-transparent text-gray-500 hover:text-gray-300'
                            }`}
                    >
                        ANALYTICS & LOGS
                    </button>
                    <button
                        onClick={() => setView('advanced')}
                        className={`font-orbitron text-sm tracking-widest px-4 py-2 border-b-2 transition-all ${view === 'advanced' ? 'border-spy-red text-spy-red' : 'border-transparent text-gray-500 hover:text-gray-300'
                            }`}
                    >
                        ADVANCED CONTROLS
                    </button>
                </div>

                {view === 'dashboard' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Panel - System Status (Existing Code) */}
                        <div className="lg:col-span-1 space-y-6">
                            {/* Voting Control */}
                            <div className="bg-dark-panel border border-spy-green/30 p-6">
                                <div className="flex items-center gap-2 mb-6">
                                    <Activity className="w-5 h-5 text-spy-green" />
                                    <h2 className="font-orbitron text-lg font-bold text-white tracking-wider">
                                        SYSTEM STATUS
                                    </h2>
                                </div>

                                {/* Voting Status */}
                                <div className={`mb-6 p-4 border-2 ${eventState.isVotingOpen ? 'border-spy-green bg-spy-green/10' : 'border-spy-red bg-spy-red/10'}`}>
                                    <div className="flex items-center gap-3 mb-2">
                                        {eventState.isVotingOpen ? (
                                            <Unlock className="w-6 h-6 text-spy-green" />
                                        ) : (
                                            <Lock className="w-6 h-6 text-spy-red" />
                                        )}
                                        <span className="font-mono-tech text-xs tracking-widest text-gray-400">
                                            VOTING CHANNEL
                                        </span>
                                    </div>
                                    <p className={`font-orbitron text-xl font-bold ${eventState.isVotingOpen ? 'text-spy-green neon-green' : 'text-spy-red neon-red'}`}>
                                        {eventState.isVotingOpen ? 'OPEN / ACTIVE' : 'CLOSED / SECURE'}
                                    </p>
                                </div>

                                {/* Active Participant */}
                                <div className="mb-6 p-4 bg-dark-bg border border-spy-blue/30">
                                    <span className="font-mono-tech text-xs text-gray-400 tracking-widest block mb-2">
                                        ACTIVE TARGET
                                    </span>
                                    <p className="font-rajdhani text-lg font-semibold text-white truncate">
                                        {participants.find(p => p._id === eventState.currentParticipantId)?.name || "NONE SELECTED"}
                                    </p>
                                </div>

                                {/* Control Button */}
                                <button
                                    onClick={() => updateState({ isVotingOpen: !eventState.isVotingOpen })}
                                    className={`w-full py-4 font-orbitron font-bold text-sm tracking-widest flex items-center justify-center gap-3 border-2 transition-all ${eventState.isVotingOpen
                                        ? 'bg-spy-red text-white border-spy-red shadow-neon-red hover:bg-transparent'
                                        : 'bg-spy-green text-black border-spy-green shadow-neon-green hover:bg-transparent hover:text-spy-green'
                                        }`}
                                >
                                    {eventState.isVotingOpen ? (
                                        <>
                                            <StopCircle size={20} />
                                            CLOSE VOTING
                                        </>
                                    ) : (
                                        <>
                                            <PlayCircle size={20} />
                                            OPEN VOTING
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Live Activity Log */}
                            <div className="bg-dark-panel border border-spy-green/30 p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <TrendingUp className="w-5 h-5 text-spy-green" />
                                    <h3 className="font-orbitron text-sm font-bold text-white tracking-wider">
                                        LIVE ACTIVITY
                                    </h3>
                                </div>
                                <div className="h-48 overflow-y-auto font-mono-tech text-xs text-spy-green/70 space-y-1 custom-scrollbar">
                                    {Object.entries(liveVotes).length > 0 ? (
                                        Object.entries(liveVotes).map(([id, data]) => (
                                            <div key={id} className="flex items-center gap-2">
                                                <span className="text-gray-600">[{new Date().toLocaleTimeString()}]</span>
                                                <span>TARGET {id.slice(-4)}: {data.count} VOTES</span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-gray-600 animate-pulse">AWAITING INCOMING DATA...</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Panel - Participants Database */}
                        <div className="lg:col-span-2">
                            <div className="bg-dark-panel border border-spy-green/30 p-6">
                                <div className="flex items-center gap-2 mb-6">
                                    <Users className="w-5 h-5 text-spy-green" />
                                    <h2 className="font-orbitron text-lg font-bold text-white tracking-wider">
                                        PARTICIPANTS DATABASE
                                    </h2>
                                </div>

                                {/* Participants Table */}
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-spy-green/30">
                                                <th className="text-left p-3 font-mono-tech text-xs text-gray-400 tracking-wider">#</th>
                                                <th className="text-left p-3 font-mono-tech text-xs text-gray-400 tracking-wider">NAME</th>
                                                <th className="text-center p-3 font-mono-tech text-xs text-gray-400 tracking-wider">VOTES</th>
                                                <th className="text-center p-3 font-mono-tech text-xs text-gray-400 tracking-wider">AVG</th>
                                                <th className="text-right p-3 font-mono-tech text-xs text-gray-400 tracking-wider">ACTIONS</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-900">
                                            {participants.map((p) => {
                                                const isActive = eventState.currentParticipantId === p._id;
                                                const stats = getStats(p._id);

                                                return (
                                                    <tr
                                                        key={p._id}
                                                        className={`hover:bg-spy-green/5 transition-colors ${isActive ? 'bg-spy-green/10 border-l-4 border-spy-green' : ''
                                                            }`}
                                                    >
                                                        <td className="p-3 font-mono-tech text-gray-400">
                                                            {p.orderNumber}
                                                        </td>
                                                        <td className="p-3">
                                                            <div className="font-rajdhani font-semibold text-white">
                                                                {p.name}
                                                            </div>
                                                            <div className="font-mono-tech text-xs text-gray-600">
                                                                {p.code || `P-${p.orderNumber}`}
                                                            </div>
                                                        </td>
                                                        <td className="p-3 text-center font-mono-tech text-lg text-white">
                                                            {stats.count}
                                                        </td>
                                                        <td className="p-3 text-center font-mono-tech text-lg text-spy-yellow">
                                                            {stats.avg}
                                                        </td>
                                                        <td className="p-3">
                                                            <div className="flex items-center justify-end gap-2">
                                                                {!isActive && (
                                                                    <button
                                                                        onClick={() => updateState({ currentParticipantId: p._id, isVotingOpen: false })}
                                                                        className="flex items-center gap-1 px-3 py-1 text-xs font-mono-tech border border-spy-green/50 text-spy-green hover:bg-spy-green hover:text-black transition-all"
                                                                    >
                                                                        <Monitor size={12} />
                                                                        ACTIVATE
                                                                    </button>
                                                                )}
                                                                {isActive && (
                                                                    <span className="flex items-center gap-1 px-3 py-1 text-xs font-mono-tech bg-spy-green text-black">
                                                                        <Activity size={12} />
                                                                        ACTIVE
                                                                    </span>
                                                                )}
                                                                <button
                                                                    onClick={() => handleDelete(p._id)}
                                                                    className="p-2 text-spy-red hover:bg-spy-red/20 transition-all"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>

                                    {participants.length === 0 && (
                                        <div className="text-center py-12">
                                            <p className="font-mono-tech text-gray-600 text-sm">
                                                NO PARTICIPANTS IN DATABASE
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {view === 'analytics' && (
                    <AnalyticsPanel />
                )}

                {view === 'advanced' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Emergency Controls (Phase 6) */}
                        <div className="bg-dark-panel border-2 border-spy-red p-6">
                            <div className="flex items-center gap-2 mb-6">
                                <Shield className="w-6 h-6 text-spy-red animate-pulse" />
                                <h2 className="font-orbitron text-lg font-bold text-spy-red tracking-wider">
                                    EMERGENCY CONTROLS
                                </h2>
                            </div>
                            <p className="font-mono-tech text-xs text-gray-400 mb-6">
                                CAUTION: THESE ACTIONS AFFECT THE ENTIRE SYSTEM IMMEDIATELY.
                            </p>

                            <div className="space-y-4">
                                <button
                                    onClick={() => {
                                        if (confirm("EMERGENCY STOP: Are you sure? This will close all voting immediately.")) {
                                            updateState({ isVotingOpen: false });
                                        }
                                    }}
                                    className="w-full py-4 bg-spy-red text-white font-orbitron font-bold tracking-widest border-2 border-spy-red hover:bg-transparent hover:text-spy-red transition-all"
                                >
                                    PANIC: CLOSE ALL VOTING
                                </button>

                                <button
                                    onClick={() => {
                                        if (confirm("RESET DISPLAY: This will clear the active participant.")) {
                                            updateState({ currentParticipantId: null, isVotingOpen: false });
                                        }
                                    }}
                                    className="w-full py-4 bg-orange-600 text-white font-orbitron font-bold tracking-widest border-2 border-orange-600 hover:bg-transparent hover:text-orange-600 transition-all"
                                >
                                    RESET DISPLAY (WAITING SCREEN)
                                </button>
                            </div>
                        </div>

                        {/* Manual Score Override (Phase 6) */}
                        <div className="bg-dark-panel border border-spy-yellow p-6">
                            <div className="flex items-center gap-2 mb-6">
                                <Edit className="w-5 h-5 text-spy-yellow" />
                                <h2 className="font-orbitron text-lg font-bold text-spy-yellow tracking-wider">
                                    MANUAL SCORE OVERRIDE
                                </h2>
                            </div>
                            <p className="font-mono-tech text-xs text-gray-400 mb-4">
                                Manually set a final score for a participant.
                            </p>

                            <div className="space-y-4">
                                {participants.map(p => (
                                    <div key={p._id} className="flex items-center justify-between border-b border-gray-800 pb-2">
                                        <span className="font-rajdhani text-white">{p.name}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono-tech text-xs text-spy-green">
                                                {p.finalScore || "N/A"}
                                            </span>
                                            <button
                                                onClick={() => {
                                                    const score = prompt(`Enter new score for ${p.name}:`, p.finalScore || 0);
                                                    if (score !== null) {
                                                        const numScore = parseFloat(score);
                                                        if (!isNaN(numScore) && numScore >= 0 && numScore <= 10) {
                                                            axios.put(`${API_URL}/admin/participant/${p._id}`, { finalScore: numScore })
                                                                .then(() => {
                                                                    toast.success("Score Updated");
                                                                    fetchParticipants();
                                                                })
                                                                .catch(() => toast.error("Failed to update"));
                                                        } else {
                                                            toast.error("Invalid Score (0-10)");
                                                        }
                                                    }
                                                }}
                                                className="px-2 py-1 bg-spy-yellow text-black text-xs font-bold font-mono-tech hover:bg-white transition-all"
                                            >
                                                EDIT
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal for New Participant */}
            {
                showModal && (
                    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-dark-panel border-2 border-spy-green hud-corners max-w-md w-full p-8 relative">
                            {/* Header */}
                            <div className="mb-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <PlusCircle className="w-6 h-6 text-spy-green" />
                                    <h2 className="font-orbitron text-xl font-black text-white tracking-wider">
                                        NEW PARTICIPANT
                                    </h2>
                                </div>
                                <p className="font-mono-tech text-xs text-gray-400 tracking-widest">
                                    ENTER TARGET INFORMATION
                                </p>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleCreateParticipant} className="space-y-6">
                                {/* Name Field */}
                                <div>
                                    <label className="block font-mono-tech text-xs text-spy-green tracking-widest mb-2">
                                        PARTICIPANT NAME *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-black border-2 border-spy-green/30 focus:border-spy-green px-4 py-3 font-rajdhani text-white text-lg outline-none transition-all"
                                        placeholder="Enter full name"
                                        required
                                    />
                                </div>

                                {/* Image Upload Field */}
                                <div>
                                    <label className="block font-mono-tech text-xs text-spy-green tracking-widest mb-2">
                                        PARTICIPANT PHOTO (OPTIONAL)
                                    </label>
                                    <div className="flex gap-4 items-start">
                                        {/* Image Preview */}
                                        <div className="w-24 h-24 border-2 border-spy-green/30 bg-black flex items-center justify-center overflow-hidden">
                                            {imagePreview ? (
                                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <Users className="w-12 h-12 text-gray-700" />
                                            )}
                                        </div>

                                        {/* Upload Button */}
                                        <div className="flex-1">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="hidden"
                                                id="image-upload"
                                            />
                                            <label
                                                htmlFor="image-upload"
                                                className="inline-block px-4 py-2 bg-spy-green/20 border border-spy-green/50 text-spy-green font-mono-tech text-xs tracking-wider cursor-pointer hover:bg-spy-green/30 transition-all"
                                            >
                                                UPLOAD IMAGE
                                            </label>
                                            <p className="font-mono-tech text-xs text-gray-600 mt-2">
                                                Max 5MB • JPG, PNG, WEBP
                                            </p>
                                            {imagePreview && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setImagePreview(null);
                                                        setFormData({ ...formData, photoUrl: '' });
                                                    }}
                                                    className="mt-2 text-xs font-mono-tech text-spy-red hover:underline"
                                                >
                                                    REMOVE IMAGE
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Order Number Field */}
                                <div>
                                    <label className="block font-mono-tech text-xs text-spy-green tracking-widest mb-2">
                                        PERFORMANCE ORDER
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.orderNumber}
                                        onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                                        className="w-full bg-black border-2 border-spy-green/30 focus:border-spy-green px-4 py-3 font-rajdhani text-white text-lg outline-none transition-all"
                                        placeholder={`Auto: ${participants.length + 1}`}
                                        min="1"
                                    />
                                    <p className="font-mono-tech text-xs text-gray-600 mt-1">
                                        Leave blank for auto-assignment
                                    </p>
                                </div>

                                {/* Code Field */}
                                <div>
                                    <label className="block font-mono-tech text-xs text-spy-green tracking-widest mb-2">
                                        PARTICIPANT CODE (OPTIONAL)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                        className="w-full bg-black border-2 border-spy-green/30 focus:border-spy-green px-4 py-3 font-rajdhani text-white text-lg outline-none transition-all"
                                        placeholder="e.g., MP-001"
                                    />
                                </div>

                                {/* Buttons */}
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowModal(false);
                                            setFormData({ name: '', orderNumber: '', code: '' });
                                        }}
                                        className="flex-1 py-3 font-orbitron font-bold text-sm tracking-widest border-2 border-spy-red text-spy-red hover:bg-spy-red hover:text-black transition-all"
                                    >
                                        CANCEL
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-3 font-orbitron font-bold text-sm tracking-widest border-2 border-spy-green bg-spy-green text-black hover:bg-transparent hover:text-spy-green transition-all"
                                    >
                                        ADD TARGET
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
        </div >
    );
}

export default Admin;
