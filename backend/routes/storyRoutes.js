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

    const { category, slides } = req.body;

    if (!slides || slides.length === 0) {
        return res.status(400).json({ message: "No slides provided." });
    }

    // Validate the slides
    const validSlides = slides.filter(slide =>
        slide.heading && slide.description && (slide.imageUrl || slide.videoUrl)
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
        res.json(savedStory);
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

router.post('/like/:id', middleware, async (req, res) => {
    try {
        const story = await Story.findById(req.params.id);
        if (!story) {
            return res.status(404).json({ message: 'Story not found' });
        }

        const userIndex = story.likes.indexOf(req.user._id);
        if (userIndex === -1) {
            story.likes.push(req.user._id);
        } else {
            story.likes.splice(userIndex, 1);
        }
        await story.save();

        res.json({ likes: story.likes.length });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/bookmark/:id', middleware, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            console.log('User not found')
            return res.status(404).json({ message: 'User not found' });
        }

        const storyIndex = user.bookmarks.indexOf(req.params.id);
        if (storyIndex === -1) {
            user.bookmarks.push(req.params.id);
        } else {
            user.bookmarks.splice(storyIndex, 1);
        }
        await user.save();

        res.json({ bookmarked: storyIndex === -1 });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/userbookmarks', middleware, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user.bookmarks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


router.get('/bookmarked', middleware, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('bookmarks');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user.bookmarks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
