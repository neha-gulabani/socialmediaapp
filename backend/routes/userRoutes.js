// routes/authRoutes.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../model/user');
const router = express();

// JWT secret key
const JWT_SECRET = process.env.JWT_SECRET;

// Sign Up Route
router.post('/signup', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Check if the username already exists
        let user = await User.findOne({ username });
        if (user) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        // Create a new user
        user = new User({ username, password });
        await user.save();
        console.log()

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '30d' });
        res.json({ token, username: user.username });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Login Route
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    console.log('jwt', JWT_SECRET)

    try {
        // Find user by username
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '30d' });
        res.json({ token, username: user.username });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;

