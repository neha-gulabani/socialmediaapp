const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    bookmarks: [{
        story: { type: mongoose.Schema.Types.ObjectId, ref: 'Story' },
        slide: { type: Number }
    }]
}, { toJSON: { virtuals: true }, toObject: { virtuals: true } });

userSchema.pre('init', function () {
    this.bookmarks = this.bookmarks || [];
});
// Password hashing middleware
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

module.exports = mongoose.model('User', userSchema);


