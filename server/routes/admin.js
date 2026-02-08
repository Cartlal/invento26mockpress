const express = require('express');
const router = express.Router();
const Participant = require('../models/Participant');
const EventState = require('../models/EventState');
const AuditLog = require('../models/AuditLog');
const Vote = require('../models/Vote');

// --- PARTICIPANT MANAGEMENT ---

// Get all participants
router.get('/participants', async (req, res) => {
    try {
        const participants = await Participant.find().sort({ orderNumber: 1 });
        res.json(participants);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add new participant
router.post('/participant', async (req, res) => {
    try {
        const { name, photoUrl, orderNumber, code } = req.body;
        const newParticipant = new Participant({ name, photoUrl, orderNumber, code });
        await newParticipant.save();

        await AuditLog.create({
            action: 'PARTICIPANT_ADDED',
            details: { name, orderNumber, code },
            ip: req.ip
        });

        res.status(201).json(newParticipant);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Update participant status/score (manual override if needed)
router.put('/participant/:id', async (req, res) => {
    try {
        const updated = await Participant.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete participant
router.delete('/participant/:id', async (req, res) => {
    try {
        const p = await Participant.findByIdAndDelete(req.params.id);

        await AuditLog.create({
            action: 'PARTICIPANT_DELETED',
            details: { id: req.params.id, name: p?.name },
            ip: req.ip
        });

        res.json({ message: 'Participant deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get votes for a specific participant
router.get('/votes/:participantId', async (req, res) => {
    try {
        const votes = await Vote.find({ participantId: req.params.participantId });
        res.json(votes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- ANALYTICS & LOGGING ---

// Get Score Distribution (For Admin Dashboard)
router.get('/analytics/distribution', async (req, res) => {
    try {
        // Aggregate votes by score
        const distribution = await Vote.aggregate([
            {
                $group: {
                    _id: "$score",
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Format for Recharts (ensure 1-10 all present)
        const formatted = Array.from({ length: 10 }, (_, i) => ({
            score: i + 1,
            count: 0
        }));

        distribution.forEach(d => {
            if (d._id >= 1 && d._id <= 10) {
                formatted[d._id - 1].count = d.count;
            }
        });

        res.json(formatted);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Audit Logs
router.get('/logs', async (req, res) => {
    try {
        const logs = await AuditLog.find().sort({ timestamp: -1 }).limit(100);
        res.json(logs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create Log Entry
router.post('/log', async (req, res) => {
    try {
        const { action, details, adminId } = req.body;
        const newLog = new AuditLog({
            action,
            details,
            adminId,
            ip: req.ip
        });
        await newLog.save();
        res.status(201).json(newLog);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// --- LIVE DASHBOARD STATS ---

// Get Overview Stats
router.get('/stats', async (req, res) => {
    try {
        const participantCount = await Participant.countDocuments();
        const voteCount = await Vote.countDocuments();
        const uniqueVoters = await Vote.distinct('voterPhone');

        // Live Socket Users
        const io = req.app.get('io');
        const liveUsers = io ? io.engine.clientsCount : 0;

        res.json({
            participantCount,
            totalVotes: voteCount,
            uniqueVoterCount: uniqueVoters.length,
            liveUsers
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Unique Voters List
router.get('/voters', async (req, res) => {
    try {
        const voters = await Vote.aggregate([
            {
                $group: {
                    _id: "$voterPhone",
                    name: { $first: "$voterName" },
                    totalVotes: { $sum: 1 },
                    lastActive: { $max: "$timestamp" }
                }
            },
            { $sort: { lastActive: -1 } }
        ]);
        res.json(voters);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Specific Voter History
router.get('/voter-history/:phone', async (req, res) => {
    try {
        const history = await Vote.find({ voterPhone: req.params.phone })
            .populate('participantId', 'name code')
            .sort({ timestamp: -1 });
        res.json(history);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// --- EVENT CONTROL ---

// Get current event state
router.get('/state', async (req, res) => {
    try {
        let state = await EventState.findOne();
        if (!state) {
            state = new EventState();
            await state.save();
        }
        res.json(state);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update event state (Open/Close Voting, Change Mode, Change Active Participant)
router.post('/state', async (req, res) => {
    try {
        const { currentParticipantId, isVotingOpen, displayMode } = req.body;

        let state = await EventState.findOne();
        if (!state) state = new EventState();

        if (currentParticipantId !== undefined) state.currentParticipantId = currentParticipantId;
        if (isVotingOpen !== undefined) state.isVotingOpen = isVotingOpen;
        if (displayMode !== undefined) state.displayMode = displayMode;

        await state.save();

        await AuditLog.create({
            action: 'STATE_UPDATE',
            details: { isVotingOpen, currentParticipantId, displayMode },
            ip: req.ip
        });

        // Emit socket event for real-time updates
        const io = req.app.get('io');
        io.emit('stateUpdate', state);

        res.json(state);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
