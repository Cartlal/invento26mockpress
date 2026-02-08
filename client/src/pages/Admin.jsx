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
    Edit,
    Settings,
    BarChart2,
    FileText
} from 'lucide-react';

import AnalyticsPanel from '../components/AnalyticsPanel';
import LiveMonitor from "../components/LiveMonitor";

import { apiUrl as API_URL } from "../config";

function Admin() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("monitor"); // 'monitor', 'participants', 'controls', 'analytics'
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

        // Join high-traffic room for real-time monitor
        socket.emit('joinRoom', 'admin');

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
            if (file.size > 10 * 1024 * 1024) {
                toast.error("Image size must be less than 10MB");
                return;
            }
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
        <div className="min-h-screen bg-black spy-grid-bg text-white font-sans antialiased overflow-hidden flex flex-col md:flex-row">
            {/* Sidebar */}
            <aside className="w-full md:w-64 bg-dark-panel border-r border-spy-green/30 flex-shrink-0 flex flex-col h-screen">
                <div className="p-6 border-b border-spy-green/30">
                    <h1 className="font-orbitron text-2xl font-black text-white tracking-wider">
                        INVENTO <span className="text-spy-green">ADMIN</span>
                    </h1>
                    <p className="font-mono-tech text-xs text-spy-green/70 tracking-widest mt-1">
                        MOCK PRESS CONTROL
                    </p>
                </div>

                <nav className="p-4 space-y-2 flex-grow overflow-y-auto">
                    <button
                        onClick={() => setActiveTab("monitor")}
                        className={`w-full text-left px-4 py-3 font-orbitron font-bold text-sm tracking-widest transition-all clip-path-spy ${activeTab === "monitor"
                            ? "bg-spy-green text-black clip-path-spy-active"
                            : "text-gray-400 hover:text-spy-green hover:bg-spy-green/10"
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <Activity size={18} />
                            LIVE MONITOR
                        </div>
                    </button>

                    <button
                        onClick={() => setActiveTab("participants")}
                        className={`w-full text-left px-4 py-3 font-orbitron font-bold text-sm tracking-widest transition-all clip-path-spy ${activeTab === "participants"
                            ? "bg-spy-green text-black clip-path-spy-active"
                            : "text-gray-400 hover:text-spy-green hover:bg-spy-green/10"
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <Users size={18} />
                            PARTICIPANTS
                        </div>
                    </button>

                    <button
                        onClick={() => setActiveTab("controls")}
                        className={`w-full text-left px-4 py-3 font-orbitron font-bold text-sm tracking-widest transition-all clip-path-spy ${activeTab === "controls"
                            ? "bg-spy-green text-black clip-path-spy-active"
                            : "text-gray-400 hover:text-spy-green hover:bg-spy-green/10"
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <Settings size={18} />
                            CONTROLS
                        </div>
                    </button>

                    <button
                        onClick={() => setActiveTab("analytics")}
                        className={`w-full text-left px-4 py-3 font-orbitron font-bold text-sm tracking-widest transition-all clip-path-spy ${activeTab === "analytics"
                            ? "bg-spy-green text-black clip-path-spy-active"
                            : "text-gray-400 hover:text-spy-green hover:bg-spy-green/10"
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <BarChart2 size={18} />
                            ANALYTICS
                        </div>
                    </button>
                </nav>

                <div className="p-6 border-t border-spy-green/30 space-y-3">
                    <button
                        onClick={() => navigate('/logs')}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-spy-blue/10 text-spy-blue font-orbitron font-bold text-xs tracking-wider border border-spy-blue/50 hover:bg-spy-blue hover:text-black transition-all"
                    >
                        <FileText size={16} />
                        AUDIT LOGS
                    </button>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-spy-red/10 text-spy-red font-orbitron font-bold text-xs tracking-wider border border-spy-red/50 hover:bg-spy-red hover:text-white transition-all"
                    >
                        <LogOut size={16} />
                        LOGOUT
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6 md:p-10 overflow-y-auto h-screen custom-scrollbar">

                {/* LIVE MONITOR TAB */}
                {activeTab === "monitor" && (
                    <LiveMonitor participants={participants} eventState={eventState} />
                )}

                {/* PARTICIPANTS TAB */}
                {activeTab === "participants" && (
                    <div className="space-y-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                            <div>
                                <h2 className="font-orbitron text-3xl font-black text-white tracking-wider mb-2">
                                    PARTICIPANT ROSTER
                                </h2>
                                <p className="font-mono-tech text-xs text-spy-green tracking-widest">
                                    MANAGE ACTIVE TARGETS AND SEQUENCE
                                </p>
                            </div>
                            <button
                                onClick={() => setShowModal(true)}
                                className="flex items-center justify-center gap-2 px-6 py-3 bg-spy-green text-black font-orbitron font-bold text-sm tracking-wider border-2 border-spy-green hover:bg-transparent hover:text-spy-green transition-all"
                            >
                                <PlusCircle size={18} />
                                NEW PARTICIPANT
                            </button>
                        </div>

                        <div className="bg-dark-panel border border-spy-green/30 p-6">
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
                                                            <button
                                                                onClick={() => updateState({ currentParticipantId: p._id, isVotingOpen: false })}
                                                                className={`flex items-center gap-1 px-3 py-1 text-xs font-mono-tech border transition-all ${isActive
                                                                    ? 'bg-spy-green text-black border-spy-green cursor-default'
                                                                    : 'border-spy-green/50 text-spy-green hover:bg-spy-green hover:text-black'}`}
                                                                disabled={isActive}
                                                            >
                                                                <Monitor size={12} />
                                                                {isActive ? 'ACTIVE' : 'ACTIVATE'}
                                                            </button>
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
                                    <div className="text-center py-12 text-gray-500 font-mono-tech">
                                        NO PARTICIPANTS IN DATABASE
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* CONTROLS TAB */}
                {activeTab === "controls" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Voting Control */}
                        <div className="bg-dark-panel border border-spy-green/30 p-6 h-fit">
                            <div className="flex items-center gap-2 mb-6">
                                <Activity className="w-5 h-5 text-spy-green" />
                                <h2 className="font-orbitron text-lg font-bold text-white tracking-wider">
                                    VOTING CONTROL
                                </h2>
                            </div>

                            {/* Status Indicator */}
                            <div className={`mb-6 p-4 border-2 ${eventState.isVotingOpen ? 'border-spy-green bg-spy-green/10' : 'border-spy-red bg-spy-red/10'}`}>
                                <div className="flex items-center gap-3 mb-2">
                                    {eventState.isVotingOpen ? (
                                        <Unlock className="w-6 h-6 text-spy-green" />
                                    ) : (
                                        <Lock className="w-6 h-6 text-spy-red" />
                                    )}
                                    <span className="font-mono-tech text-xs tracking-widest text-gray-400">
                                        CHANNEL STATUS
                                    </span>
                                </div>
                                <p className={`font-orbitron text-xl font-bold ${eventState.isVotingOpen ? 'text-spy-green neon-green' : 'text-spy-red neon-red'}`}>
                                    {eventState.isVotingOpen ? 'OPEN / RECEIVING' : 'CLOSED / LOCKED'}
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

                            {/* Toggle Button */}
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
                                        CLOSE VOTING CHANNEL
                                    </>
                                ) : (
                                    <>
                                        <PlayCircle size={20} />
                                        OPEN VOTING CHANNEL
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Emergency Controls */}
                        <div className="bg-dark-panel border-2 border-spy-red p-6 h-fit">
                            <div className="flex items-center gap-2 mb-6">
                                <Shield className="w-6 h-6 text-spy-red animate-pulse" />
                                <h2 className="font-orbitron text-lg font-bold text-spy-red tracking-wider">
                                    EMERGENCY OVERRIDE
                                </h2>
                            </div>

                            <div className="space-y-4">
                                <button
                                    onClick={() => {
                                        if (confirm("EMERGENCY STOP: Are you sure? This will close all voting immediately.")) {
                                            updateState({ isVotingOpen: false });
                                        }
                                    }}
                                    className="w-full py-4 bg-spy-red text-white font-orbitron font-bold tracking-widest border-2 border-spy-red hover:bg-transparent hover:text-spy-red transition-all"
                                >
                                    PANIC: CLOSE ALL
                                </button>

                                <button
                                    onClick={() => {
                                        if (confirm("RESET DISPLAY: This will clear the active participant.")) {
                                            updateState({ currentParticipantId: null, isVotingOpen: false });
                                        }
                                    }}
                                    className="w-full py-4 bg-orange-600 text-white font-orbitron font-bold tracking-widest border-2 border-orange-600 hover:bg-transparent hover:text-orange-600 transition-all"
                                >
                                    RESET DISPLAY
                                </button>
                            </div>
                        </div>

                        {/* Manual Score Override */}
                        <div className="bg-dark-panel border border-spy-yellow p-6 md:col-span-2">
                            <div className="flex items-center gap-2 mb-6">
                                <Edit className="w-5 h-5 text-spy-yellow" />
                                <h2 className="font-orbitron text-lg font-bold text-spy-yellow tracking-wider">
                                    MANUAL SCORE ENTRY
                                </h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {participants.map(p => (
                                    <div key={p._id} className="flex items-center justify-between bg-black/50 p-3 border border-gray-800">
                                        <span className="font-rajdhani text-white truncate w-32">{p.name}</span>
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

                {/* ANALYTICS TAB */}
                {activeTab === "analytics" && (
                    <AnalyticsPanel />
                )}
            </main>

            {/* Modal for New Participant */}
            {showModal && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-dark-panel border-2 border-spy-green hud-corners max-w-md w-full p-8 relative">
                        {/* Start of Modal Content */}
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
            )}
        </div>
    );
}

export default Admin;
