// Add these buttons after line 429 in DisplayControl.jsx
// Insert this code block after the closing </div> of the voting controls section

{/* Lock/Unlock and Display Buttons */ }
<div className="mt-3 grid grid-cols-2 gap-3">
    {/* Lock/Unlock Votes */}
    {voteLocked ? (
        <button
            onClick={handleUnlockVotes}
            className="py-3 font-orbitron font-bold text-sm tracking-widest flex items-center justify-center gap-2 border-2 bg-spy-yellow text-black border-spy-yellow hover:bg-transparent hover:text-spy-yellow transition-all"
        >
            <Unlock size={18} />
            UNLOCK VOTES
        </button>
    ) : (
        <button
            onClick={handleLockVotes}
            disabled={!previewParticipant}
            className={`py-3 font-orbitron font-bold text-sm tracking-widest flex items-center justify-center gap-2 border-2 transition-all ${!previewParticipant
                    ? 'bg-gray-700 border-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-spy-yellow text-black border-spy-yellow hover:bg-transparent hover:text-spy-yellow'
                }`}
        >
            <Lock size={18} />
            LOCK & SUBMIT
        </button>
    )}

    {/* Show Display Page */}
    <button
        onClick={() => window.open('/display', 'display-window', 'width=1920,height=1080')}
        className="py-3 font-orbitron font-bold text-sm tracking-widest flex items-center justify-center gap-2 border-2 bg-spy-blue text-black border-spy-blue hover:bg-transparent hover:text-spy-blue transition-all"
    >
        <Monitor size={18} />
        SHOW DISPLAY
    </button>
</div>
