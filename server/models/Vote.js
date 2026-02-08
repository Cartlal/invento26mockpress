const mongoose = require('mongoose');

const VoteSchema = new mongoose.Schema({
    participantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Participant', required: true },
    score: { type: Number, required: true, min: 1, max: 10 },
    voterName: { type: String, required: true }, // Name of the judge/voter
    voterPhone: { type: String }, // Phone number
    ipAddress: { type: String },
    deviceHash: { type: String }, // Browser fingerprint
    timestamp: { type: Date, default: Date.now }
});

// Indexing for performance and double-vote prevention
VoteSchema.index({ participantId: 1, deviceHash: 1 });
VoteSchema.index({ participantId: 1, voterName: 1 });
VoteSchema.index({ participantId: 1, ipAddress: 1 });

module.exports = mongoose.model('Vote', VoteSchema);
