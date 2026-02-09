import { useState, useEffect } from "react";
import axios from "axios";
import { socket } from "../socket";
import QRView from "../components/display/QRView";
import { apiUrl as API_URL } from "../config";

function QRCodePage() {
    const [eventState, setEventState] = useState(null);

    const fetchState = async () => {
        try {
            const res = await axios.get(`${API_URL}/admin/state`);
            setEventState(res.data);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchState();
        socket.on("stateUpdate", (newState) => {
            setEventState(newState);
        });
        return () => socket.off("stateUpdate");
    }, []);

    if (!eventState) return null;

    return (
        <div className="h-screen w-screen bg-black flex items-center justify-center relative overflow-hidden font-rajdhani">
            {/* Background Layers */}
            <div className="absolute inset-0 bg-cover bg-center opacity-10" style={{ backgroundImage: "url('/assets/Invento-bg.webp')" }}></div>
            <div className="absolute inset-0 spy-grid-bg opacity-20"></div>
            <div className="scanlines"></div>

            {/* No Header Bar or Ticker here as requested - cleaner look */}
            <QRView qrCodeUrl={eventState.qrCodeUrl} />
        </div>
    );
}

export default QRCodePage;
