import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Upload, User, Briefcase } from "lucide-react";

import { apiUrl as API_URL } from "../config";

function GalleryManagement() {
    const [name, setName] = useState("");
    const [character, setCharacter] = useState("");
    const [code, setCode] = useState("");
    const [photo, setPhoto] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                toast.error("Image must be less than 10MB");
                return;
            }
            setPhoto(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("name", name);
            formData.append("character", character);
            formData.append("code", code);
            if (photo) {
                formData.append("photo", photo);
            }

            // Get current count for order number
            const participantsRes = await axios.get(`${API_URL}/admin/participants`);
            formData.append("orderNumber", participantsRes.data.length + 1);

            await axios.post(`${API_URL}/admin/participant`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            toast.success("Participant Added Successfully!");

            // Reset form
            setName("");
            setCharacter("");
            setCode("");
            setPhoto(null);
            setPreview(null);
        } catch (err) {
            toast.error(err.response?.data?.error || "Failed to add participant");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-lg shadow-md p-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        Add New Participant
                    </h1>
                    <p className="text-gray-600 mb-6">
                        Enter participant details and upload a photo
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Name */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <User size={16} />
                                Participant Name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                placeholder="Enter full name"
                                required
                            />
                        </div>

                        {/* Character/Role */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <Briefcase size={16} />
                                Character/Role
                            </label>
                            <input
                                type="text"
                                value={character}
                                onChange={(e) => setCharacter(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                placeholder="e.g., James Bond, Spy Agent"
                            />
                        </div>

                        {/* Code */}
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                                Participant Code (Optional)
                            </label>
                            <input
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                placeholder="e.g., P1, AGENT007"
                            />
                        </div>

                        {/* Photo Upload */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <Upload size={16} />
                                Upload Photo
                            </label>
                            <div className="flex items-start gap-4">
                                <div className="flex-1">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handlePhotoChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Max size: 10MB
                                    </p>
                                </div>
                                {preview && (
                                    <div className="w-24 h-24 border-2 border-gray-300 rounded-md overflow-hidden flex-shrink-0">
                                        <img
                                            src={preview}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3 px-4 rounded-md font-semibold text-white transition-colors ${loading
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-blue-600 hover:bg-blue-700"
                                }`}
                        >
                            {loading ? "Adding..." : "Add Participant"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default GalleryManagement;
