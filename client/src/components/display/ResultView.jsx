import { useState, useEffect, useRef } from "react";

export default function ResultView({ participant }) {
    const finalScore = participant?.finalScore || 0;
    const total = participant?.totalVotes || 0;
    const words = participant?.name?.split(" ") || ["AGENT"];
    const firstName = words[0];
    const restName = words.slice(1).join(" ");

    const [displayScore, setDisplayScore] = useState(0);
    const rafRef = useRef(null);

    useEffect(() => {
        // Reset and animate whenever the participant/score changes
        setDisplayScore(0);
        if (!finalScore) return;

        const duration = 5000; // ms
        const start = performance.now();

        const animate = (now) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplayScore(eased * finalScore);

            if (progress < 1) {
                rafRef.current = requestAnimationFrame(animate);
            } else {
                setDisplayScore(finalScore);
            }
        };

        rafRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(rafRef.current);
    }, [finalScore, participant?._id]);

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

            {/* Right: Score (animated) */}
            <div className="flex-1 flex flex-col items-center justify-center">
                <div className="flex items-baseline gap-3">
                    <span className="font-black text-white leading-none"
                        style={{ fontSize: "11rem", lineHeight: 0.85 }}>
                        {displayScore.toFixed(1)}
                    </span>
                    <span className="text-4xl font-black text-white/20">/10</span>
                </div>
            </div>

        </div>
    );
}
