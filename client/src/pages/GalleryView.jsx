import { useState, useEffect } from "react";
import axios from "axios";
import { Users, Trophy, Star } from "lucide-react";

import { apiUrl as API_URL } from "../config";

function GalleryView() {
    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchParticipants();
    }, []);

    const fetchParticipants = async () => {
        try {
            const res = await axios.get(`${API_URL}/admin/participants`);
            setParticipants(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading Gallery...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-lg shadow-md p-8 mb-6">
                    <div className="flex items-center gap-3 mb-2">
                        <Trophy className="w-8 h-8 text-blue-600" />
                        <h1 className="text-3xl font-bold text-gray-800">
                            Participant Gallery
                        </h1>
                    </div>
                    <p className="text-gray-600">
                        View all registered participants for INVENTO 2026
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {participants.map((participant, idx) => (
                        <div
                            key={participant._id}
                            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
                        >
                            <div className="aspect-square bg-gray-200 flex items-center justify-center overflow-hidden">
                                {participant.photoUrl ? (
                                    <img
                                        src={participant.photoUrl}
                                        alt={participant.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <Users className="w-20 h-20 text-gray-400" />
                                )}
                            </div>
                            <div className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-semibold text-blue-600">
                                        #{participant.orderNumber}
                                    </span>
                                    {idx < 3 && (
                                        <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                                    )}
                                </div>
                                <h3 className="text-lg font-bold text-gray-800 mb-1">
                                    {participant.name}
                                </h3>
                                {participant.character && (
                                    <p className="text-sm text-gray-600 mb-2">
                                        {participant.character}
                                    </p>
                                )}
                                <p className="text-xs text-gray-500">
                                    Code: {participant.code || `P-${participant.orderNumber}`}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {participants.length === 0 && (
                    <div className="bg-white rounded-lg shadow-md p-12 text-center">
                        <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">
                            No Participants Yet
                        </h3>
                        <p className="text-gray-600">
                            Participants will appear here once they are added.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default GalleryView;
