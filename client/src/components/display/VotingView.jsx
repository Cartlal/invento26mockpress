export default function VotingView({ participant }) {
    return (
        <div className="flex flex-col items-center justify-center gap-8 w-full h-full"
            style={{ fontFamily: "Inter, sans-serif" }}>
            <div className="text-center">
                <p className="text-[10px] font-bold tracking-[0.5em] text-white/25 uppercase mb-4">Now Voting</p>
                <h2 className="text-6xl font-black text-white uppercase tracking-tight leading-none">
                    {participant?.name?.split(" ")[0] || "—"}
                </h2>
                {participant?.name?.split(" ")?.length > 1 && (
                    <h2 className="text-6xl font-black text-[#C0392B] uppercase tracking-tight leading-none">
                        {participant.name.split(" ").slice(1).join(" ")}
                    </h2>
                )}
            </div>
            <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[#C0392B]"
                    style={{ animation: "sp-blink 1.2s ease-in-out infinite" }} />
                <span className="text-[11px] font-bold tracking-[0.45em] text-[#C0392B] uppercase">
                    Accepting Votes
                </span>
            </div>
        </div>
    );
}