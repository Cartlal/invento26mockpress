const mongoose = require('mongoose');

const VoteSchema = new mongoose.Schema({
    participantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Participant', required: true },
    score: { type: Number, required: true, min: 1, max: 10 },
    ipAddress: { type: String },
    deviceHash: { type: String }, // Browser fingerprint
    timestamp: { type: Date, default: Date.now }
});

// Prevent duplicate votes per participant/device combo if needed
// VoteSchema.index({ participantId: 1, deviceHash: 1 }, { unique: true });

module.exports = mongoose.model('Vote', VoteSchema);
