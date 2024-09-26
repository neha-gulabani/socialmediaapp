const mongoose = require('mongoose');

const slideSchema = new mongoose.Schema({
    heading: { type: String, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },
});

const storySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: String, required: true },
    slides: [slideSchema],  // Array of slides
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Story', storySchema);