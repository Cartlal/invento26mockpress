import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
    Image as ImageIcon,
    Upload,
    ChevronLeft,
    ChevronRight,
    Trash2,
    Link as LinkIcon
} from "lucide-react";

import { apiUrl as API_URL, serverUrl as SERVER_URL } from "../config";

function GalleryManager({ currentParticipant }) {
    const [galleryImages, setGalleryImages] = useState([]);
    const [imageUrl, setImageUrl] = useState("");
    const [caption, setCaption] = useState("");
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (currentParticipant) {
            fetchGalleryImages();
        }
    }, [currentParticipant]);

    const fetchGalleryImages = async () => {
        if (!currentParticipant) return;
        try {
            const res = await axios.get(`${API_URL}/gallery/participant/${currentParticipant._id}`);
            setGalleryImages(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("image", file);
        formData.append("participantId", currentParticipant._id);
        formData.append("caption", caption);

        setUploading(true);
        try {
            await axios.post(`${API_URL}/gallery/upload`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            toast.success("Image uploaded!");
            setCaption("");
            fetchGalleryImages();
        } catch (err) {
            toast.error("Upload failed");
        } finally {
            setUploading(false);
        }
    };

    const handleAddUrl = async () => {
        if (!imageUrl.trim()) {
            toast.error("Enter a URL");
            return;
        }

        try {
            await axios.post(`${API_URL}/gallery/add-url`, {
                participantId: currentParticipant._id,
                imageUrl,
                caption
            });
            toast.success("Image URL added!");
            setImageUrl("");
            setCaption("");
            fetchGalleryImages();
        } catch (err) {
            toast.error("Failed to add URL");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this image?")) return;
        try {
            await axios.delete(`${API_URL}/gallery/${id}`);
            toast.success("Image deleted");
            fetchGalleryImages();
        } catch (err) {
            toast.error("Delete failed");
        }
    };

    const handleNavigate = async (direction) => {
        try {
            await axios.post(`${API_URL}/gallery/navigate`, {
                participantId: currentParticipant._id,
                direction
            });
            toast.success(`Moved ${direction}`);
        } catch (err) {
            toast.error("Navigation failed");
        }
    };

    if (!currentParticipant) {
        return (
            <div className="bg-dark-panel border border-spy-red/30 p-6 hud-corners">
                <div className="text-center text-gray-500 py-12">
                    <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-20" />
                    <p className="font-mono-tech text-xs">Select a participant first</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-dark-panel border border-spy-red/30 p-6 hud-corners">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-spy-red" />
                    <h2 className="font-orbitron text-md font-bold text-white tracking-wider">
                        GALLERY CONTROL
                    </h2>
                </div>
                <span className="font-mono-tech text-[9px] text-gray-500 tracking-widest uppercase">
                    {currentParticipant.name}
                </span>
            </div>

            {/* Current Gallery Navigation */}
            <div className="mb-6 flex gap-2">
                <button
                    onClick={() => handleNavigate('prev')}
                    disabled={galleryImages.length === 0}
                    className="flex-1 py-2 font-mono-tech text-xs border border-spy-red/30 text-spy-red hover:bg-spy-red/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    <ChevronLeft size={14} /> PREVIOUS
                </button>
                <button
                    onClick={() => handleNavigate('next')}
                    disabled={galleryImages.length === 0}
                    className="flex-1 py-2 font-mono-tech text-xs border border-spy-red/30 text-spy-red hover:bg-spy-red/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    NEXT <ChevronRight size={14} />
                </button>
            </div>

            {/* Upload Image */}
            <div className="mb-4">
                <label className="block font-mono-tech text-[10px] text-gray-500 mb-2 uppercase tracking-widest">
                    Upload Image
                </label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="hidden"
                    id="gallery-upload"
                />
                <label
                    htmlFor="gallery-upload"
                    className={`block text-center py-2 font-orbitron font-bold text-[10px] tracking-wider border transition-all cursor-pointer ${uploading
                        ? "bg-gray-700 border-gray-700 text-gray-500 cursor-not-allowed"
                        : "bg-spy-red text-black border-spy-red hover:bg-transparent hover:text-spy-red"
                        }`}
                >
                    {uploading ? "UPLOADING..." : "<Upload size={14} /> UPLOAD IMAGE"}
                </label>
            </div>

            {/* Add URL */}
            <div className="mb-4">
                <label className="block font-mono-tech text-[10px] text-gray-500 mb-2 uppercase tracking-widest">
                    Or Add Image URL
                </label>
                <div className="flex gap-2">
                    <input
                        type="url"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://..."
                        className="flex-1 px-3 py-2 bg-black border border-spy-red/30 font-mono-tech text-white text-xs focus:border-spy-red outline-none"
                    />
                    <button
                        onClick={handleAddUrl}
                        className="px-4 py-2 font-orbitron font-bold text-[10px] tracking-wider border bg-spy-red text-black border-spy-red hover:bg-transparent hover:text-spy-red transition-all"
                    >
                        <LinkIcon size={14} />
                    </button>
                </div>
            </div>

            {/* Caption */}
            <div className="mb-4">
                <label className="block font-mono-tech text-[10px] text-gray-500 mb-2 uppercase tracking-widest">
                    Caption (Optional)
                </label>
                <input
                    type="text"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Add a caption..."
                    className="w-full px-3 py-2 bg-black border border-spy-red/30 font-rajdhani text-white text-sm focus:border-spy-red outline-none"
                />
            </div>

            {/* Gallery Images List */}
            <div>
                <p className="font-mono-tech text-[10px] text-gray-500 mb-2 uppercase tracking-widest">
                    Gallery ({galleryImages.length} images)
                </p>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                    {galleryImages.map((img, idx) => (
                        <div
                            key={img._id}
                            className="flex items-center gap-2 p-2 bg-black/40 border border-spy-red/20 hover:border-spy-red/50 transition-all"
                        >
                            <div className="w-12 h-12 flex-shrink-0 bg-gray-800 rounded overflow-hidden">
                                <img
                                    src={img.imagePath.startsWith('http') ? img.imagePath : `${SERVER_URL}/images_char/${img.imagePath}`}
                                    alt={`Gallery ${idx + 1}`}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-mono-tech text-[10px] text-white truncate">
                                    {img.caption || `Image ${idx + 1}`}
                                </p>
                                <p className="font-mono-tech text-[8px] text-gray-600">
                                    #{img.orderNumber}
                                </p>
                            </div>
                            <button
                                onClick={() => handleDelete(img._id)}
                                className="text-spy-red hover:text-red-500 transition-colors"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                    {galleryImages.length === 0 && (
                        <div className="text-center py-8 text-gray-600">
                            <p className="font-mono-tech text-[10px]">No images yet</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default GalleryManager;
