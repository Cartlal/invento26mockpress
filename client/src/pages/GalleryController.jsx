import { useState, useEffect } from "react";
import axios from "axios";
import { socket } from "../socket";
import { toast } from "react-hot-toast";
import {
    Image as ImageIcon,
    ChevronLeft,
    ChevronRight,
    Play,
    Pause,
    SkipBack,
    SkipForward,
    Monitor
} from "lucide-react";

import { apiUrl as API_URL, serverUrl as SERVER_URL } from "../config";

function GalleryController() {
    const [participants, setParticipants] = useState([]);
    const [selectedParticipant, setSelectedParticipant] = useState(null);
    const [galleryImages, setGalleryImages] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [eventState, setEventState] = useState(null);
    const [autoPlay, setAutoPlay] = useState(false);

    useEffect(() => {
        fetchParticipants();
        fetchEventState();

        socket.on('stateUpdate', (newState) => {
            setEventState(newState);
        });

        return () => {
            socket.off('stateUpdate');
        };
    }, []);

    // Sync selected participant with global state if changed
    useEffect(() => {
        if (eventState?.currentParticipantId && participants.length > 0) {
            const currentParticipantObj = eventState.currentParticipantId;
            const targetId = typeof currentParticipantObj === 'object' ? currentParticipantObj._id : currentParticipantObj;

            const current = participants.find(p => p._id === targetId);
            if (current && (!selectedParticipant || selectedParticipant._id !== current._id)) {
                setSelectedParticipant(current);
            }
        }
    }, [eventState, participants]);

    useEffect(() => {
        if (selectedParticipant) {
            fetchGalleryImages(selectedParticipant._id);
        }
    }, [selectedParticipant]);

    useEffect(() => {
        if (autoPlay && galleryImages.length > 0) {
            const interval = setInterval(() => {
                handleNavigate('next');
            }, 3000); // Auto-advance every 3 seconds
            return () => clearInterval(interval);
        }
    }, [autoPlay, galleryImages, currentIndex]);

    const fetchParticipants = async () => {
        try {
            const res = await axios.get(`${API_URL}/admin/participants`);
            setParticipants(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchEventState = async () => {
        try {
            const res = await axios.get(`${API_URL}/admin/state`);
            setEventState(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchGalleryImages = async (participantId) => {
        try {
            const res = await axios.get(`${API_URL}/gallery/participant/${participantId}`);
            setGalleryImages(res.data);
            setCurrentIndex(0);
        } catch (err) {
            console.error(err);
        }
    };

    const handleNavigate = async (direction) => {
        if (!selectedParticipant || galleryImages.length === 0) {
            toast.error("No images to navigate");
            return;
        }

        try {
            await axios.post(`${API_URL}/gallery/navigate`, {
                participantId: selectedParticipant._id,
                direction
            });

            // Update local index
            if (direction === 'next') {
                setCurrentIndex((currentIndex + 1) % galleryImages.length);
            } else {
                setCurrentIndex((currentIndex - 1 + galleryImages.length) % galleryImages.length);
            }

            toast.success(`Moved ${direction}`);
        } catch (err) {
            toast.error("Navigation failed");
        }
    };

    const handleJumpTo = async (index) => {
        if (!selectedParticipant || galleryImages.length === 0) return;

        try {
            const targetImage = galleryImages[index];

            // Update state with specific image
            await axios.post(`${API_URL}/admin/state`, {
                displayMode: 'gallery',
                currentGalleryImageId: targetImage._id,
                currentParticipantId: selectedParticipant._id
            });

            setCurrentIndex(index);
            toast.success(`Jumped to image ${index + 1}`);
        } catch (err) {
            toast.error("Jump failed");
        }
    };

    const handleSetGalleryMode = async () => {
        try {
            await axios.post(`${API_URL}/admin/state`, {
                displayMode: 'gallery',
                currentParticipantId: selectedParticipant?._id
            });
            toast.success("Gallery mode activated");
            if (galleryImages.length > 0) {
                handleJumpTo(0);
            }
        } catch (err) {
            toast.error("Failed to set gallery mode");
        }
    };

    return (
        <div className="min-h-screen bg-black spy-grid-bg">
            {/* Header */}
            <div className="bg-dark-panel border-b-2 border-spy-red/30">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <ImageIcon className="w-8 h-8 text-spy-red" />
                            <div>
                                <h1 className="font-orbitron text-2xl font-black text-white tracking-widest uppercase">
                                    Gallery Controller
                                </h1>
                                <p className="font-mono-tech text-xs text-spy-red tracking-widest uppercase mt-1">
                                    Manage Display Gallery
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleSetGalleryMode}
                            disabled={!selectedParticipant}
                            className={`px-4 py-2 font-orbitron font-bold text-sm tracking-wider flex items-center gap-2 border-2 transition-all ${selectedParticipant
                                ? "bg-spy-red text-black border-spy-red hover:bg-transparent hover:text-spy-red"
                                : "bg-gray-700 border-gray-700 text-gray-500 cursor-not-allowed"
                                }`}
                        >
                            <Monitor size={16} />
                            ACTIVATE GALLERY MODE
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left - Participant Selection */}
                    <div className="lg:col-span-1">
                        <div className="bg-dark-panel border border-spy-red/30 p-6 hud-corners">
                            <h2 className="font-orbitron text-lg font-bold text-white tracking-wider mb-4 uppercase">
                                Select Character
                            </h2>
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                {participants.map((p) => (
                                    <button
                                        key={p._id}
                                        onClick={() => setSelectedParticipant(p)}
                                        className={`w-full p-3 border transition-all text-left ${selectedParticipant?._id === p._id
                                            ? "bg-spy-red text-black border-spy-red"
                                            : "bg-black/40 text-white border-spy-red/20 hover:border-spy-red/50"
                                            }`}
                                    >
                                        <div className="font-orbitron font-bold text-sm">
                                            #{p.orderNumber} - {p.name}
                                        </div>
                                        <div className="font-mono-tech text-xs opacity-70 mt-1">
                                            {p.character || "No character"}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right - Gallery Control */}
                    <div className="lg:col-span-2">
                        {selectedParticipant ? (
                            <>
                                {/* Current Image Preview */}
                                <div className="bg-dark-panel border border-spy-red/30 p-6 hud-corners mb-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="font-orbitron text-lg font-bold text-white tracking-wider uppercase">
                                            Current Image {galleryImages.length > 0 && `(${currentIndex + 1}/${galleryImages.length})`}
                                        </h2>
                                        <div className="font-mono-tech text-xs text-spy-red">
                                            SYNCED WITH DISPLAY: {eventState?.displayMode === 'gallery' ? 'YES' : 'NO'}
                                        </div>
                                    </div>

                                    {galleryImages.length > 0 ? (
                                        <div className="border-2 border-spy-red/20 rounded-lg overflow-hidden bg-black">
                                            <div className="relative">
                                                <img
                                                    src={
                                                        galleryImages[currentIndex].imagePath.startsWith('http')
                                                            ? galleryImages[currentIndex].imagePath
                                                            : `${SERVER_URL}/images_char/${galleryImages[currentIndex].imagePath}`
                                                    }
                                                    alt={`Gallery ${currentIndex + 1}`}
                                                    className="w-full h-96 object-contain"
                                                />
                                                <div className="absolute top-2 left-2 px-2 py-1 bg-black/80 border border-spy-red/30 font-mono-tech text-[10px] text-white">
                                                    #{galleryImages[currentIndex].orderNumber}
                                                </div>
                                            </div>
                                            {galleryImages[currentIndex].caption && (
                                                <div className="p-3 bg-black/60 border-t border-spy-red/20">
                                                    <p className="font-rajdhani text-white text-center">
                                                        {galleryImages[currentIndex].caption}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="border-2 border-dashed border-spy-red/20 rounded-lg p-12 text-center">
                                            <ImageIcon className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                                            <p className="font-mono-tech text-gray-600 text-sm">
                                                No gallery images for this character
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Controls */}
                                <div className="bg-dark-panel border border-spy-red/30 p-6 hud-corners mb-6">
                                    <h3 className="font-orbitron text-md font-bold text-white tracking-wider mb-4 uppercase">
                                        Navigation Controls
                                    </h3>
                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                        <button
                                            onClick={() => handleJumpTo(0)}
                                            disabled={galleryImages.length === 0}
                                            className="py-3 px-4 font-mono-tech text-xs border border-spy-red/30 text-spy-red hover:bg-spy-red/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            <SkipBack size={16} /> FIRST
                                        </button>
                                        <button
                                            onClick={() => handleJumpTo(galleryImages.length - 1)}
                                            disabled={galleryImages.length === 0}
                                            className="py-3 px-4 font-mono-tech text-xs border border-spy-red/30 text-spy-red hover:bg-spy-red/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            LAST <SkipForward size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleNavigate('prev')}
                                            disabled={galleryImages.length === 0}
                                            className="py-4 px-4 font-orbitron font-bold text-sm border-2 border-spy-red bg-spy-red text-black hover:bg-transparent hover:text-spy-red transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            <ChevronLeft size={18} /> PREVIOUS
                                        </button>
                                        <button
                                            onClick={() => handleNavigate('next')}
                                            disabled={galleryImages.length === 0}
                                            className="py-4 px-4 font-orbitron font-bold text-sm border-2 border-spy-red bg-spy-red text-black hover:bg-transparent hover:text-spy-red transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            NEXT <ChevronRight size={18} />
                                        </button>
                                    </div>

                                    {/* Auto Play */}
                                    <button
                                        onClick={() => setAutoPlay(!autoPlay)}
                                        disabled={galleryImages.length === 0}
                                        className={`w-full py-3 px-4 font-mono-tech text-xs border transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${autoPlay
                                            ? "border-spy-yellow bg-spy-yellow text-black"
                                            : "border-spy-yellow/30 text-spy-yellow hover:bg-spy-yellow/10"
                                            }`}
                                    >
                                        {autoPlay ? <Pause size={16} /> : <Play size={16} />}
                                        {autoPlay ? "STOP AUTO-PLAY" : "START AUTO-PLAY (3s)"}
                                    </button>
                                </div>

                                {/* Thumbnail Grid */}
                                <div className="bg-dark-panel border border-spy-red/30 p-6 hud-corners">
                                    <h3 className="font-orbitron text-md font-bold text-white tracking-wider mb-4 uppercase">
                                        Gallery Thumbnails
                                    </h3>
                                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                                        {galleryImages.map((img, idx) => (
                                            <button
                                                key={img._id}
                                                onClick={() => handleJumpTo(idx)}
                                                className={`aspect-square border-2 rounded overflow-hidden transition-all ${idx === currentIndex
                                                    ? "border-spy-red shadow-neon-red scale-105 z-10"
                                                    : "border-spy-red/20 hover:border-spy-red/50 grayscale hover:grayscale-0"
                                                    }`}
                                            >
                                                <img
                                                    src={
                                                        img.imagePath.startsWith('http')
                                                            ? img.imagePath
                                                            : `${SERVER_URL}/images_char/${img.imagePath}`
                                                    }
                                                    alt={`Thumb ${idx + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                    {galleryImages.length === 0 && (
                                        <div className="text-center py-8">
                                            <p className="font-mono-tech text-gray-600 text-xs">
                                                No images to display
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="bg-dark-panel border border-spy-red/30 p-12 hud-corners text-center">
                                <ImageIcon className="w-20 h-20 text-gray-700 mx-auto mb-4" />
                                <p className="font-orbitron text-xl text-gray-600 mb-2">
                                    SELECT A CHARACTER
                                </p>
                                <p className="font-mono-tech text-xs text-gray-700">
                                    Choose from the list to control their gallery
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default GalleryController;
