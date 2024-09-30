import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/stories.css';
import { useNavigate } from 'react-router-dom';
import Login from '../user/login';
import { FaBookmark, FaCheck, FaHeart, FaRegHeart, FaDownload, FaShareAlt, FaRegBookmark } from 'react-icons/fa';
import { Send } from 'lucide-react';

function StoryView({ selectedStory, setSelectedStory, bookmarkedIndex, setBookmarkSlideIndex }) {
    const [story, setStory] = useState(null);
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const [likes, setLikes] = useState({});
    const [bookmarks, setBookmarks] = useState({});
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [downloadedImages, setDownloadedImages] = useState({});
    const [likeCount, setLikeCount] = useState(0);
    const [isLiked, setIsLiked] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const [showShareNotification, setShowShareNotification] = useState(false);

    const isBookmarkedMode = bookmarkedIndex !== undefined;

    useEffect(() => {
        fetchStory();
        checkLikeBookmarkStatus();
    }, [selectedStory, token]);

    useEffect(() => {
        if (story && story.slides) {
            const slideIndex = isBookmarkedMode ? bookmarkedIndex : currentSlideIndex;
            const currentLikes = story.slides[slideIndex].likes || [];
            if (Array.isArray(currentLikes)) {
                setIsLiked(currentLikes.includes(token));
                setLikeCount(currentLikes.length);
            }
        }
    }, [story, currentSlideIndex, bookmarkedIndex, token, isBookmarkedMode]);

    useEffect(() => {
        const slideIndex = isBookmarkedMode ? bookmarkedIndex : currentSlideIndex;
        setIsBookmarked(bookmarks[selectedStory._id]?.includes(slideIndex));
    }, [currentSlideIndex, bookmarks, selectedStory._id, bookmarkedIndex, isBookmarkedMode]);

    const checkLikeBookmarkStatus = async () => {
        if (!token || !selectedStory) return;

        try {
            const response = await axios.get(`http://localhost:5000/api/stories/checkLikeBookmark/${selectedStory._id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.data.isLiked) {
                setIsLiked(true)
            }
            if (response.data.isBookmarked) {
                setIsBookmarked(true)
            }
        } catch (error) {
            console.error('Error checking like/bookmark status:', error);
        }
    };

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

    const handleLike = async () => {
        if (!token) {
            setShowLoginModal(true);
            return;
        }
        const slideIndex = isBookmarkedMode ? bookmarkedIndex : currentSlideIndex;
        try {
            const response = await axios.post(`http://localhost:5000/api/stories/like/${selectedStory._id}/${slideIndex}`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setIsLiked(prev => !prev);
            setLikeCount(prev => isLiked ? prev : prev + 1);

            setLikes(prevLikes => ({
                ...prevLikes,
                [slideIndex]: response.data.likes || []
            }));

            setStory(prevStory => {
                const updatedSlides = [...prevStory.slides];
                updatedSlides[slideIndex].likes = response.data.likes || [];
                return { ...prevStory, slides: updatedSlides };
            });
        } catch (error) {
            console.error('Error liking story:', error);
            setIsLiked(prev => !prev);
            setLikeCount(prev => isLiked ? prev + 1 : prev - 1);
        }
    };

    const handleBookmark = async () => {
        if (!token) {
            setShowLoginModal(true);
            return;
        }
        const slideIndex = isBookmarkedMode ? bookmarkedIndex : currentSlideIndex;
        try {
            const response = await axios.post(`http://localhost:5000/api/stories/bookmark/${selectedStory._id}/${slideIndex}`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setIsBookmarked(response.data.bookmarked);
            setBookmarks(prevBookmarks => ({
                ...prevBookmarks,
                [selectedStory._id]: response.data.bookmarked
                    ? [...(prevBookmarks[selectedStory._id] || []), slideIndex]
                    : (prevBookmarks[selectedStory._id] || []).filter(index => index !== slideIndex)
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

            setDownloadedImages(prev => ({ ...prev, [selectedStory._id]: true }));

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
        const slideIndex = isBookmarkedMode ? bookmarkedIndex : currentSlideIndex;
        const storyUrl = `${window.location.origin}/?storyId=${selectedStory._id}&slideIndex=${slideIndex}`;
        navigator.clipboard.writeText(storyUrl).then(() => {
            setShowShareNotification(true);
            setTimeout(() => setShowShareNotification(false), 3000);
        });
    };

    const goToNextSlide = () => {
        if (!isBookmarkedMode && story && currentSlideIndex < story.slides.length - 1) {
            setCurrentSlideIndex(currentSlideIndex + 1);
        }
    };

    const goToPreviousSlide = () => {
        if (!isBookmarkedMode && currentSlideIndex > 0) {
            setCurrentSlideIndex(currentSlideIndex - 1);
        }
    };

    if (!story) {
        return <div>Loading...</div>;
    }

    const currentSlide = isBookmarkedMode ? story.slides[bookmarkedIndex] : story.slides[currentSlideIndex];

    return (
        <div className="story-modal">
            <div className="modal-content">
                <div className="modal-header">
                    {!isBookmarkedMode && (
                        <div className='progressbar-wrapper'>
                            {story.slides.map((_, index) => (
                                <div key={index} className="progress-bar" style={{
                                    opacity: index <= currentSlideIndex ? 1 : 0.5
                                }} />
                            ))}
                        </div>
                    )}
                    <button onClick={() => {
                        setBookmarkSlideIndex(undefined)
                        setSelectedStory(null)
                        navigate('/')
                    }} className="close-btn">×</button>
                    <button onClick={handleShare} className="action-btn share-btn">
                        <Send />
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

                {showShareNotification && (
                    <div className="share-notification">
                        <p>Link copied to clipboard</p>
                    </div>
                )}

                <div className="slide-content">
                    <h2 className="slide-heading">{currentSlide.heading}</h2>
                    <p className="slide-description">{currentSlide.description}</p>
                </div>

                <div className="modal-footer">
                    <button onClick={handleBookmark} className="action-btn bookmark-btn">
                        {isBookmarked ? <FaBookmark style={{ color: "blue" }} /> : <FaRegBookmark />}
                    </button>

                    <button
                        onClick={() => handleDownload(currentSlide.imageUrl)}
                        className="action-btn download-btn"
                    >
                        {downloadedImages[selectedStory._id] ? <FaCheck /> : <FaDownload />}
                    </button>

                    <button onClick={handleLike} disabled={isLiked} className="action-btn like-btn">
                        {isLiked ? <FaHeart style={{ color: "red" }} /> : <FaRegHeart />}
                        <span>{likeCount}</span>
                    </button>

                </div>
            </div>

            {!isBookmarkedMode && (
                <>
                    <button
                        onClick={goToPreviousSlide}
                        className={`nav-arrow prev-arrow ${currentSlideIndex === 0 ? 'disabled' : ''}`}
                        disabled={currentSlideIndex === 0}
                    >
                        &lt;
                    </button>
                    <button
                        onClick={goToNextSlide}
                        className={`nav-arrow next-arrow ${currentSlideIndex === story.slides.length - 1 ? 'disabled' : ''}`}
                        disabled={currentSlideIndex === story.slides.length - 1}
                    >
                        &gt;
                    </button>
                </>
            )}

            {showLoginModal && <Login closeModal={() => setShowLoginModal(false)} onLogin={() => setShowLoginModal(false)} />}
        </div>
    );
}

export default StoryView;



