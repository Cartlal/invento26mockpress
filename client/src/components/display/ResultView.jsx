export default function ResultView({ participant }) {
    const score = participant?.finalScore || 0;
    const total = participant?.totalVotes || 0;
    const words = participant?.name?.split(" ") || ["AGENT"];
    const firstName = words[0];
    const restName = words.slice(1).join(" ");

    return (
        <div className="flex items-center justify-center w-full h-full px-20 gap-16"
            style={{ fontFamily: "Inter, sans-serif" }}>

            {/* Left: Name + label */}
            <div className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="flex-1 flex flex-col justify-center text-left">

                <p className="text-[10px] font-bold tracking-[0.6em] text-white/25 uppercase mb-6">
                    Final Score
                </p>
                <h2 className="text-8xl font-black text-white uppercase tracking-tight leading-none">
                    {firstName}
                </h2>
                {restName && (
                    <h2 className="text-8xl font-black text-[#C0392B] uppercase tracking-tight leading-none">
                        {restName}
                    </h2>
                )}
                {total > 0 && (
                    <p className="text-[10px] font-bold tracking-[0.5em] text-white/20 uppercase mt-8">
                        {total} votes cast
                    </p>
                )}
                <div className="w-16 h-1 bg-[#C0392B] mt-4" />
                </div>
            </div>

            {/* Vertical divider */}
            <div className="w-px h-48 bg-white/[0.08]" />

            {/* Right: Score */}
            <div className="flex-1 flex flex-col items-center justify-center">
                <div className="flex items-baseline gap-3">
                    <span className="font-black text-white leading-none"
                        style={{ fontSize: "11rem", lineHeight: 0.85 }}>
                        {typeof score === "number" ? score.toFixed(1) : "0.0"}
                    </span>
                    <span className="text-4xl font-black text-white/20">/10</span>
                </div>
            </div>

        </div>
    );
}