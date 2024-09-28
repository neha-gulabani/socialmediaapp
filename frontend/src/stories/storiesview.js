import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/stories.css';
import { useNavigate, useParams } from 'react-router-dom';
import Login from '../user/login';
import { FaBookmark, FaCheck, FaHeart, FaRegHeart, FaDownload, FaShareAlt, FaRegBookmark } from 'react-icons/fa';

function StoryView() {
    const [story, setStory] = useState(null);
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const [likes, setLikes] = useState({});
    const [bookmarks, setBookmarks] = useState({});
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [downloadedImages, setDownloadedImages] = useState({});
    const { storyId } = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    useEffect(() => {

        fetchStory();

    }, [storyId, token]);

    const fetchStory = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/stories/${storyId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setStory(response.data);
            setLikes(response.data.likes || []);
            setBookmarks(response.data.bookmarks || []);
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
            const response = await axios.post(`http://localhost:5000/api/stories/like/${storyId}/${slideIndex}`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setStory(prevStory => {
                const updatedSlides = [...prevStory.slides];
                updatedSlides[slideIndex].likes = response.data.likes;
                return { ...prevStory, slides: updatedSlides };
            });
        } catch (error) {
            console.error('Error liking story:', error);
        }
    };

    const handleBookmark = async (slideIndex) => {
        if (!token) {
            setShowLoginModal(true);
            return;
        }
        try {
            const response = await axios.post(`http://localhost:5000/api/stories/bookmark/${storyId}/${slideIndex}`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setBookmarks(prevBookmarks => ({
                ...prevBookmarks,
                [slideIndex]: response.data.bookmarked
                    ? [...(prevBookmarks[slideIndex] || []), token]
                    : (prevBookmarks[slideIndex] || []).filter(id => id !== token)
            }));
        } catch (error) {
            console.error('Error bookmarking story:', error);
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
            setDownloadedImages(prev => ({ ...prev, [storyId]: true }));

            // Reset the icon after 3 seconds
            setTimeout(() => {
                setDownloadedImages(prev => ({ ...prev, [storyId]: false }));
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
        const storyUrl = `${window.location.origin}/story/${story._id}`;

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
    const likesArray = Array.isArray(currentSlide?.likes) ? currentSlide.likes : [];
    const bookmarksArray = Array.isArray(currentSlide?.bookmarks) ? currentSlide.bookmarks : [];

    return (
        <div className="story-modal">
            <div className="modal-content">
                <div className="modal-header">
                    <div className="progress-bar" style={{ width: `${(currentSlideIndex + 1) / story.slides.length * 100}%` }}></div>
                    <button onClick={() => navigate('/')} className="close-btn">×</button>
                </div>

                {currentSlide.videoUrl ? (
                    <video
                        src={currentSlide.videoUrl}
                        controls
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

                <div className="modal-footer">
                    <button onClick={() => handleLike(currentSlideIndex)} className="action-btn like-btn">
                        {likes[currentSlideIndex]?.includes(token) ? <FaHeart color="red" /> : <FaRegHeart />}
                        <span>{likes[currentSlideIndex]?.length || 0}</span>
                    </button>
                    <button
                        onClick={() => handleDownload(currentSlide.imageUrl)}
                        className="action-btn download-btn"
                    >
                        {downloadedImages[storyId] ? <FaCheck /> : <FaDownload />}
                    </button>
                    <button onClick={handleShare} className="action-btn share-btn">
                        <FaShareAlt />
                    </button>
                    <button onClick={() => handleBookmark(currentSlideIndex)} className="action-btn bookmark-btn">
                        {bookmarks[currentSlideIndex]?.includes(token) ? <FaBookmark color="blue" /> : <FaRegBookmark />}
                    </button>
                </div>
            </div>

            {showLoginModal && <Login closeModal={() => setShowLoginModal(false)} onLogin={() => setShowLoginModal(false)} />}
        </div>
    );
}

export default StoryView;




