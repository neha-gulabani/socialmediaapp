// routes/storyRoutes.js
const express = require('express');
const multer = require('multer');
const Story = require('../model/story');
const middleware = require('../middleware/middleware');
const router = express.Router();
const User = require('../model/user');



// Add a story (protected route)

router.post('/add', middleware, async (req, res) => {
    console.log('Authenticated User:', req.user);
    console.log('Request Body:', req.body);

    const { category, slides } = req.body;  // Expecting category and slides array

    if (!slides || slides.length === 0) {
        return res.status(400).json({ message: "No slides provided." });
    }

    // Validate the slides
    const validSlides = slides.filter(slide =>
        slide.heading && slide.description && slide.imageUrl
    );

    if (validSlides.length === 0) {
        return res.status(400).json({ message: "No valid slides provided." });
    }

    try {
        const newStory = new Story({
            userId: req.user._id,
            category,
            slides: validSlides
        });

        const savedStory = await newStory.save();
        res.json(savedStory);  // Send back the saved story
    } catch (error) {
        console.error('Error saving story:', error);
        res.status(500).json({ message: error.message });
    }
});

// Fetch stories (for all users)
router.get('/fetchstories', async (req, res) => {
    console.log('fetching triggered')
    try {

        const stories = await Story.find().populate('userId', 'username');
        console.log(stories)
        res.json(stories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


router.get('/getUser', middleware, async (req, res) => {

    {
        try {
            // Assuming `req.user` is populated by the auth middleware with the user's ID
            const user = await User.findById(req.user._id).select('username'); // Exclude sensitive data like password
            console.log('user', user)

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            res.json(user); // Return the user data (e.g., username)
        } catch (error) {
            console.error(error.message);
            res.status(500).json({ message: 'Server error' });
        }
    };
})

router.put('/:id', middleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { heading, description, imageUrl, category } = req.body;

        const story = await Story.findOneAndUpdate(
            { _id: id, userId: req.user._id },
            { heading, description, imageUrl, category },
            { new: true }
        );

        if (!story) {
            return res.status(404).json({ message: 'Story not found or you do not have permission to edit it' });
        }

        res.json(story);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/userstories', middleware, async (req, res) => {
    try {
        const userStories = await Story.find({ userId: req.user._id });
        res.json(userStories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
module.exports = router;
