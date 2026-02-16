import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
    Upload,
    User,
    Briefcase,
    Users,
    Plus,
    Edit,
    Trash2,
    Save,
    X,
    TrendingUp,
    Calendar
} from "lucide-react";

import { apiUrl as API_URL } from "../config";

function AddParticipant() {
    // Form State
    const [name, setName] = useState("");
    const [character, setCharacter] = useState("");
    const [code, setCode] = useState("");
    const [photo, setPhoto] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);



    // Participants List
    const [participants, setParticipants] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});

    useEffect(() => {
        fetchParticipants();
    }, []);

    const fetchParticipants = async () => {
        try {
            const res = await axios.get(`${API_URL}/admin/participants`);
            setParticipants(res.data);
        } catch (err) {
            console.error(err);
        }
    };

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
            formData.append("orderNumber", participants.length + 1);

            if (photo) {
                formData.append("photo", photo);
            }

            const res = await axios.post(`${API_URL}/admin/participant`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            const newParticipantId = res.data._id;



            toast.success(`Participant Added!`);

            // Reset form
            setName("");
            setCharacter("");
            setCode("");
            setPhoto(null);
            setPreview(null);


            // Refresh list
            fetchParticipants();
        } catch (err) {
            toast.error(err.response?.data?.error || "Failed to add participant");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this participant?")) return;

        try {
            await axios.delete(`${API_URL}/admin/participant/${id}`);
            toast.success("Participant Deleted");
            fetchParticipants();
        } catch (err) {
            toast.error("Failed to delete participant");
        }
    };

    const startEdit = (participant) => {
        setEditingId(participant._id);
        setEditForm({
            name: participant.name,
            character: participant.character || "",
            code: participant.code || ""
        });
    };

    const saveEdit = async () => {
        try {
            await axios.put(`${API_URL}/admin/participant/${editingId}`, editForm);
            toast.success("Participant Updated");
            setEditingId(null);
            fetchParticipants();
        } catch (err) {
            toast.error("Failed to update participant");
        }
    };



    const stats = {
        total: participants.length,
        recent: participants.filter(p => {
            const createdDate = new Date(p.createdAt);
            const today = new Date();
            const diffTime = Math.abs(today - createdDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays <= 7;
        }).length
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">
                                Participant Management Dashboard
                            </h1>
                            <p className="text-sm text-gray-600 mt-1">
                                Add and manage participants for INVENTO 2026
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Total Participants</p>
                                <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
                            </div>
                            <Users className="w-12 h-12 text-blue-500 opacity-20" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Added This Week</p>
                                <p className="text-3xl font-bold text-gray-800">{stats.recent}</p>
                            </div>
                            <TrendingUp className="w-12 h-12 text-green-500 opacity-20" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Last Updated</p>
                                <p className="text-lg font-semibold text-gray-800">
                                    {participants.length > 0
                                        ? new Date(participants[participants.length - 1]?.createdAt).toLocaleDateString()
                                        : "N/A"
                                    }
                                </p>
                            </div>
                            <Calendar className="w-12 h-12 text-purple-500 opacity-20" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Add Participant Form */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Plus className="w-5 h-5 text-blue-600" />
                                <h2 className="text-xl font-bold text-gray-800">
                                    Add New Participant
                                </h2>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Photo Upload */}
                                <div className="text-center">
                                    <div className="w-32 h-32 mx-auto mb-3 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
                                        {preview ? (
                                            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <Upload className="w-10 h-10 text-gray-400" />
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handlePhotoChange}
                                        className="hidden"
                                        id="photo-upload"
                                    />
                                    <label
                                        htmlFor="photo-upload"
                                        className="inline-block px-4 py-2 bg-gray-100 text-gray-700 rounded-md cursor-pointer hover:bg-gray-200 text-sm font-medium"
                                    >
                                        Upload Photo
                                    </label>
                                    <p className="text-xs text-gray-500 mt-2">Max 10MB</p>
                                </div>

                                {/* Name */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                        <User size={14} />
                                        Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                        placeholder="Full name"
                                        required
                                    />
                                </div>

                                {/* Character */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                        <Briefcase size={14} />
                                        Character/Role
                                    </label>
                                    <input
                                        type="text"
                                        value={character}
                                        onChange={(e) => setCharacter(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                        placeholder="e.g., James Bond"
                                    />
                                </div>

                                {/* Code */}
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                                        Code (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                        placeholder="e.g., P1"
                                    />
                                </div>



                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full py-2.5 rounded-md font-semibold text-white transition-colors ${loading
                                        ? "bg-gray-400 cursor-not-allowed"
                                        : "bg-blue-600 hover:bg-blue-700"
                                        }`}
                                >
                                    {loading ? "Adding..." : "Add Participant"}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Participants List */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-md overflow-hidden">
                            <div className="px-6 py-4 border-b bg-gray-50">
                                <h2 className="text-lg font-bold text-gray-800">
                                    All Participants ({participants.length})
                                </h2>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Photo</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Character</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {participants.map((p) => (
                                            <tr key={p._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 text-sm text-gray-900">
                                                    {p.orderNumber}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                                                        {p.photoUrl ? (
                                                            <img src={p.photoUrl} alt={p.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <User className="w-6 h-6 text-gray-400" />
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {editingId === p._id ? (
                                                        <input
                                                            type="text"
                                                            value={editForm.name}
                                                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                                            className="px-2 py-1 border rounded w-full"
                                                        />
                                                    ) : (
                                                        <div className="text-sm font-medium text-gray-900">{p.name}</div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {editingId === p._id ? (
                                                        <input
                                                            type="text"
                                                            value={editForm.character}
                                                            onChange={(e) => setEditForm({ ...editForm, character: e.target.value })}
                                                            className="px-2 py-1 border rounded w-full"
                                                        />
                                                    ) : (
                                                        <div className="text-sm text-gray-600">{p.character || "-"}</div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {editingId === p._id ? (
                                                        <input
                                                            type="text"
                                                            value={editForm.code}
                                                            onChange={(e) => setEditForm({ ...editForm, code: e.target.value })}
                                                            className="px-2 py-1 border rounded w-full"
                                                        />
                                                    ) : (
                                                        p.code || `P-${p.orderNumber}`
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {editingId === p._id ? (
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={saveEdit}
                                                                className="text-green-600 hover:text-green-800"
                                                            >
                                                                <Save size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => setEditingId(null)}
                                                                className="text-gray-600 hover:text-gray-800"
                                                            >
                                                                <X size={18} />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => startEdit(p)}
                                                                className="text-blue-600 hover:text-blue-800"
                                                            >
                                                                <Edit size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(p._id)}
                                                                className="text-red-600 hover:text-red-800"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {participants.length === 0 && (
                                <div className="text-center py-12">
                                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500">No participants added yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AddParticipant;
