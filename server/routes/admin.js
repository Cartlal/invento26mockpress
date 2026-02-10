const express = require('express');
const router = express.Router();
const Participant = require('../models/Participant');
const EventState = require('../models/EventState');
const AuditLog = require('../models/AuditLog');
const Vote = require('../models/Vote');
const redisClient = require('../config/redis');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// --- MULTER CONFIG ---
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// --- PARTICIPANT MANAGEMENT ---

// Get all participants (with Redis cache)
router.get('/participants', async (req, res) => {
    try {
        // Check Redis cache first
        const cached = await redisClient.get('participants');
        if (cached) {
            return res.json(JSON.parse(cached));
        }

        // If not cached, query DB and cache
        const participants = await Participant.find().sort({ orderNumber: 1 });
        await redisClient.set('participants', JSON.stringify(participants), {
            EX: 300 // 5 minutes
        });
        res.json(participants);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add new participant
router.post('/participant', upload.single('photo'), async (req, res) => {
    try {
        const { name, character, orderNumber, code } = req.body;
        let photoUrl = '';

        if (req.file) {
            photoUrl = `/uploads/${req.file.filename}`;
        } else if (req.body.photoUrl) {
            photoUrl = req.body.photoUrl;
        }

        const newParticipant = new Participant({ name, character, photoUrl, orderNumber, code });
        await newParticipant.save();

        await AuditLog.create({
            action: 'PARTICIPANT_ADDED',
            details: { name, character, orderNumber, code },
            ip: req.ip
        });

        // Cache all participants in Redis for fast access
        const allParticipants = await Participant.find().sort({ orderNumber: 1 });
        await redisClient.set('participants', JSON.stringify(allParticipants), {
            EX: 300 // 5 minutes expiry
        });

        res.status(201).json(newParticipant);
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message });
    }
});

// Image Upload Route (Standalone)
router.post('/upload', upload.single('photo'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    const photoUrl = `/uploads/${req.file.filename}`;
    res.json({ photoUrl });
});

// Update participant status/score (manual override if needed)
router.put('/participant/:id', async (req, res) => {
    try {
        const updated = await Participant.findByIdAndUpdate(req.params.id, req.body, { new: true });

        // Invalidate Cache
        await redisClient.del('participants');
        await redisClient.del('leaderboard');

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

        // Invalidate Cache
        await redisClient.del('participants');
        await redisClient.del('leaderboard');

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
        const uniqueVoters = await Vote.distinct('ipAddress');

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
                    _id: "$ipAddress",
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
router.get('/voter-history/:ip', async (req, res) => {
    try {
        const history = await Vote.find({ ipAddress: req.params.ip })
            .populate('participantId', 'name code')
            .sort({ timestamp: -1 });
        res.json(history);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- USER MANAGEMENT ---

// Get all users (Cached)
router.get('/users', async (req, res) => {
    try {
        const cached = await redisClient.get('admins');
        if (cached) return res.json(JSON.parse(cached));

        const admins = await require('../models/Admin').find().select('-password');
        await redisClient.set('admins', JSON.stringify(admins), { EX: 600 }); // 10 mins
        res.json(admins);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// --- EVENT CONTROL ---

// Get current event state
// Get current event state (Cached)
router.get('/state', async (req, res) => {
    try {
        // Check Redis Cache
        const cachedState = await redisClient.get('eventState');
        if (cachedState) {
            return res.json(JSON.parse(cachedState));
        }

        let state = await EventState.findOne()
            .populate('currentParticipantId')
            .populate('currentGalleryImageId');
        if (!state) {
            state = new EventState();
            await state.save();
            state = await EventState.findOne().populate('currentParticipantId').populate('currentGalleryImageId');
        }

        // Update Redis with populated state
        await redisClient.set('eventState', JSON.stringify(state));
        res.json(state);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update event state (Open/Close Voting, Change Mode, Change Active Participant)
// Update event state (Open/Close Voting, Change Mode, Change Active Participant)
router.post('/state', async (req, res) => {
    try {
        const { currentParticipantId, isVotingOpen, displayMode, qrCodeUrl, currentGalleryImageId } = req.body;

        let state = await EventState.findOne();
        if (!state) state = new EventState();

        if (currentParticipantId !== undefined) state.currentParticipantId = currentParticipantId;
        if (isVotingOpen !== undefined) state.isVotingOpen = isVotingOpen;
        if (displayMode !== undefined) state.displayMode = displayMode;
        if (qrCodeUrl !== undefined) state.qrCodeUrl = qrCodeUrl;
        if (currentGalleryImageId !== undefined) state.currentGalleryImageId = currentGalleryImageId;

        // Automated Final Score Calculation when voting closes
        if (isVotingOpen === false && state.currentParticipantId) {
            const votes = await Vote.find({ participantId: state.currentParticipantId });
            const totalVotes = votes.length;
            const sum = votes.reduce((acc, v) => acc + v.score, 0);
            const avgScore = totalVotes > 0 ? (sum / totalVotes) : 0;

            await Participant.findByIdAndUpdate(state.currentParticipantId, {
                finalScore: avgScore,
                totalVotes: totalVotes,
                status: 'completed'
            });

            console.log(`Locked score for participant ${state.currentParticipantId}: ${avgScore} (${totalVotes} votes)`);
        }

        await state.save();
        const populatedState = await EventState.findOne()
            .populate('currentParticipantId')
            .populate('currentGalleryImageId');

        await AuditLog.create({
            action: 'STATE_UPDATE',
            details: { isVotingOpen, currentParticipantId, displayMode, currentGalleryImageId },
            ip: req.ip
        });

        // Update Redis Cache
        await redisClient.set('eventState', JSON.stringify(populatedState));

        // Emit socket event for real-time updates (includes populated participant data)
        const io = req.app.get('io');
        io.emit('stateUpdate', populatedState);

        res.json(populatedState);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// Hard Reset Redis Cache (Emergency Protocol)
router.post('/redis-reset', async (req, res) => {
    try {
        await redisClient.del('participants');
        await redisClient.del('eventState');
        await redisClient.del('leaderboard');
        await redisClient.del('admins');
        res.json({ message: 'PROTOCOL_CACHE_FLUSHED' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
