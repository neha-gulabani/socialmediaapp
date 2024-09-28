import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/stories.css';
import { useNavigate, useParams } from 'react-router-dom';
import Login from '../user/login';
import { FaBookmark, FaCheck, FaHeart, FaRegHeart, FaDownload, FaShareAlt, FaRegBookmark } from 'react-icons/fa';

function StoryView({ selectedStory, setSelectedStory }) {
    const [story, setStory] = useState(null);
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const [likes, setLikes] = useState({});
    const [bookmarks, setBookmarks] = useState({});
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [downloadedImages, setDownloadedImages] = useState({});
    const [likeCount, setLikeCount] = useState(0);
    const [isLiked, setIsLiked] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);
    // const { storyId } = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    useEffect(() => {

        fetchStory();


    }, [selectedStory, token]);

    useEffect(() => {
        // Check if the current slide is bookmarked
        const isCurrentSlideBookmarked = bookmarks[selectedStory._id]?.includes(currentSlideIndex);
        setIsBookmarked(isCurrentSlideBookmarked);
    }, [currentSlideIndex, bookmarks, selectedStory._id]);

    console.log('selectedStory:', selectedStory)

    useEffect(() => {
        if (story && story.slides) {
            const currentLikes = story.slides[currentSlideIndex].likes || [];
            if (Array.isArray(currentLikes)) {
                setIsLiked(currentLikes.includes(token));
                setLikeCount(currentLikes.length);
                return;
            }


            return;
        }
    }, [story, currentSlideIndex, token]);

    const fetchStory = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/stories/${selectedStory._id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setStory(response.data);
            const initialLikes = {};
            response.data.slides.forEach((slide, index) => {
                initialLikes[index] = slide.likes || [];
            });
            setLikes(initialLikes);
        } catch (error) {
            console.error('Error fetching story:', error);
            alert('Failed to load the story. It may have been deleted or you may not have permission to view it.');
            navigate('/');
        }
    };
    const handleLike = async (slideIndex) => {
        if (!token) {
            setShowLoginModal(true);
            return;
        }
        try {
            const response = await axios.post(`http://localhost:5000/api/stories/like/${selectedStory._id}/${slideIndex}`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });

            // Optimistic update
            setIsLiked(prev => !prev);
            setLikeCount(prev => isLiked ? prev - 1 : prev + 1);

            // Update likes state
            setLikes(prevLikes => {
                const newLikes = { ...prevLikes };
                newLikes[slideIndex] = response.data.likes || [];
                return newLikes;
            });

            // Update story state
            setStory(prevStory => {
                const updatedSlides = [...prevStory.slides];
                updatedSlides[slideIndex].likes = response.data.likes || [];
                return { ...prevStory, slides: updatedSlides };
            });
        } catch (error) {
            console.error('Error liking story:', error);
            // Revert optimistic update if there's an error
            setIsLiked(prev => !prev);
            setLikeCount(prev => isLiked ? prev + 1 : prev - 1);
        }
    };
    // const fetchBookmarkedStories = async () => {
    //     try {
    //         const response = await axios.get('http://localhost:5000/api/stories/bookmarked', {
    //             headers: { Authorization: `Bearer ${token}` },
    //         });
    //         setBookmarkedStories(response.data);

    //         // Update bookmarks state
    //         const newBookmarks = {};
    //         response.data.forEach(story => {
    //             newBookmarks[story._id] = true;
    //         });
    //         setBookmarks(newBookmarks);
    //     } catch (error) {
    //         console.error('Error fetching bookmarked stories:', error);
    //     }
    // };
    const handleBookmark = async () => {
        if (!token) {
            setShowLoginModal(true);
            return;
        }
        try {
            const response = await axios.post(`http://localhost:5000/api/stories/bookmark/${selectedStory._id}/${currentSlideIndex}`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setIsBookmarked(response.data.bookmarked);
            setBookmarks(prevBookmarks => ({
                ...prevBookmarks,
                [selectedStory._id]: response.data.bookmarked
                    ? [...(prevBookmarks[selectedStory._id] || []), currentSlideIndex]
                    : (prevBookmarks[selectedStory._id] || []).filter(index => index !== currentSlideIndex)
            }));
        } catch (error) {
            console.error('Error bookmarking story:', error);
            alert('Failed to bookmark the story. Please try again.');
        }
    };

    const handleDownload = async (imageUrl) => {
        if (!token) {
            setShowLoginModal(true);
            return;
        }
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'story-image.jpg';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Mark the image as downloaded
            setDownloadedImages(prev => ({ ...prev, [selectedStory._id]: true }));

            // Reset the icon after 3 seconds
            setTimeout(() => {
                setDownloadedImages(prev => ({ ...prev, [selectedStory._id]: false }));
            }, 3000);
        } catch (error) {
            console.error('Error downloading image:', error);
            alert('Failed to download the image. Please try again.');
        }
    };

    const handleShare = () => {
        if (!token) {
            setShowLoginModal(true);
            return;
        }
        const storyUrl = `${window.location.origin}/?storyId=${selectedStory._id}`;

        navigator.clipboard.writeText(storyUrl).then(() => {
            alert('Story link copied to clipboard!');
        });
    };

    const goToNextSlide = () => {
        if (story && currentSlideIndex < story.slides.length - 1) {
            setCurrentSlideIndex(currentSlideIndex + 1);
        }
    };

    const goToPreviousSlide = () => {
        if (currentSlideIndex > 0) {
            setCurrentSlideIndex(currentSlideIndex - 1);
        }
    };

    if (!story) {
        return <div>Loading...</div>; // Show a loading state while the story is being fetched
    }

    const currentSlide = story.slides[currentSlideIndex];
    const currentLikes = likes[currentSlideIndex] || [];
    // const isLiked = Array.isArray(currentLikes) && currentLikes.includes(token);
    console.log('current likes', currentLikes)
    // const likeCount = Array.isArray(currentLikes) ? currentLikes.length : 0;

    return (
        <div className="story-modal">
            <div className="modal-content">
                <div className="modal-header">
                    <div className='progressbar-wrapper'>
                        {[...Array(story.slides.length)].map((_, index) => (
                            <div className="progress-bar" key={index} style={{
                                opacity: index <= currentSlideIndex ? 1 : .5
                            }} />
                        ))}
                    </div>

                    <button onClick={() => setSelectedStory(null)} className="close-btn">×</button>
                    <button onClick={handleShare} className="action-btn share-btn">
                        <FaShareAlt />
                    </button>
                </div>

                {currentSlide.videoUrl ? (
                    <video
                        src={currentSlide.videoUrl}
                        autoPlay
                        loop
                        playsInline
                        webkit-playsinline="true"
                        x-webkit-airplay="true"
                        preload="auto"
                        className="story-media"
                    >
                        Your browser does not support the video tag.
                    </video>
                ) : (
                    <img
                        src={currentSlide.imageUrl}
                        alt="Story Slide"
                        className="story-media"
                    />
                )}

                {/* Navigation arrows */}


                <div className="modal-footer">
                    <button onClick={() => handleLike(currentSlideIndex)} disabled={isLiked} className="action-btn like-btn">
                        {isLiked ? <FaHeart style={{ color: "red" }} /> : <FaRegHeart />}
                        <span>{likeCount}</span>
                    </button>
                    <button
                        onClick={() => handleDownload(currentSlide.imageUrl)}
                        className="action-btn download-btn"
                    >
                        {downloadedImages[selectedStory._id] ? <FaCheck /> : <FaDownload />}
                    </button>

                    <button onClick={handleBookmark} className="action-btn bookmark-btn">
                        {isBookmarked ? <FaBookmark style={{ color: "blue" }} /> : <FaRegBookmark />}
                    </button>
                </div>

            </div>
            <button
                onClick={goToPreviousSlide}
                className={`nav-arrow prev-arrow ${currentSlideIndex === 0 ? 'disabled' : ''}`}
                disabled={currentSlideIndex === 0}
            >
                &#8592;
            </button>
            <button
                onClick={goToNextSlide}
                className={`nav-arrow next-arrow ${currentSlideIndex === story.slides.length - 1 ? 'disabled' : ''}`}
                disabled={currentSlideIndex === story.slides.length - 1}
            >
                &#8594;
            </button>

            {showLoginModal && <Login closeModal={() => setShowLoginModal(false)} onLogin={() => setShowLoginModal(false)} />}
        </div>
    );
}

export default StoryView;




