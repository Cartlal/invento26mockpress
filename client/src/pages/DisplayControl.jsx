import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { socket } from "../socket";
import { toast } from "react-hot-toast";
import {
    Monitor,
    Eye,
    Tv,
    Users,
    PlayCircle,
    StopCircle,
    Maximize2,
    ChevronRight,
    ChevronLeft,
    Trash2,
    Edit,
    GripVertical,
    SkipForward,
    Upload,
    Trophy,
    LogOut,
    Lock,
    Unlock
} from 'lucide-react';

const API_URL = "http://localhost:5000/api";

function DisplayControl() {
    const navigate = useNavigate();
    const [participants, setParticipants] = useState([]);
    const [eventState, setEventState] = useState({ isVotingOpen: false, currentParticipantId: null });
    const [liveStats, setLiveStats] = useState({});
    const [previewParticipant, setPreviewParticipant] = useState(null);
    const [draggedIndex, setDraggedIndex] = useState(null);
    const [editingParticipant, setEditingParticipant] = useState(null);
    const [editForm, setEditForm] = useState({ name: '', code: '', photoUrl: '' });
    const [imagePreview, setImagePreview] = useState(null);
    const [voteLocked, setVoteLocked] = useState(false);

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
            const sorted = res.data.sort((a, b) => a.orderNumber - b.orderNumber);
            setParticipants(sorted);
        } catch (e) {
            console.error(e);
        }
    };

    const fetchState = async () => {
        try {
            const res = await axios.get(`${API_URL}/admin/state`);
            setEventState(res.data);
            if (res.data.currentParticipantId) {
                const current = participants.find(p => p._id === res.data.currentParticipantId);
                setPreviewParticipant(current);
            }
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchParticipants();
        fetchState();

        socket.on("stateUpdate", (newState) => {
            setEventState(newState);
            if (newState.currentParticipantId) {
                const current = participants.find(p => p._id === newState.currentParticipantId);
                setPreviewParticipant(current);
            }
        });

        socket.on("newVote", ({ participantId, score }) => {
            setLiveStats(prev => ({
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
    }, [participants]);

    const updateState = async (updates) => {
        try {
            await axios.post(`${API_URL}/admin/state`, updates);
            toast.success("Display Updated", {
                style: { background: '#00ff41', color: '#000', fontFamily: 'monospace' }
            });
        } catch (err) {
            toast.error("Update Failed");
        }
    };

    const setLive = (participantId) => {
        updateState({ currentParticipantId: participantId, isVotingOpen: false });
    };

    const goToNext = () => {
        const currentIndex = participants.findIndex(p => p._id === eventState.currentParticipantId);
        if (currentIndex < participants.length - 1) {
            setLive(participants[currentIndex + 1]._id);
        }
    };

    const goToPrevious = () => {
        const currentIndex = participants.findIndex(p => p._id === eventState.currentParticipantId);
        if (currentIndex > 0) {
            setLive(participants[currentIndex - 1]._id);
        }
    };

    const handleLockVotes = async () => {
        if (!eventState.currentParticipantId) {
            toast.error("No participant selected");
            return;
        }

        try {
            // Get all votes for current participant
            const votesRes = await axios.get(`${API_URL}/admin/votes/${eventState.currentParticipantId}`);
            const votes = votesRes.data;
            const totalVotes = votes.length;
            const sum = votes.reduce((acc, v) => acc + v.score, 0);
            const finalScore = totalVotes > 0 ? (sum / totalVotes).toFixed(2) : 0;

            // Update participant with final score
            await axios.put(`${API_URL}/admin/participant/${eventState.currentParticipantId}`, {
                finalScore: parseFloat(finalScore),
                totalVotes: totalVotes,
                status: 'completed'
            });

            // Close voting
            await updateState({ isVotingOpen: false });
            setVoteLocked(true);

            toast.success(`Votes Locked! Final Score: ${finalScore}`, {
                duration: 5000,
                style: { background: '#00ff41', color: '#000', fontFamily: 'monospace', fontWeight: 'bold' }
            });
        } catch (err) {
            toast.error("Failed to lock votes");
        }
    };

    const handleUnlockVotes = () => {
        setVoteLocked(false);
        toast.success("Votes Unlocked", {
            style: { background: '#00ff41', color: '#000', fontFamily: 'monospace' }
        });
    };

    const handleShowWaiting = async () => {
        if (!window.confirm("Show Waiting Screen? This will clear the current participant from display.")) return;
        try {
            await updateState({ currentParticipantId: null, isVotingOpen: false });
            setVoteLocked(false);
            setPreviewParticipant(null);
            toast.success("Waiting Screen Active", {
                style: { background: '#00ff41', color: '#000', fontFamily: 'monospace' }
            });
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this participant? This action cannot be undone.")) return;
        try {
            await axios.delete(`${API_URL} /admin/participant / ${id} `);
            fetchParticipants();
            toast.success("Participant Deleted", {
                style: { background: '#00ff41', color: '#000', fontFamily: 'monospace' }
            });
        } catch (e) {
            toast.error("Deletion Failed");
        }
    };

    const startEdit = (participant) => {
        setEditingParticipant(participant._id);
        setEditForm({
            name: participant.name,
            code: participant.code || '',
            photoUrl: participant.photoUrl || ''
        });
        setImagePreview(participant.photoUrl || null);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error("Image size must be less than 5MB");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
                setEditForm({ ...editForm, photoUrl: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const saveEdit = async () => {
        try {
            await axios.put(`${API_URL} /admin/participant / ${editingParticipant} `, editForm);
            fetchParticipants();
            setEditingParticipant(null);
            toast.success("Participant Updated", {
                style: { background: '#00ff41', color: '#000', fontFamily: 'monospace' }
            });
        } catch (e) {
            toast.error("Update Failed");
        }
    };

    const handleDragStart = (index) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;

        const newParticipants = [...participants];
        const draggedItem = newParticipants[draggedIndex];
        newParticipants.splice(draggedIndex, 1);
        newParticipants.splice(index, 0, draggedItem);

        // Update order numbers
        newParticipants.forEach((p, idx) => {
            p.orderNumber = idx + 1;
        });

        setParticipants(newParticipants);
        setDraggedIndex(index);
    };

    const handleDragEnd = async () => {
        if (draggedIndex === null) return;

        try {
            // Save new order to backend
            await Promise.all(
                participants.map(p =>
                    axios.put(`${API_URL} /admin/participant / ${p._id} `, {
                        orderNumber: p.orderNumber
                    })
                )
            );
            toast.success("Order Updated", {
                style: { background: '#00ff41', color: '#000', fontFamily: 'monospace' }
            });
        } catch (e) {
            toast.error("Failed to update order");
            fetchParticipants(); // Reload on error
        }

        setDraggedIndex(null);
    };

    const openFullDisplay = () => {
        window.open('/display', '_blank', 'fullscreen=yes');
    };

    const getStats = (pId) => {
        const stats = liveStats[pId] || { count: 0, sum: 0 };
        const avg = stats.count > 0 ? (stats.sum / stats.count).toFixed(1) : "0.0";
        return { count: stats.count, avg };
    };

    const currentIndex = participants.findIndex(p => p._id === eventState.currentParticipantId);

    return (
        <div className="min-h-screen bg-black spy-grid-bg scanlines p-4">
            {/* Header */}
            <header className="max-w-7xl mx-auto mb-6">
                <div className="bg-dark-panel border-2 border-spy-green hud-corners p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Tv className="w-10 h-10 text-spy-green pulse-glow" />
                            <div>
                                <h1 className="font-orbitron text-2xl font-black text-white tracking-wider">
                                    DISPLAY CONTROL CENTER
                                </h1>
                                <p className="font-mono-tech text-xs text-spy-green tracking-widest">
                                    BROADCAST MANAGEMENT SYSTEM
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => window.open('/leaderboard', '_blank')}
                                className="flex items-center gap-2 px-6 py-3 bg-spy-yellow text-black font-orbitron font-bold text-sm tracking-wider border-2 border-spy-yellow hover:bg-transparent hover:text-spy-yellow transition-all"
                            >
                                <Trophy size={18} />
                                LEADERBOARD
                            </button>
                            <button
                                onClick={openFullDisplay}
                                className="flex items-center gap-2 px-6 py-3 bg-spy-blue text-black font-orbitron font-bold text-sm tracking-wider border-2 border-spy-blue hover:bg-transparent hover:text-spy-blue transition-all"
                            >
                                <Maximize2 size={18} />
                                OPEN DISPLAY
                            </button>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-6 py-3 bg-spy-red text-white font-orbitron font-bold text-sm tracking-wider border-2 border-spy-red hover:bg-transparent hover:text-spy-red transition-all"
                            >
                                <LogOut size={18} />
                                LOGOUT
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left - Preview Monitor */}
                <div className="lg:col-span-2">
                    <div className="bg-dark-panel border border-spy-green/30 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Monitor className="w-5 h-5 text-spy-green" />
                                <h2 className="font-orbitron text-lg font-bold text-white tracking-wider">
                                    LIVE PREVIEW
                                </h2>
                            </div>
                            <div className="flex items-center gap-2">
                                {eventState.isVotingOpen ? (
                                    <div className="flex items-center gap-2 px-3 py-1 bg-spy-green/20 border border-spy-green">
                                        <div className="w-2 h-2 bg-spy-green rounded-full animate-pulse"></div>
                                        <span className="font-mono-tech text-xs text-spy-green">LIVE</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 px-3 py-1 bg-spy-red/20 border border-spy-red">
                                        <div className="w-2 h-2 bg-spy-red rounded-full"></div>
                                        <span className="font-mono-tech text-xs text-spy-red">OFFLINE</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Preview Screen */}
                        <div className="bg-black border-2 border-spy-green/30 aspect-video flex items-center justify-center relative overflow-hidden">
                            {previewParticipant ? (
                                <div className="text-center p-8">
                                    {previewParticipant.photoUrl && (
                                        <img
                                            src={previewParticipant.photoUrl}
                                            alt={previewParticipant.name}
                                            className="w-32 h-32 object-cover border-2 border-spy-green/50 mx-auto mb-4"
                                        />
                                    )}
                                    <h3 className="font-orbitron text-4xl font-black text-white mb-2 uppercase">
                                        {previewParticipant.name}
                                    </h3>
                                    <p className="font-mono-tech text-sm text-gray-400">
                                        {previewParticipant.code || `P - ${previewParticipant.orderNumber} `}
                                    </p>
                                    {eventState.isVotingOpen && (
                                        <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-spy-green/20 border border-spy-green">
                                            <div className="w-2 h-2 bg-spy-green rounded-full animate-pulse"></div>
                                            <span className="font-mono-tech text-xs text-spy-green">VOTING ACTIVE</span>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center">
                                    <Eye className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                                    <p className="font-mono-tech text-gray-600 text-sm">
                                        NO PARTICIPANT ON DISPLAY
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Navigation & Voting Controls */}
                        <div className="mt-4 grid grid-cols-2 gap-3">
                            {/* Navigation */}
                            <div className="flex gap-2">
                                <button
                                    onClick={goToPrevious}
                                    disabled={currentIndex <= 0}
                                    className={`flex-1 py-3 font-orbitron font-bold text-sm tracking-widest flex items-center justify-center gap-2 border-2 border-spy-blue text-spy-blue hover:bg-spy-blue hover:text-black transition-all ${currentIndex <= 0 ? 'opacity-30 cursor-not-allowed' : ''
                                        }`}
                                >
                                    <ChevronLeft size={18} />
                                    PREVIOUS
                                </button>
                                <button
                                    onClick={goToNext}
                                    disabled={currentIndex >= participants.length - 1}
                                    className={`flex-1 py-3 font-orbitron font-bold text-sm tracking-widest flex items-center justify-center gap-2 border-2 border-spy-blue text-spy-blue hover:bg-spy-blue hover:text-black transition-all ${currentIndex >= participants.length - 1 ? 'opacity-30 cursor-not-allowed' : ''
                                        }`}
                                >
                                    NEXT
                                    <ChevronRight size={18} />
                                </button>
                            </div>

                            {/* Voting Control */}
                            <button
                                onClick={() => updateState({ isVotingOpen: !eventState.isVotingOpen })}
                                disabled={!previewParticipant}
                                className={`py-3 font-orbitron font-bold text-sm tracking-widest flex items-center justify-center gap-2 border-2 transition-all ${eventState.isVotingOpen
                                    ? 'bg-spy-red text-white border-spy-red hover:bg-transparent'
                                    : 'bg-spy-green text-black border-spy-green hover:bg-transparent hover:text-spy-green'
                                    } ${!previewParticipant ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {eventState.isVotingOpen ? (
                                    <>
                                        <StopCircle size={18} />
                                        CLOSE VOTING
                                    </>
                                ) : (
                                    <>
                                        <PlayCircle size={18} />
                                        OPEN VOTING
                                    </>
                                )}
                            </button>
                        </div>
                        {/* Lock/Unlock and Display Buttons */}
                        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {/* Lock/Unlock Votes */}
                            {voteLocked ? (
                                <button
                                    onClick={handleUnlockVotes}
                                    className="py-3 font-orbitron font-bold text-sm tracking-widest flex items-center justify-center gap-2 border-2 bg-spy-yellow text-black border-spy-yellow hover:bg-transparent hover:text-spy-yellow transition-all"
                                >
                                    <Unlock size={18} />
                                    UNLOCK VOTES
                                </button>
                            ) : (
                                <button
                                    onClick={handleLockVotes}
                                    disabled={!previewParticipant}
                                    className={`py-3 font-orbitron font-bold text-sm tracking-widest flex items-center justify-center gap-2 border-2 transition-all ${!previewParticipant
                                        ? 'bg-gray-700 border-gray-700 text-gray-500 cursor-not-allowed'
                                        : 'bg-spy-yellow text-black border-spy-yellow hover:bg-transparent hover:text-spy-yellow'
                                        }`}
                                >
                                    <Lock size={18} />
                                    LOCK & SUBMIT
                                </button>
                            )}

                            {/* Show Waiting Screen */}
                            <button
                                onClick={handleShowWaiting}
                                className="py-3 font-orbitron font-bold text-sm tracking-widest flex items-center justify-center gap-2 border-2 bg-gray-800 text-gray-400 border-gray-600 hover:bg-gray-700 hover:text-white transition-all"
                            >
                                <StopCircle size={18} />
                                SHOW WAITING
                            </button>

                            {/* Show Display Page */}
                            <button
                                onClick={() => window.open('/display', 'display-window', 'width=1920,height=1080')}
                                className="py-3 font-orbitron font-bold text-sm tracking-widest flex items-center justify-center gap-2 border-2 bg-spy-blue text-black border-spy-blue hover:bg-transparent hover:text-spy-blue transition-all"
                            >
                                <Monitor size={18} />
                                SHOW DISPLAY
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right - Participant Queue */}
                <div>
                    <div className="bg-dark-panel border border-spy-green/30 p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Users className="w-5 h-5 text-spy-green" />
                            <h2 className="font-orbitron text-lg font-bold text-white tracking-wider">
                                PARTICIPANT QUEUE
                            </h2>
                        </div>
                        <p className="font-mono-tech text-xs text-gray-500 mb-4">
                            Drag to reorder • Click to set live
                        </p>

                        <div className="space-y-2 max-h-[600px] overflow-y-auto">
                            {participants.map((p, index) => {
                                const isLive = eventState.currentParticipantId === p._id;
                                const stats = getStats(p._id);
                                const isEditing = editingParticipant === p._id;

                                return (
                                    <div
                                        key={p._id}
                                        draggable={!isEditing}
                                        onDragStart={() => handleDragStart(index)}
                                        onDragOver={(e) => handleDragOver(e, index)}
                                        onDragEnd={handleDragEnd}
                                        className={`p - 3 border transition - all ${isLive
                                            ? 'bg-spy-green/20 border-spy-green'
                                            : 'bg-dark-bg border-gray-800 hover:border-spy-green/50'
                                            } ${draggedIndex === index ? 'opacity-50' : ''} ${!isEditing ? 'cursor-move' : ''} `}
                                    >
                                        {isEditing ? (
                                            <div className="space-y-3">
                                                {/* Edit Form */}
                                                <div className="flex gap-2">
                                                    <div className="w-16 h-16 border border-spy-green/30 bg-black flex items-center justify-center overflow-hidden flex-shrink-0">
                                                        {imagePreview ? (
                                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <Users className="w-8 h-8 text-gray-700" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={handleImageChange}
                                                            className="hidden"
                                                            id={`edit - image - ${p._id} `}
                                                        />
                                                        <label
                                                            htmlFor={`edit - image - ${p._id} `}
                                                            className="inline-block px-2 py-1 bg-spy-green/20 border border-spy-green/50 text-spy-green font-mono-tech text-xs cursor-pointer hover:bg-spy-green/30"
                                                        >
                                                            <Upload size={12} className="inline mr-1" />
                                                            CHANGE
                                                        </label>
                                                    </div>
                                                </div>
                                                <input
                                                    type="text"
                                                    value={editForm.name}
                                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                                    className="w-full bg-black border border-spy-green/30 px-2 py-1 text-white font-rajdhani text-sm outline-none"
                                                    placeholder="Name"
                                                />
                                                <input
                                                    type="text"
                                                    value={editForm.code}
                                                    onChange={(e) => setEditForm({ ...editForm, code: e.target.value })}
                                                    className="w-full bg-black border border-spy-green/30 px-2 py-1 text-white font-mono-tech text-xs outline-none"
                                                    placeholder="Code"
                                                />
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={saveEdit}
                                                        className="flex-1 px-3 py-1 bg-spy-green text-black font-mono-tech text-xs hover:bg-spy-green/80"
                                                    >
                                                        SAVE
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingParticipant(null)}
                                                        className="flex-1 px-3 py-1 border border-spy-red text-spy-red font-mono-tech text-xs hover:bg-spy-red/20"
                                                    >
                                                        CANCEL
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-3">
                                                <GripVertical className="w-4 h-4 text-gray-600 flex-shrink-0" />

                                                {/* Photo Thumbnail */}
                                                <div className="w-12 h-12 border border-spy-green/30 bg-black flex items-center justify-center overflow-hidden flex-shrink-0">
                                                    {p.photoUrl ? (
                                                        <img src={p.photoUrl} alt={p.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Users className="w-6 h-6 text-gray-700" />
                                                    )}
                                                </div>

                                                <div
                                                    className="flex-1 min-w-0 cursor-pointer"
                                                    onClick={() => setLive(p._id)}
                                                >
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-mono-tech text-xs text-gray-500">
                                                            #{p.orderNumber}
                                                        </span>
                                                        {isLive && (
                                                            <div className="flex items-center gap-1">
                                                                <div className="w-2 h-2 bg-spy-green rounded-full animate-pulse"></div>
                                                                <span className="font-mono-tech text-xs text-spy-green">LIVE</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <p className="font-rajdhani font-semibold text-white text-sm truncate">
                                                        {p.name}
                                                    </p>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <span className="font-mono-tech text-xs text-gray-600">
                                                            Votes: {stats.count}
                                                        </span>
                                                        <span className="font-mono-tech text-xs text-spy-yellow">
                                                            Avg: {stats.avg}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="flex gap-1 flex-shrink-0">
                                                    <button
                                                        onClick={() => startEdit(p)}
                                                        className="p-2 text-spy-blue hover:bg-spy-blue/20 transition-all"
                                                        title="Edit"
                                                    >
                                                        <Edit size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(p._id)}
                                                        className="p-2 text-spy-red hover:bg-spy-red/20 transition-all"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}

                            {participants.length === 0 && (
                                <div className="text-center py-12">
                                    <p className="font-mono-tech text-gray-600 text-sm">
                                        NO PARTICIPANTS IN QUEUE
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DisplayControl;
