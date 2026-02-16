const mongoose = require('mongoose');

const EventStateSchema = new mongoose.Schema({
    currentParticipantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Participant', default: null },
    isVotingOpen: { type: Boolean, default: false },
    displayMode: {
        type: String,
        enum: ['waiting', 'voting_open', 'result', 'qr'],
        default: 'waiting'
    },
    qrCodeUrl: { type: String, default: null },

    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('EventState', EventStateSchema);
