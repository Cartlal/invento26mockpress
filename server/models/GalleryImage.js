const mongoose = require('mongoose');

const GalleryImageSchema = new mongoose.Schema({
    participantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Participant', required: true },
    imagePath: { type: String, required: true }, // Relative path from images_char folder
    orderNumber: { type: Number, default: 0 }, // Order within participant's gallery
    caption: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('GalleryImage', GalleryImageSchema);
