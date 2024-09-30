
const express = require('express');
const multer = require('multer');
const Story = require('../model/story');
const middleware = require('../middleware/middleware');
const router = express.Router();
const User = require('../model/user');
const mongoose = require('mongoose');



router.post('/add', middleware, async (req, res) => {


    const { category, slides } = req.body;

    if (!slides || slides.length === 0) {
        return res.status(400).json({ message: "No slides provided." });
    }


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


router.get('/fetchstories', async (req, res) => {


    try {

        const stories = await Story.find().populate('userId', 'username');

        res.json(stories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/userstories', middleware, async (req, res) => {
    try {

        const userStories = await Story.find({ userId: req.user._id });

        res.json(userStories);
    } catch (error) {
        console.error('Error fetching user stories:', error);
        res.status(500).json({ message: error.message });
    }
});

router.get('/getUser', middleware, async (req, res) => {

    {
        try {

            const user = await User.findById(req.user._id).select('username');

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            res.json(user);
        } catch (error) {
            console.error(error.message);
            res.status(500).json({ message: 'Server error' });
        }
    };
})

router.get('/bookmarked', middleware, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate({
            path: 'bookmarks.story',
            select: 'slides category'
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const bookmarkedStories = user.bookmarks.map(bookmark => {
            const story = bookmark.story;
            if (!story || !story.slides || !story.slides[bookmark.slide]) {
                return null;
            }
            const slide = story.slides[bookmark.slide];
            return {
                storyId: story._id,
                slideIndex: bookmark.slide,
                heading: slide.heading,
                description: slide.description,
                imageUrl: slide.imageUrl,
                videoUrl: slide.videoUrl,
                category: story.category
            };
        }).filter(story => story !== null);

        res.json(bookmarkedStories);
    } catch (error) {
        console.error('Error fetching bookmarked stories:', error);
        res.status(500).json({ message: error.message });
    }
});
router.get('/:storyId', async (req, res) => {
    try {
        const { storyId } = req.params;

        const story = await Story.findById(storyId)
            .populate('userId', 'username')
            .exec();

        if (!story) {
            return res.status(404).json({ message: 'Story not found' });
        }

        res.status(200).json(story);
    } catch (error) {
        console.error('Error fetching story:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


router.put('/:id', middleware, async (req, res) => {

    try {
        const { id } = req.params;
        const { category, slides } = req.body;

        const updatedStory = await Story.findOneAndUpdate(
            { _id: id, userId: req.user._id },
            {
                category,
                slides: slides.map(slide => ({
                    heading: slide.heading,
                    description: slide.description,
                    imageUrl: slide.imageUrl,
                    videoUrl: slide.videoUrl
                }))
            },
            { new: true, runValidators: true }
        );

        if (!updatedStory) {
            return res.status(404).json({ message: 'Story not found or you do not have permission to edit it' });
        }


        res.json(updatedStory);
    } catch (error) {
        console.error('Error updating story:', error);
        res.status(500).json({ message: error.message });
    }
});



router.get('/checkLikeBookmark/:storyId', middleware, async (req, res) => {
    const userId = req.user ? req.user._id : null;
    const { storyId } = req.params;

    try {
        const story = await Story.findById(storyId)
            .populate('likes', 'username')
            .populate('bookmarks', 'username')
            .exec();

        if (!story) {
            return res.status(404).json({ message: 'Story not found' });
        }


        const isLiked = userId ? story.likes.some(likeUser => likeUser._id.equals(userId)) : false;
        const isBookmarked = userId ? story.bookmarks.some(bookmarkUser => bookmarkUser._id.equals(userId)) : false;

        res.status(200).json({ isLiked, isBookmarked });
    } catch (error) {
        console.error('Error checking like/bookmark status:', error);
        res.status(500).json({ message: 'Server error' });
    }
});



router.post('/like/:storyId/:slideIndex', middleware, async (req, res) => {
    try {
        const { storyId, slideIndex } = req.params;


        const story = await Story.findById(storyId);

        if (!story || !story.slides[slideIndex]) {
            return res.status(404).json({ message: 'Story or slide not found' });
        }

        const slide = story.slides[slideIndex];
        const userIndex = slide.likes.indexOf(req.user._id);

        if (userIndex === -1) {
            slide.likes.push(req.user._id);
        } else {
            slide.likes.splice(userIndex, 1);
        }

        await story.save();
        res.json({ likes: slide.likes.length });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: error.message });
    }
});





router.post('/bookmark/:storyId/:slideIndex', middleware, async (req, res) => {
    try {
        const { storyId, slideIndex } = req.params;


        if (!mongoose.Types.ObjectId.isValid(storyId)) {
            return res.status(400).json({ message: 'Invalid story ID' });
        }


        const slideIndexNum = parseInt(slideIndex, 10);
        if (isNaN(slideIndexNum) || slideIndexNum < 0) {
            return res.status(400).json({ message: 'Invalid slide index' });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }


        if (!Array.isArray(user.bookmarks)) {
            user.bookmarks = [];
        }

        const story = await Story.findById(storyId);
        if (!story) {
            return res.status(404).json({ message: 'Story not found' });
        }


        if (slideIndexNum >= story.slides.length) {
            return res.status(400).json({ message: 'Invalid slide index for this story' });
        }

        const bookmarkIndex = user.bookmarks.findIndex(
            b => b.story && b.story.equals(storyId) && b.slide === slideIndexNum
        );

        if (bookmarkIndex === -1) {
            user.bookmarks.push({ story: storyId, slide: slideIndexNum });
        } else {
            user.bookmarks.splice(bookmarkIndex, 1);
        }

        await user.save();
        res.json({ bookmarked: bookmarkIndex === -1 });
    } catch (error) {
        console.error('Error bookmarking story:', error);
        res.status(500).json({ message: 'An error occurred while bookmarking the story' });
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




module.exports = router;
