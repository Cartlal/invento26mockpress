const express = require('express');
const router = express.Router();
const GalleryImage = require('../models/GalleryImage');
const EventState = require('../models/EventState');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const redisClient = require('../config/redis');

// Configure multer for gallery images
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../images_char');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'gallery-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 20 * 1024 * 1024 } // 20MB limit
});

// Get all gallery images for a participant (Cached)
router.get('/participant/:participantId', async (req, res) => {
    try {
        const cacheKey = `gallery:${req.params.participantId}`;
        const cached = await redisClient.get(cacheKey);
        if (cached) return res.json(JSON.parse(cached));

        const images = await GalleryImage.find({
            participantId: req.params.participantId
        }).sort({ orderNumber: 1 });

        await redisClient.set(cacheKey, JSON.stringify(images), { EX: 300 }); // 5 mins
        res.json(images);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Upload gallery image
router.post('/upload', upload.single('image'), async (req, res) => {
    try {
        const { participantId, caption } = req.body;

        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Get count for order number
        const count = await GalleryImage.countDocuments({ participantId });

        const newImage = new GalleryImage({
            participantId,
            imagePath: req.file.filename, // Store only filename
            caption: caption || '',
            orderNumber: count + 1
        });

        await newImage.save();
        res.status(201).json(newImage);
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message });
    }
});

// Add image by URL
router.post('/add-url', async (req, res) => {
    try {
        const { participantId, imageUrl, caption } = req.body;

        const count = await GalleryImage.countDocuments({ participantId });

        const newImage = new GalleryImage({
            participantId,
            imagePath: imageUrl, // Store URL directly
            caption: caption || '',
            orderNumber: count + 1
        });

        await newImage.save();
        res.json(newImage);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete gallery image
router.delete('/:id', async (req, res) => {
    try {
        const image = await GalleryImage.findById(req.params.id);
        if (!image) {
            return res.status(404).json({ error: 'Image not found' });
        }

        // Delete file if it's a local file (not a URL)
        if (!image.imagePath.startsWith('http')) {
            const filePath = path.join(__dirname, '../images_char', image.imagePath);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        await GalleryImage.findByIdAndDelete(req.params.id);
        res.json({ message: 'Image deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Navigate gallery (next/previous)
router.post('/navigate', async (req, res) => {
    try {
        const { participantId, direction } = req.body; // direction: 'next' or 'prev'

        const state = await EventState.findOne();
        const currentImageId = state.currentGalleryImageId;

        const images = await GalleryImage.find({ participantId }).sort({ orderNumber: 1 });

        if (images.length === 0) {
            return res.json({ message: 'No images in gallery' });
        }

        let newImageId;
        if (!currentImageId) {
            // Start at first image
            newImageId = images[0]._id;
        } else {
            const currentIndex = images.findIndex(img => String(img._id) === String(currentImageId));

            if (direction === 'next') {
                newImageId = images[(currentIndex + 1) % images.length]._id;
            } else {
                newImageId = images[(currentIndex - 1 + images.length) % images.length]._id;
            }
        }

        state.currentGalleryImageId = newImageId;
        state.displayMode = 'gallery';
        await state.save();

        const populatedState = await EventState.findOne()
            .populate('currentParticipantId')
            .populate('currentGalleryImageId');

        // Update Redis Cache to keep it in sync with Socket
        await redisClient.set('eventState', JSON.stringify(populatedState));

        // Emit socket event
        const io = req.app.get('io');
        io.emit('stateUpdate', populatedState);

        res.json(populatedState);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
