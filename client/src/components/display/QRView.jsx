import { QrCode } from 'lucide-react';

function QRView({ qrCodeUrl }) {
    return (
        <div className="w-full max-w-6xl animate-in fade-in zoom-in duration-1000">
            <div className="flex items-center justify-center gap-20">
                {/* Left Side: QR Code Area (Replacing Logo) */}
                <div className="relative flex-shrink-0">
                    <div className="bg-white p-6 shadow-[0_0_40px_rgba(255,0,0,0.1)] relative z-10">
                        {qrCodeUrl ? (
                            <img
                                src={qrCodeUrl}
                                alt="Voting QR Code"
                                className="w-80 h-80 object-contain"
                            />
                        ) : (
                            <div className="w-80 h-80 flex items-center justify-center bg-gray-100">
                                <QrCode className="w-20 h-20 text-gray-300" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side: Mission Ident (Matching Standby) */}
                <div className="text-left flex-1 border-l-2 border-spy-red/20 pl-20 py-10">
                    <div className="space-y-4">
                        <h1 className="font-orbitron text-[100px] font-black text-white leading-none tracking-wider glitch">
                            INVENTO <span className="text-spy-red">2026</span>
                        </h1>
                        <div className="inline-block bg-spy-red px-10 py-4 transform -rotate-1 shadow-[10px_10px_0_rgba(0,0,0,0.5)]">
                            <p className="font-orbitron text-3xl font-bold text-black tracking-[0.3em]">
                                SCAN TO VOTE
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default QRView;
