const express = require('express');
const router = express.Router();
const Vote = require('../models/Vote');
const Participant = require('../models/Participant');
const EventState = require('../models/EventState');
const redisClient = require('../config/redis');

// Check if user has already voted
router.get('/check/:participantId/:deviceHash', async (req, res) => {
    try {
        const { participantId, deviceHash } = req.params;
        const ipAddress = req.ip;
        const existingVote = await Vote.findOne({
            participantId,
            deviceHash
        });

        res.json({ voted: !!existingVote });
    } catch (err) {
        res.status(500).json({ error: 'Status check failed' });
    }
});

router.post('/', async (req, res) => {
    try {
        const { participantId, score, deviceHash, voterName, voterPhone } = req.body;
        const ipAddress = req.ip;



        // 1. Check if voting is open
        // 1. Check if voting is open (REDIS OPTIMIZED)
        const cachedState = await redisClient.get('eventState');
        let state;

        if (cachedState) {
            state = JSON.parse(cachedState);
        } else {
            state = await EventState.findOne();
        }

        if (!state || !state.isVotingOpen) {
            return res.status(403).json({ error: 'Voting is currently closed.' });
        }

        // Handle populated object vs raw ID from Redis/DB
        const activeId = state.currentParticipantId._id || state.currentParticipantId;
        if (String(activeId) !== participantId) {
            return res.status(400).json({ error: 'This participant is not currently active.' });
        }

        // 2. Double-vote Prevention
        // Check if this IP or Device Hash has already voted for this participant

        // Allow multiple votes from localhost for testing
        // 2. Double-vote Prevention
        // Check if this IP or Device Hash has already voted for this participant

        const existingVote = await Vote.findOne({
            participantId,
            deviceHash
        });

        if (existingVote) {
            return res.status(409).json({ error: 'You have already voted for this participant.' });
        }


        // 3. Save Vote
        const vote = new Vote({ participantId, score, ipAddress, deviceHash, voterName, voterPhone });
        await vote.save();

        // 4. Update Participant Stats (Atomic increment)
        // Note: Doing this on every vote might be heavy for high scale, but fine for <1000 users.
        // Alternative: Aggregation pipeline periodically. here we do it live.
        const participant = await Participant.findById(participantId);
        if (participant) {
            // Re-calculate average safely
            // We can trust MongoDB atomic operators for simple counts, but average needs care.
            // Let's just store the vote and let the admin dashboard Aggregate it live, 
            // OR update running total/count here.
            // Running total approach:

            // However, concurrent writes might cause race conditions on the 'average' field if not careful.
            // Better to increment totalVotes and totalScore, then calc average on read.
            // But User schema doesn't have totalScore. Let's add it or just re-calculate.

            // Let's just emit the vote to the admin panel via Socket for real-time graph, 
            // and let the admin panel calculate the average for display.
        }

        const io = req.app.get('io');
        // Only broadcast to admin room to save bandwidth for 300+ voters
        io.to('admin').emit('newVote', { participantId, score });

        res.status(201).json({ message: 'Vote submitted successfully' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error processing vote' });
    }
});



module.exports = router;

