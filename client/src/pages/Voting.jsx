import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { socket } from "../socket";
import axios from "axios";
import { toast } from "react-hot-toast";
import { apiUrl as API_URL } from "../config";
import "../index1.css";

function Voting() {
    const [eventState, setEventState] = useState(null);
    const [participant, setParticipant] = useState(null);
    const [hasVoted, setHasVoted] = useState(false);
    const [voteSubmitting, setVoteSubmitting] = useState(false);
    const [selectedScore, setSelectedScore] = useState(7);
    const [voterName, setVoterName] = useState("");
    const [voterPhone, setVoterPhone] = useState("");

    useEffect(() => {
        document.body.classList.add("sp-theme");
        return () => document.body.classList.remove("sp-theme");
    }, []);

    const fetchState = async () => {
        try {
            const res = await axios.get(`${API_URL}/admin/state`);
            setEventState(res.data);
            if (res.data.currentParticipantId) {
                setParticipant(res.data.currentParticipantId);
            }
        } catch (err) {
            console.error("Error fetching state:", err);
        }
    };

    useEffect(() => {
        fetchState();
        socket.on("stateUpdate", (newState) => {
            setEventState(newState);
            // Use functional update to compare against latest participant without a stale closure
            setParticipant(prev => {
                const newId = newState.currentParticipantId?._id;
                if (newId && newId !== prev?._id) {
                    setHasVoted(false);
                    setSelectedScore(7);
                    return newState.currentParticipantId;
                }
                return prev;
            });
        });
        return () => { socket.off("stateUpdate"); };
    }, []); // Register socket listener only once

    useEffect(() => { document.title = "Invento 2026 — Vote"; }, []);

    useEffect(() => {
        const checkVotingStatus = async () => {
            if (participant?._id) {
                const deviceHash = localStorage.getItem("deviceHash") || Math.random().toString(36).substring(7);
                localStorage.setItem("deviceHash", deviceHash);
                try {
                    const res = await axios.get(`${API_URL}/vote/check/${participant._id}/${deviceHash}`);
                    if (res.data.voted) setHasVoted(true);
                } catch (err) { console.error("Status check failed:", err); }
            }
        };
        checkVotingStatus();
    }, [participant]);

    const handleVote = async () => {
        if (voteSubmitting) return;
        setVoteSubmitting(true);
        const deviceHash = localStorage.getItem("deviceHash") || Math.random().toString(36).substring(7);
        localStorage.setItem("deviceHash", deviceHash);
        try {
            await axios.post(`${API_URL}/vote`, {
                participantId: participant._id,
                score: selectedScore,
                deviceHash,
                voterName,
                voterPhone,
            });
            setHasVoted(true);
            toast.success(`Score ${selectedScore}/10 filed`, {
                style: { background: "#0D0D0D", color: "#fff", border: "1px solid rgba(255,255,255,0.1)", fontFamily: "Inter", fontSize: "13px" },
            });
        } catch (err) {
            toast.error(err.response?.data?.error || "Transmission failed", {
                style: { background: "#C0392B", color: "#fff", fontFamily: "Inter", fontSize: "13px" },
            });
        } finally {
            setVoteSubmitting(false);
        }
    };

    // ── Shared layout wrapper ─────────────────────────────
    const Shell = ({ children }) => (
        <div className="min-h-screen bg-black flex flex-col" style={{ fontFamily: "Inter, sans-serif" }}>
            {/* Red top rule */}
            <div className="h-px w-full bg-[#C0392B] flex-shrink-0" />
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07]">
                <img src="/assets/Invento-logo.png" alt="INVENTO" className="h-7 opacity-90" />
                <span className="text-[9px] font-bold tracking-[0.4em] text-white/20 uppercase">
                    Invento 2026
                </span>
            </div>
            {children}
        </div>
    );

    // ── Loading ───────────────────────────────────────────
    if (!eventState) {
        return (
            <Shell>
                <div className="flex-1 flex flex-col items-center justify-center gap-4">
                    <div className="w-6 h-6 border border-white/20 border-t-[#C0392B] rounded-full animate-spin" />
                    <p className="text-[10px] tracking-[0.4em] text-white/20 uppercase">Connecting...</p>
                </div>
                <MeetDevsBtn />
            </Shell>
        );
    }

    // ── Voting Closed ─────────────────────────────────────
    if (!eventState.isVotingOpen) {
        return (
            <Shell>
                <div className="flex-1 flex flex-col items-center justify-center px-6">
                    <div className="w-full max-w-sm">
                        <p className="text-[9px] tracking-[0.4em] text-white/25 uppercase mb-3">Status</p>
                        <h2 className="text-4xl font-black text-white uppercase tracking-tight leading-none mb-2">
                            {participant ? "Voting" : "No Target"}
                        </h2>
                        <h2 className="text-4xl font-black text-[#C0392B] uppercase tracking-tight leading-none mb-8">
                            {participant ? "Closed" : "Active"}
                        </h2>
                        <div className="h-px w-full bg-white/[0.06] mb-6" />
                        <p className="text-[10px] tracking-[0.35em] text-white/20 uppercase">
                            {participant ? "Awaiting next session" : "Waiting for organizers"}
                        </p>
                    </div>
                </div>
                <MeetDevsBtn />
            </Shell>
        );
    }

    // ── Voting Active ─────────────────────────────────────
    return (
        <Shell>
            <div className="flex-1 flex flex-col justify-center px-6 py-8 max-w-sm mx-auto w-full">

                {/* Target info */}
                <div className="mb-8">
                    <p className="text-[9px] tracking-[0.4em] text-white/25 uppercase mb-3">Target</p>
                    <h2 className="text-5xl font-black text-white uppercase tracking-tight leading-none">
                        {participant ? participant.name.split(" ")[0] : "AGENT"}
                    </h2>
                    {participant?.name.split(" ").length > 1 && (
                        <h2 className="text-5xl font-black text-[#C0392B] uppercase tracking-tight leading-none">
                            {participant.name.split(" ").slice(1).join(" ")}
                        </h2>
                    )}

                    <div className="flex items-center gap-2 mt-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#C0392B] sp-blink" />
                        <span className="text-[9px] font-bold tracking-[0.35em] text-[#C0392B] uppercase">
                            Voting Active
                        </span>
                    </div>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3 mb-7">
                    <div className="h-px flex-1 bg-white/[0.07]" />
                    <span className="text-[9px] text-white/20 tracking-[0.3em] uppercase">Rate</span>
                    <div className="h-px flex-1 bg-white/[0.07]" />
                </div>

                {hasVoted ? (
                    /* Voted confirmation */
                    <div className="sp-fade-in">
                        <div className="text-[#C0392B] text-7xl font-black mb-3 leading-none">Submitted</div>
                        <p className="text-[10px] tracking-[0.35em] text-white/30 uppercase">Signal received</p>
                    </div>
                ) : (
                    <>
                        {/* Score grid */}
                        <div className="grid grid-cols-5 gap-1.5 mb-2">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                                <button
                                    key={n}
                                    onClick={() => setSelectedScore(n)}
                                    className={`h-11 text-sm font-bold transition-all duration-150
                    ${selectedScore === n
                                            ? "bg-[#C0392B] text-white"
                                            : selectedScore > n
                                                ? "bg-[#C0392B]/20 text-[#C0392B]/60"
                                                : "bg-white/[0.04] text-white/25 hover:bg-white/[0.08] hover:text-white/60"
                                        }`}>
                                    {n}
                                </button>
                            ))}
                        </div>
                        <div className="flex justify-between text-[8px] text-white/15 tracking-widest uppercase mb-7">
                            <span>Poor</span><span>Excellent</span>
                        </div>

                        {/* Selected score display */}
                        <div className="flex items-baseline gap-1 mb-8">
                            <span className="text-7xl font-black text-white leading-none">{selectedScore}</span>
                            <span className="text-white/20 text-xl mb-1">/10</span>
                        </div>

                        {/* Submit */}
                        <button
                            onClick={handleVote}
                            disabled={voteSubmitting}
                            className={`w-full py-4 text-xs font-bold tracking-[0.4em] uppercase transition-all duration-300
                border ${voteSubmitting
                                    ? "border-white/10 text-white/20 cursor-not-allowed"
                                    : "border-[#C0392B] text-[#C0392B] hover:bg-[#C0392B] hover:text-white"
                                }`}>
                            {voteSubmitting ? "SUBMITTING..." : "Submit"}
                        </button>
                    </>
                )}
            </div>
            <MeetDevsBtn />
        </Shell>
    );
}

function MeetDevsBtn() {
    return (
        <div className="flex justify-center pb-7 pt-4">
            <Link to="/developers"
                className="group relative inline-flex items-center justify-center px-8 py-3 bg-[#C0392B] text-white font-bold text-[10px] tracking-[0.3em] uppercase transition-all overflow-hidden"
                style={{ clipPath: "polygon(5% 0, 100% 0, 95% 100%, 0 100%)" }}>

                {/* Hover effect gradient */}
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300 ease-out" />

                {/* Button Content */}
                <span className="flex items-center gap-2 relative z-10">
                    <span className="text-white/70 font-mono tracking-widest leading-none mt-[1px]">&lt;&gt;</span>
                    MEET THE DEVELOPERS
                </span>
            </Link>
        </div>
    );
}

export default Voting;
