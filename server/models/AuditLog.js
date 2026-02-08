const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
    action: { type: String, required: true },
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    details: { type: Object },
    timestamp: { type: Date, default: Date.now },
    ip: { type: String }
});

module.exports = mongoose.model('AuditLog', AuditLogSchema);
