import { QrCode } from 'lucide-react';

function QRView({ qrCodeUrl }) {
    return (
        <div className="w-full max-w-4xl animate-in fade-in zoom-in duration-1000 flex flex-col items-center">
            {/* Header Area */}
            <div className="text-center mb-12">
                <div className="inline-flex items-center gap-3 px-6 py-2 bg-spy-green/10 border border-spy-green/40 rounded-full mb-6">
                    <QrCode className="w-5 h-5 text-spy-green" />
                    <span className="font-mono-tech text-sm text-spy-green tracking-[0.3em] uppercase font-bold">
                        VOTING_ACCESS_PROTOCOL
                    </span>
                </div>
                <h1 className="font-orbitron text-6xl font-black text-white tracking-wider mb-4">
                    SCAN TO <span className="text-spy-green">VOTE</span>
                </h1>
                <p className="font-mono-tech text-gray-500 tracking-[0.2em] text-sm uppercase">
                    Unauthorized access will be logged
                </p>
            </div>

            {/* QR Container */}
            <div className="relative group">
                {/* HUD Corners */}
                <div className="absolute -top-6 -left-6 w-16 h-16 border-t-4 border-l-4 border-spy-green"></div>
                <div className="absolute -top-6 -right-6 w-16 h-16 border-t-4 border-r-4 border-spy-green"></div>
                <div className="absolute -bottom-6 -left-6 w-16 h-16 border-b-4 border-l-4 border-spy-green"></div>
                <div className="absolute -bottom-6 -right-6 w-16 h-16 border-b-4 border-r-4 border-spy-green"></div>

                {/* The QR Image */}
                <div className="bg-white p-8 shadow-[0_0_50px_rgba(0,255,65,0.2)] relative">
                    {qrCodeUrl ? (
                        <img
                            src={qrCodeUrl}
                            alt="Voting QR Code"
                            className="w-[400px] h-[400px] object-contain"
                        />
                    ) : (
                        <div className="w-[400px] h-[400px] flex items-center justify-center bg-gray-100">
                            <QrCode className="w-32 h-32 text-gray-300" />
                        </div>
                    )}
                </div>
            </div>

            {/* Footer Text */}
            <div className="mt-16 text-center">
                <p className="font-mono-tech text-xl text-spy-green font-bold tracking-[0.5em] animate-pulse">
                    SYSTEM_READY_0x26
                </p>
            </div>
        </div>
    );
}

export default QRView;
