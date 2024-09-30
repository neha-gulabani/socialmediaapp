const mongoose = require('mongoose');

const slideSchema = new mongoose.Schema({
    heading: { type: String, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String },
    videoUrl: { type: String },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

slideSchema.pre('validate', function (next) {
    if (!this.imageUrl && !this.videoUrl) {
        this.invalidate('media', 'Either imageUrl or videoUrl must be provided');
    }
    next();
});

const storySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: String, required: true },
    slides: [slideSchema],  // Array of slides
    createdAt: { type: Date, default: Date.now },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Story' }]
});

module.exports = mongoose.model('Story', storySchema);