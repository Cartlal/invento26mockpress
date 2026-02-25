export default function StandbyView() {
    return (
        <div className="flex flex-col items-center justify-center gap-8 w-full h-full"
            style={{ fontFamily: "Inter, sans-serif" }}>
            <img src="/assets/Invento-logo.png" alt="INVENTO" className="h-56 opacity-80" />

            <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[#C0392B]"
                    style={{ animation: "sp-blink 1.2s ease-in-out infinite" }} />
                <span className="text-[11px] font-bold tracking-[0.5em] text-white/30 uppercase">
                    Standby
                </span>
            </div>

            <div className="text-center">
                <img src="/assets/KLE-TECH.webp" alt="KLE Tech" className="h-8 mx-auto opacity-20" />
            </div>
        </div>
    );
}