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
    Unlock,
    PlusCircle,
    QrCode,
    RefreshCcw,
    Link as LinkIcon
} from 'lucide-react';

import { apiUrl as API_URL, serverUrl as SERVER_URL } from "../config";


function DisplayControl() {
    const navigate = useNavigate();
    const [participants, setParticipants] = useState([]);
    const [eventState, setEventState] = useState({ isVotingOpen: false, currentParticipantId: null });
    const [liveStats, setLiveStats] = useState({});
    const [draggedIndex, setDraggedIndex] = useState(null);
    const [editingParticipant, setEditingParticipant] = useState(null);
    const [editForm, setEditForm] = useState({ name: '', code: '', photoUrl: '' });
    const [imagePreview, setImagePreview] = useState(null);
    const [voteLocked, setVoteLocked] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [addForm, setAddForm] = useState({ name: '', code: '', photoUrl: '' });
    const [qrPreview, setQrPreview] = useState(null);

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
        } catch (e) {
            console.error(e);
        }
    };

    // Derived State: Priority to populated data from server, fallback to local lookup
    const currentParticipant = (eventState.currentParticipantId && typeof eventState.currentParticipantId === 'object')
        ? eventState.currentParticipantId
        : participants.find(p => p._id === eventState.currentParticipantId);

    const currentParticipantId = currentParticipant?._id || eventState.currentParticipantId;

    useEffect(() => {
        fetchParticipants();
        fetchState();
        if (eventState.qrCodeUrl) setQrPreview(eventState.qrCodeUrl);

        // Join admin room to see live vote status
        socket.emit('joinRoom', 'admin');

        socket.on("stateUpdate", (newState) => {
            setEventState(newState);
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
    }, []); // Empty dependency array prevents infinite loops

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
        updateState({
            currentParticipantId: participantId,
            isVotingOpen: false,
            displayMode: 'waiting'
        });
        setVoteLocked(false);
    };

    const goToNext = () => {
        const currentIndex = participants.findIndex(p => p._id === currentParticipantId);
        if (currentIndex < participants.length - 1) {
            setLive(participants[currentIndex + 1]._id);
        }
    };

    const goToPrevious = () => {
        const currentIndex = participants.findIndex(p => p._id === currentParticipantId);
        if (currentIndex > 0) {
            setLive(participants[currentIndex - 1]._id);
        }
    };

    const handleLockVotes = async () => {
        if (!currentParticipantId) {
            toast.error("No participant selected");
            return;
        }

        try {
            // Simply closing voting now triggers backend auto-calculation
            await updateState({ isVotingOpen: false, displayMode: 'result' });
            setVoteLocked(true);

            toast.success(`Votes Locked! Transitioning to Results...`, {
                duration: 5000,
                style: { background: '#00ff41', color: '#000', fontFamily: 'monospace', fontWeight: 'bold' }
            });
        } catch (err) {
            toast.error("Failed to lock votes");
        }
    };

    const handleUnlockVotes = async () => {
        try {
            await updateState({ isVotingOpen: true, displayMode: 'voting_open' });
            setVoteLocked(false);
            toast.success("Votes Unlocked", {
                style: { background: '#00ff41', color: '#000', fontFamily: 'monospace' }
            });
        } catch (err) {
            toast.error("Failed to unlock votes");
        }
    };

    const setDisplayMode = (mode) => {
        updateState({ displayMode: mode });
    };

    const handleQrUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = async () => {
                setQrPreview(reader.result);
                await updateState({ qrCodeUrl: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleShowWaiting = async () => {
        if (!window.confirm("Show Waiting Screen? This will clear the current participant from display.")) return;
        try {
            await updateState({ currentParticipantId: null, isVotingOpen: false, displayMode: 'waiting' });
            setVoteLocked(false);
            toast.success("Waiting Screen Active", {
                style: { background: '#00ff41', color: '#000', fontFamily: 'monospace' }
            });
        } catch (err) {
            console.error(err);
        }
    };

    const handleRedisReset = async () => {
        if (!window.confirm("CRITICAL: This will flush all cached data and force a protocol reload. Use only if display is stuck. Proceed?")) return;
        try {
            await axios.post(`${API_URL}/admin/redis-reset`);
            toast.success("PROTOCOL CACHE FLUSHED", {
                style: { background: '#ff0000', color: '#fff', fontFamily: 'monospace', fontWeight: 'bold' }
            });
            window.location.reload();
        } catch (err) {
            toast.error("Emergency flush failed");
        }
    };

    const handleCreateParticipant = async (e) => {
        e.preventDefault();
        if (!addForm.name.trim()) {
            toast.error("Name is required");
            return;
        }

        try {
            const formData = new FormData();
            formData.append('name', addForm.name);
            formData.append('orderNumber', participants.length + 1);
            formData.append('code', addForm.code);

            // Check if photoUrl is a data URL (from file reader) or just string
            // Actually, we need the file object for Multer.
            // Let's modify handleImageChange to store the file object as well.
            // But for now, since we only have the dataURL in state, let's fix the state to hold the file.
            // See next edit for handleImageChange fix.
            if (addForm.file) {
                formData.append('photo', addForm.file);
            }

            await axios.post(`${API_URL}/admin/participant`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            fetchParticipants();
            toast.success("Participant Added", {
                style: { background: '#00ff41', color: '#000', fontFamily: 'monospace' }
            });
            setShowAddModal(false);
            setAddForm({ name: '', code: '', photoUrl: '', file: null });
            setImagePreview(null);
        } catch (e) {
            console.error(e);
            toast.error("Failed to add participant");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this participant? This action cannot be undone.")) return;
        try {
            await axios.delete(`${API_URL}/admin/participant/${id}`);
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

    const handleImageChange = (e, isEdit = true) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                toast.error("Image size must be less than 10MB");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
                if (isEdit) {
                    setEditForm({ ...editForm, photoUrl: reader.result, file: file }); // Store file for upload
                } else {
                    setAddForm({ ...addForm, photoUrl: reader.result, file: file }); // Store file for upload
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const saveEdit = async () => {
        try {
            // Check if we have a new file to upload
            if (editForm.file) {
                const formData = new FormData();
                formData.append('photo', editForm.file);
                // Upload image first to get URL (since PUT /participant/:id expects JSON usually, or strict multipart)
                // Let's us the new /upload route for standalone upload then update participant
                const uploadRes = await axios.post(`${API_URL}/admin/upload`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                editForm.photoUrl = uploadRes.data.photoUrl;
            }

            await axios.put(`${API_URL}/admin/participant/${editingParticipant}`, {
                name: editForm.name,
                code: editForm.code,
                photoUrl: editForm.photoUrl
                // orderNumber is handled by drag/drop
            });

            fetchParticipants();
            setEditingParticipant(null);
            toast.success("Participant Updated", {
                style: { background: '#00ff41', color: '#000', fontFamily: 'monospace' }
            });
        } catch (e) {
            console.error(e);
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
                    axios.put(`${API_URL}/admin/participant/${p._id}`, {
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

    const currentIndex = participants.findIndex(p => p._id === currentParticipantId);

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
                                onClick={() => window.open('/qr-code', '_blank')}
                                className="flex items-center gap-2 px-6 py-3 bg-spy-green text-black font-orbitron font-bold text-sm tracking-wider border-2 border-spy-green hover:bg-transparent hover:text-spy-green transition-all"
                            >
                                <QrCode size={18} />
                                OPEN QR
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
                            <button
                                onClick={handleRedisReset}
                                className="flex items-center gap-2 px-4 py-3 bg-spy-yellow/10 text-spy-yellow font-mono text-xs border border-spy-yellow hover:bg-spy-yellow hover:text-black transition-all"
                            >
                                <RefreshCcw size={16} className="animate-spin-slow" />
                                HARD RESET
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
                        <div className="bg-black border-2 border-spy-green/30 aspect-video flex items-center justify-center relative overflow-hidden p-6">
                            <div className="absolute inset-0 spy-grid-bg opacity-10"></div>
                            {currentParticipant ? (
                                <div className="flex items-center gap-8 w-full">
                                    {currentParticipant.photoUrl ? (
                                        <img
                                            src={`${SERVER_URL}${currentParticipant.photoUrl}`}
                                            alt={currentParticipant.name}
                                            className="w-32 h-32 object-cover border-2 border-spy-green/50 flex-shrink-0"
                                        />
                                    ) : (
                                        <div className="w-32 h-32 border-2 border-spy-green/50 flex items-center justify-center bg-black flex-shrink-0">
                                            <Users className="w-12 h-12 text-gray-800" />
                                        </div>
                                    )}
                                    <div className="text-left flex-1">
                                        <h3 className="font-orbitron text-2xl font-black text-white mb-2 uppercase tracking-tight">
                                            {currentParticipant.name}
                                        </h3>
                                        <div className="font-mono-tech text-[10px] text-gray-400 flex gap-4 uppercase">
                                            <span>ID: {currentParticipant.code || `P-${currentParticipant.orderNumber}`}</span>
                                            <span className="text-spy-green">|</span>
                                            <span>SEQ: #{currentParticipant.orderNumber}</span>
                                        </div>
                                        {eventState.isVotingOpen && (
                                            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-spy-green/20 border border-spy-green">
                                                <div className="w-2 h-2 bg-spy-green rounded-full animate-pulse"></div>
                                                <span className="font-mono-tech text-[10px] text-spy-green uppercase font-bold">VOTING_ACTIVE</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <Eye className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                                    <p className="font-mono-tech text-gray-600 text-sm tracking-widest uppercase">
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
                                onClick={() => {
                                    const newState = !eventState.isVotingOpen;
                                    updateState({
                                        isVotingOpen: newState,
                                        displayMode: newState ? 'voting_open' : eventState.displayMode
                                    });
                                }}
                                disabled={!currentParticipant}
                                className={`py-3 font-orbitron font-bold text-sm tracking-widest flex items-center justify-center gap-2 border-2 transition-all ${eventState.isVotingOpen
                                    ? 'bg-spy-red text-white border-spy-red hover:bg-transparent'
                                    : 'bg-spy-green text-black border-spy-green hover:bg-transparent hover:text-spy-green'
                                    } ${!currentParticipant ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3">
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
                                    disabled={!currentParticipant}
                                    className={`py-3 font-orbitron font-bold text-sm tracking-widest flex items-center justify-center gap-2 border-2 transition-all ${!currentParticipant
                                        ? 'bg-gray-700 border-gray-700 text-gray-500 cursor-not-allowed'
                                        : 'bg-spy-yellow text-black border-spy-yellow hover:bg-transparent hover:text-spy-yellow'
                                        }`}
                                >
                                    <Lock size={18} />
                                    LOCK & SUBMIT
                                </button>
                            )}

                            {/* Show Waiting Screen - Moved/Replaced by specialized control area if needed, but removed per request */}
                        </div>

                        {/* Display Mode Controls */}
                        <div className="mt-6 bg-black/40 p-4 border border-spy-green/10">
                            <span className="font-mono-tech text-[10px] text-gray-500 tracking-widest block mb-3 uppercase">PROJECTOR VIEW MODE</span>
                            <div className="grid grid-cols-4 gap-2">
                                <button
                                    onClick={() => setDisplayMode('waiting')}
                                    className={`py-2 font-mono-tech text-xs border transition-all ${eventState.displayMode === 'waiting' ? 'bg-spy-green text-black border-spy-green' : 'text-spy-green border-spy-green/30 hover:bg-spy-green/10'}`}
                                >
                                    STANDBY
                                </button>
                                <button
                                    onClick={() => setDisplayMode('voting_open')}
                                    className={`py-2 font-mono-tech text-xs border transition-all ${eventState.displayMode === 'voting_open' ? 'bg-spy-blue text-black border-spy-blue' : 'text-spy-blue border-spy-blue/30 hover:bg-spy-blue/10'}`}
                                >
                                    VOTING
                                </button>
                                <button
                                    onClick={() => setDisplayMode('result')}
                                    className={`py-2 font-mono-tech text-xs border transition-all ${eventState.displayMode === 'result' ? 'bg-spy-yellow text-black border-spy-yellow' : 'text-spy-yellow border-spy-yellow/30 hover:bg-spy-yellow/10'}`}
                                >
                                    RESULT
                                </button>
                                <button
                                    onClick={() => setDisplayMode('qr')}
                                    className={`py-2 font-mono-tech text-xs border transition-all ${eventState.displayMode === 'qr' ? 'bg-spy-blue text-black border-spy-blue' : 'text-spy-blue border-spy-blue/30 hover:bg-spy-blue/10'}`}
                                >
                                    QR CODE
                                </button>

                            </div>
                        </div>

                        {/* QR Code Management */}
                        <div className="mt-6 bg-dark-panel border border-spy-blue/30 p-6 hud-corners">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <QrCode className="w-5 h-5 text-spy-blue" />
                                    <h2 className="font-orbitron text-md font-bold text-white tracking-wider">
                                        QR CODE PROTOCOL
                                    </h2>
                                </div>
                                <button
                                    onClick={() => setDisplayMode('qr')}
                                    className="px-4 py-1.5 bg-spy-blue/20 border border-spy-blue text-spy-blue font-mono-tech text-[10px] hover:bg-spy-blue/40 transition-all uppercase"
                                >
                                    Activate QR View
                                </button>
                            </div>

                            <div className="flex gap-4 items-center">
                                <div className="w-24 h-24 bg-white p-2 border border-spy-blue/30 flex-shrink-0">
                                    {qrPreview ? (
                                        <img src={qrPreview} alt="QR Preview" className="w-full h-full object-contain" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                            <QrCode className="w-8 h-8 text-gray-300" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* QR From URL */}
                            <div className="mt-4 pt-4 border-t border-spy-blue/20">
                                <label className="block font-mono-tech text-[10px] text-spy-blue tracking-widest mb-2 uppercase">
                                    Generate QR from URL
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        id="qr-url-input"
                                        placeholder="Enter URL to generate QR..."
                                        className="flex-1 bg-black border border-spy-blue/30 px-3 py-2 font-mono-tech text-xs text-white outline-none focus:border-spy-blue"
                                    />
                                    <button
                                        onClick={async () => {
                                            const url = document.getElementById('qr-url-input').value;
                                            if (!url) return toast.error("Enter a URL first");
                                            const qrGenUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(url)}`;
                                            try {
                                                await axios.post(`${API_URL}/admin/state`, { qrCodeUrl: qrGenUrl });
                                                setQrPreview(qrGenUrl);
                                                toast.success("QR Generated from URL");
                                            } catch (err) {
                                                toast.error("Failed to update QR");
                                            }
                                        }}
                                        className="px-3 py-2 bg-spy-blue/20 text-spy-blue border border-spy-blue hover:bg-spy-blue hover:text-black transition-all"
                                    >
                                        <LinkIcon size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>


                    </div>
                </div>

                {/* Right - Participant Queue */}
                <div>
                    <div className="bg-dark-panel border border-spy-green/30 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Users className="w-5 h-5 text-spy-green" />
                                <h2 className="font-orbitron text-lg font-bold text-white tracking-wider">
                                    PARTICIPANT QUEUE
                                </h2>
                            </div>
                            <button
                                onClick={() => {
                                    setShowAddModal(true);
                                    setImagePreview(null);
                                }}
                                className="flex items-center gap-1 px-3 py-1 bg-spy-green text-black font-orbitron font-bold text-[10px] tracking-wider border border-spy-green hover:bg-transparent hover:text-spy-green transition-all"
                            >
                                <PlusCircle size={14} />
                                ADD AGENT
                            </button>
                        </div>
                        <p className="font-mono-tech text-xs text-gray-500 mb-4">
                            Drag to reorder • Click to set live
                        </p>

                        <div className="space-y-2 max-h-[600px] overflow-y-auto">
                            {participants.map((p, index) => {
                                const isLive = currentParticipantId === p._id;
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
            {/* Add Participant Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
                    <div className="bg-dark-panel border-2 border-spy-green hud-corners w-full max-w-lg p-8 animate-in fade-in zoom-in duration-300">
                        <div className="flex items-center gap-3 mb-8">
                            <PlusCircle className="text-spy-green w-8 h-8" />
                            <h2 className="font-orbitron text-2xl font-black text-white tracking-widest uppercase">
                                ADD NEW AGENT
                            </h2>
                        </div>

                        <form onSubmit={handleCreateParticipant} className="space-y-6">
                            {/* Photo Upload Field */}
                            <div>
                                <label className="block font-mono-tech text-xs text-spy-green tracking-widest mb-2 uppercase">
                                    AGENT PROXIED PHOTO
                                </label>
                                <div className="flex gap-4 items-center">
                                    <div className="w-24 h-24 border-2 border-spy-green/30 bg-black flex items-center justify-center overflow-hidden">
                                        {imagePreview ? (
                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <Users className="w-12 h-12 text-gray-800" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleImageChange(e, false)}
                                            className="hidden"
                                            id="add-image-upload"
                                        />
                                        <label
                                            htmlFor="add-image-upload"
                                            className="inline-block px-4 py-2 bg-spy-green/20 border border-spy-green/50 text-spy-green font-mono-tech text-xs tracking-wider cursor-pointer hover:bg-spy-green/30 transition-all font-bold"
                                        >
                                            UPLOAD DOSSIER
                                        </label>
                                        <p className="font-mono-tech text-[10px] text-gray-600 mt-2">
                                            SECURE UPLOAD • MAX 10MB
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Name Field */}
                            <div>
                                <label className="block font-mono-tech text-xs text-spy-green tracking-widest mb-2">
                                    TARGET IDENTITY (NAME)
                                </label>
                                <input
                                    type="text"
                                    value={addForm.name}
                                    onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                                    className="w-full bg-black border-2 border-spy-green/30 focus:border-spy-green px-4 py-3 font-rajdhani text-white text-lg outline-none transition-all"
                                    placeholder="Enter full name..."
                                    required
                                />
                            </div>

                            {/* Code Field */}
                            <div>
                                <label className="block font-mono-tech text-xs text-spy-green tracking-widest mb-2">
                                    PROTOCOL CODE (OPTIONAL)
                                </label>
                                <input
                                    type="text"
                                    value={addForm.code}
                                    onChange={(e) => setAddForm({ ...addForm, code: e.target.value })}
                                    className="w-full bg-black border-2 border-spy-green/30 focus:border-spy-green px-4 py-3 font-rajdhani text-white text-lg outline-none transition-all"
                                    placeholder="e.g., MP-ALPHA-01"
                                />
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddModal(false);
                                        setAddForm({ name: '', code: '', photoUrl: '' });
                                        setImagePreview(null);
                                    }}
                                    className="flex-1 py-3 font-orbitron font-bold text-sm tracking-widest border-2 border-spy-red text-spy-red hover:bg-spy-red hover:text-black transition-all"
                                >
                                    ABORT
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 font-orbitron font-bold text-sm tracking-widest border-2 border-spy-green bg-spy-green text-black hover:bg-transparent hover:text-spy-green transition-all"
                                >
                                    INITIALIZE
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DisplayControl;
