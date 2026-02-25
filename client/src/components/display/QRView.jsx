export default function QRView({ qrCodeUrl }) {
    return (
        <div className="flex items-center justify-center gap-16 w-full h-full"
            style={{ fontFamily: "Inter, sans-serif" }}>

            {/* QR code */}
            <div className="bg-white p-5 shadow-2xl flex-shrink-0">
                {qrCodeUrl ? (
                    <img src={qrCodeUrl} alt="QR Code" className="w-100 h-100 object-contain" />
                ) : (
                    <div className="w-72 h-72 flex items-center justify-center bg-white">
                        <p className="text-[10px] text-black/30 tracking-widest uppercase">No QR Loaded</p>
                    </div>
                )}
            </div>

            {/* Right: text + status */}
            <div className="flex flex-col gap-6">
                <div>
                    <p className="text-[18px] font-bold tracking-[0.6em] text-white/30 uppercase mb-4">Scan to Vote</p>
                    <h2 className="text-8xl font-black text-white uppercase tracking-tight leading-none">
                        Mock Press 
                    </h2>
                    <h2 className="text-7xl font-black text-[#C0392B] uppercase tracking-tight leading-none">
                        Audience Voting
                    </h2>
                </div>

                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#C0392B]"
                        style={{ animation: "sp-blink 1.2s ease-in-out infinite" }} />
                    <span className="text-[10px] font-bold tracking-[0.4em] text-[#C0392B] uppercase">
                        Voting Open
                    </span>
                </div>
            </div>
        </div>
    );
}
