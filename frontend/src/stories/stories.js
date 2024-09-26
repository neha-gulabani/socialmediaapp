import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/stories.css';
import Register from '../user/signup';
import Login from '../user/login';
import { FaBookmark, FaPlus, FaCheck, FaUserCircle, FaEdit, FaHeart, FaRegHeart, FaDownload, FaShareAlt, FaRegBookmark } from 'react-icons/fa';
import { GiHamburgerMenu } from 'react-icons/gi';
import AddStoryModal from './addstory';


const categoryData = [
    { name: 'All', imageUrl: "https://i.ibb.co/YWGR3n1/a-book-6213537-1280.jpg" },
    { name: 'Food', imageUrl: 'https://i.ibb.co/t8vZDbb/spaghetti-1932466-1280.jpg' },
    { name: 'Medical', imageUrl: 'https://i.ibb.co/9Yxjy2c/thermometer-1539191-1280.jpg' },
    { name: 'Technology', imageUrl: 'https://i.ibb.co/bdRnP4T/technology-785742-1280.jpg' },
    { name: 'Travel', imageUrl: 'https://i.ibb.co/G2YBJqr/fantasy-3502188-1280.jpg' },
    { name: 'World', imageUrl: 'https://i.ibb.co/DDnmCGt/earth-2254769-1280.jpg' },
    { name: 'India', imageUrl: 'https://i.ibb.co/vhj626v/mehtab-bagh-6698669-1280.jpg' },
    { name: 'News', imageUrl: 'https://i.ibb.co/kKLRmGJ/old-newspaper-350376-1280.jpg' },
];

function Stories() {
    const [stories, setStories] = useState([]);
    const [userStories, setUserStories] = useState([]);
    const [showAddStoryModal, setShowAddStoryModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [showStoryModal, setShowStoryModal] = useState(null);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [currentStoryIndex, setCurrentStoryIndex] = useState(null);
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const [user, setUser] = useState(null);
    const [showHamburgerMenu, setShowHamburgerMenu] = useState(false);
    const [editingStory, setEditingStory] = useState(null);
    const [likes, setLikes] = useState({});
    const [bookmarks, setBookmarks] = useState({});
    const [bookmarkedStories, setBookmarkedStories] = useState([]);
    const [showBookmarks, setShowBookmarks] = useState(false);
    const [downloadedImages, setDownloadedImages] = useState({});
    const token = localStorage.getItem("token");

    useEffect(() => {
        fetchStories();
        fetchUserData();
        if (token) {
            fetchUserStories();

            fetchBookmarkedStories();

        }
    }, [token]);


    const fetchBookmarkedStories = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/stories/bookmarked', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setBookmarkedStories(response.data);
        } catch (error) {
            console.error('Error fetching bookmarked stories:', error);
        }
    };
    const handleLike = async (storyId) => {
        if (!token) {
            setShowLoginModal(true);
            return;
        }
        try {
            const response = await axios.post(`http://localhost:5000/api/stories/like/${storyId}`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setLikes(prevLikes => ({
                ...prevLikes,
                [storyId]: {
                    count: response.data.likes,
                    isLiked: !prevLikes[storyId]?.isLiked
                }
            }));
        } catch (error) {
            console.error('Error liking story:', error);
        }
    };

    const handleBookmark = async (storyId) => {
        if (!token) {
            setShowLoginModal(true);
            return;
        }
        try {
            const response = await axios.post(`http://localhost:5000/api/stories/bookmark/${storyId}`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setBookmarks(prevBookmarks => ({
                ...prevBookmarks,
                [storyId]: response.data.bookmarked
            }));
        } catch (error) {
            console.error('Error bookmarking story:', error);
        }
    };

    // const fetchUserBookmarks = async () => {
    //     try {
    //         const response = await axios.get('http://localhost:5000/api/stories/userbookmarks', {
    //             headers: {
    //                 Authorization: `Bearer ${token}`,
    //             },
    //         });
    //         const bookmarkedStories = response.data;
    //         const initialBookmarks = {};
    //         bookmarkedStories.forEach(storyId => {
    //             initialBookmarks[storyId] = true;
    //         });
    //         setBookmarks(initialBookmarks);
    //     } catch (error) {
    //         console.error('Error fetching user bookmarks:', error);
    //     }
    // };

    const handleDownload = async (imageUrl, storyId) => {
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
        const storyUrl = `${window.location.origin}/story/${showStoryModal._id}`;
        navigator.clipboard.writeText(storyUrl).then(() => {
            alert('Story link copied to clipboard!');
        });
    };

    const fetchStories = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/stories/fetchstories', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setStories(response.data);
            const initialLikes = {};
            response.data.forEach(story => {
                initialLikes[story._id] = {
                    count: story.likes?.length || 0,
                    isLiked: story.likes?.includes(user?._id) || false
                };
            });
            setLikes(initialLikes);
        } catch (error) {
            console.error('Error fetching stories:', error);
        }
    };

    const fetchUserStories = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/stories/userstories', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setUserStories(response.data);
        } catch (error) {
            console.error('Error fetching user stories:', error);
        }
    };

    const fetchUserData = async () => {
        if (token) {
            try {
                const response = await axios.get('http://localhost:5000/api/stories/getUser', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setUser(response.data);
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        }
    };

    const openStoryModal = (story, index) => {
        setShowStoryModal(story);
        setCurrentStoryIndex(index);
        setCurrentSlideIndex(0);
    };

    const filteredStories = (category) => {
        if (category === 'All') return stories;
        return stories.filter((story) => story.category === category.toLowerCase());
    };

    const goToNextSlide = () => {
        if (currentSlideIndex < showStoryModal.slides.length - 1) {
            setCurrentSlideIndex(currentSlideIndex + 1);
        }
    };

    const goToPreviousSlide = () => {
        if (currentSlideIndex > 0) {
            setCurrentSlideIndex(currentSlideIndex - 1);
        }
    };


    const handleLogout = () => {
        setUser(null);
        setShowHamburgerMenu(false);
        localStorage.removeItem('token');
    };

    const handleLogin = async (username, token) => {
        setUser({ username });
        localStorage.setItem('token', token);
        setShowLoginModal(false);
        fetchUserData();
        fetchUserStories();
    };

    const toggleHamburgerMenu = () => {
        setShowHamburgerMenu((prev) => !prev);
    };

    const handleAddStory = async (newStory) => {
        try {
            const storyPayload = {
                category: newStory.category,
                slides: newStory.slides
            };

            const response = await axios.post('http://localhost:5000/api/stories/add', storyPayload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setStories([...stories, response.data]);
            setUserStories([...userStories, response.data]);
            setShowAddStoryModal(false);
        } catch (error) {
            console.error('Error adding story:', error);
        }
    };

    const handleEditStory = (story) => {
        setEditingStory(story);
        setShowAddStoryModal(true);
    };

    const handleUpdateStory = async (updatedStory) => {
        try {
            const response = await axios.put(`http://localhost:5000/api/stories/${editingStory._id}`, updatedStory, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const updatedStories = stories.map(story =>
                story._id === editingStory._id ? response.data : story
            );
            setStories(updatedStories);
            setUserStories(userStories.map(story =>
                story._id === editingStory._id ? response.data : story
            ));
            setEditingStory(null);
            setShowAddStoryModal(false);
        } catch (error) {
            console.error('Error updating story:', error);
        }
    };

    return (
        <div className="App">
            <div className="top-bar">
                {token ? (
                    <div className="user-buttons">
                        <button className="bookmark-btn" onClick={() => setShowBookmarks(true)}>
                            <FaBookmark /> Bookmarks
                        </button>
                        <button className="add-story-btn" onClick={() => setShowAddStoryModal(true)}>
                            <FaPlus /> Add Story
                        </button>
                        <div className="profile-container">
                            <FaUserCircle className="profile-picture" />
                            <GiHamburgerMenu onClick={toggleHamburgerMenu} className="hamburger-menu-toggle" />
                            {showHamburgerMenu && (
                                <div className="hamburger-menu">
                                    {user && <p>{user.username}</p>}
                                    <button onClick={handleLogout}>Logout</button>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="auth-buttons">
                        <button className="register-btn" onClick={() => setShowRegisterModal(true)}>
                            Register Now
                        </button>
                        <button className="signin-btn" onClick={() => setShowLoginModal(true)}>
                            Sign In
                        </button>
                    </div>
                )}
            </div>

            {showAddStoryModal && (
                <AddStoryModal
                    closeModal={() => {
                        setShowAddStoryModal(false);
                        setEditingStory(null);
                    }}
                    postStory={editingStory ? handleUpdateStory : handleAddStory}
                    editingStory={editingStory}
                />
            )}

            {showStoryModal && (
                <div className="story-modal">
                    <div className="modal-content">
                        <div className="modal-header">
                            <div className="progress-bar" style={{ width: `${(currentSlideIndex + 1) / showStoryModal.slides.length * 100}%` }}></div>
                            <div className="user-avatars">
                                <img src={showStoryModal.userAvatar} alt="User Avatar" />
                                <span className="avatar-badge">P</span>
                            </div>
                            <button onClick={() => setShowStoryModal(null)} className="close-btn">×</button>
                        </div>
                        {showStoryModal.slides[currentSlideIndex].videoUrl ? (
                            <video
                                src={showStoryModal.slides[currentSlideIndex].videoUrl}
                                controls
                                className="story-media"
                            >
                                Your browser does not support the video tag.
                            </video>
                        ) : (
                            <img
                                src={showStoryModal.slides[currentSlideIndex].imageUrl}
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
                            className={`nav-arrow next-arrow ${currentSlideIndex === showStoryModal.slides.length - 1 ? 'disabled' : ''}`}
                            disabled={currentSlideIndex === showStoryModal.slides.length - 1}
                        >
                            &#8594;
                        </button>

                        <div className="modal-footer">
                            <button onClick={() => handleLike(showStoryModal._id)} className="action-btn like-btn">
                                {likes[showStoryModal._id]?.isLiked ? <FaHeart color="red" /> : <FaRegHeart />}
                                <span>{likes[showStoryModal._id]?.count || showStoryModal.likes || 0}</span>
                            </button>
                            <button
                                onClick={() => handleDownload(showStoryModal.slides[currentSlideIndex].imageUrl, showStoryModal._id)}
                                className="action-btn download-btn"
                            >
                                {downloadedImages[showStoryModal._id] ? <FaCheck /> : <FaDownload />}
                            </button>
                            <button onClick={handleShare} className="action-btn share-btn">
                                <FaShareAlt />
                            </button>
                            <button onClick={() => handleBookmark(showStoryModal._id)} className="action-btn bookmark-btn">
                                {bookmarks[showStoryModal._id] ? <FaBookmark color="blue" /> : <FaRegBookmark />}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showBookmarks && (
                <div className="bookmarked-stories-section">
                    <h2>Your Bookmarks</h2>
                    <div className="story-list">
                        {bookmarkedStories.map((story, idx) => (
                            <div
                                key={idx}
                                className="story-box"
                                style={{
                                    backgroundImage: `url(${story.slides[0].imageUrl})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                }}
                                onClick={() => openStoryModal(story, idx)}
                            >
                                <h3 className="story-heading">{story.slides[0].heading}</h3>
                                <p className="story-description">{story.slides[0].description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Category Selection */}
            <div className="categories-container">
                {categoryData.map((category, index) => (
                    <div
                        key={index}
                        className={`category-box ${selectedCategory === category.name ? 'active' : ''}`}
                        style={{ backgroundImage: `url(${category.imageUrl})` }}
                        onClick={() => setSelectedCategory(category.name)}
                    >
                        <span className="category-label">{category.name}</span>
                    </div>
                ))}
            </div>

            {/* Your Stories Section */}
            {token && (
                <div className="your-stories-section">
                    <h2>Your Stories</h2>
                    {userStories.length === 0 ? (
                        <p>You haven't created any stories yet.</p>
                    ) : (
                        <div className="story-list">
                            {userStories.map((story, idx) => (
                                <div
                                    key={idx}
                                    className="story-box"
                                    style={{
                                        backgroundImage: `url(${story.slides[0].imageUrl})`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                    }}
                                    onClick={() => openStoryModal(story, idx)}
                                >
                                    <h3 className="story-heading">{story.slides[0].heading}</h3>
                                    <button className="edit-btn" onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditStory(story);
                                    }}>
                                        <FaEdit /> Edit
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Show top stories */}
            {selectedCategory === 'All' ? (
                categoryData.slice(1).map((category, index) => {
                    const categoryStories = filteredStories(category.name).slice(0, 4);
                    return (
                        <div key={index} className="category-section">
                            <h2>Top Stories About {category.name}</h2>
                            {categoryStories.length === 0 ? (
                                <p>No stories available in this category.</p>
                            ) : (
                                <div className="story-list">
                                    {categoryStories.map((story, idx) => (
                                        <div
                                            key={idx}
                                            className="story-box"
                                            style={{
                                                backgroundImage: `url(${story.slides[0].imageUrl})`,
                                                backgroundSize: 'cover',
                                                backgroundPosition: 'center',
                                            }}
                                            onClick={() => openStoryModal(story, idx)}
                                        >
                                            <h3 className="story-heading">{story.slides[0].heading}</h3>
                                            {user && user._id === story.userId && (
                                                <button className="edit-btn" onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEditStory(story);
                                                }}>
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })
            ) : (
                <div className="category-section">
                    <h2>Top Stories About {selectedCategory}</h2>
                    {filteredStories(selectedCategory).length === 0 ? (
                        <p>No stories available in this category.</p>
                    ) : (
                        <div className="story-list">
                            {filteredStories(selectedCategory).slice(0, 4).map((story, idx) => (
                                <div
                                    key={idx}
                                    className="story-box"
                                    style={{
                                        backgroundImage: `url(${story.slides[0].imageUrl})`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                    }}
                                    onClick={() => openStoryModal(story, idx)}
                                >
                                    <h3 className="story-heading">{story.slides[0].heading}</h3>
                                    {user && user._id === story.userId && (
                                        <button className="edit-btn" onClick={(e) => {
                                            e.stopPropagation();
                                            handleEditStory(story);
                                        }}>
                                            <FaEdit /> Edit
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}


            {showRegisterModal && <Register closeModal={() => setShowRegisterModal(false)} />}
            {showLoginModal && <Login closeModal={() => setShowLoginModal(false)} onLogin={handleLogin} />}
        </div>
    );
}

export default Stories;







