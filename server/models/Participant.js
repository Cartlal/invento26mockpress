const mongoose = require('mongoose');

const ParticipantSchema = new mongoose.Schema({
    name: { type: String, required: true },
    photoUrl: { type: String }, // URL to image
    code: { type: String }, // Optional unique code (e.g. P1)
    orderNumber: { type: Number, required: true }, // Sequence
    status: {
        type: String,
        enum: ['waiting', 'active', 'completed'],
        default: 'waiting'
    },
    finalScore: { type: Number, default: 0 }, // Frozen score
    totalVotes: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Participant', ParticipantSchema);
