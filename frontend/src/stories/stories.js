import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/stories.css';
import Register from '../user/signup';
import Login from '../user/login';
import { FaBookmark, FaPlus, FaCheck, FaUserCircle, FaEdit, FaHeart, FaRegHeart, FaDownload, FaShareAlt, FaRegBookmark } from 'react-icons/fa';
import { GiHamburgerMenu } from 'react-icons/gi';
import AddStoryModal from './addstory';
import { useNavigate, useLocation } from 'react-router-dom';
import StoryBox from './storybox';

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
    const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
    const [downloadedImages, setDownloadedImages] = useState({});
    const [visibleUserStories, setVisibleUserStories] = useState(4);
    const [isBookmarksActive, setIsBookmarksActive] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const token = localStorage.getItem("token");

    useEffect(() => {
        console.log(token);
        fetchStories();
        fetchUserData();
        if (token) {
            fetchUserStories();
            fetchBookmarkedStories();
        }
    }, [token]);

    useEffect(() => {
        const storyIdInUrl = new URLSearchParams(location.search).get('storyId');
        if (storyIdInUrl) {
            const story = stories.find(s => s._id === storyIdInUrl);
            if (story) {
                openStoryModal(story);
            }
        }
    }, [location, stories]);

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

    const handleCloseLoginModal = () => {
        console.log('close');
        setShowLoginModal(false);
    };

    const toggleBookmarksView = () => {
        setIsBookmarksActive(!isBookmarksActive);
        setShowBookmarksOnly(!showBookmarksOnly);
        if (!showBookmarksOnly) {
            fetchBookmarkedStories();
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

            setDownloadedImages(prev => ({ ...prev, [storyId]: true }));

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
        window.open(storyUrl, '_blank');
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
        navigate(`/story/${story._id}`);
        setShowStoryModal(story);
        setCurrentStoryIndex(index);
        setCurrentSlideIndex(0);
    };

    const closeStoryModal = () => {
        setShowStoryModal(null);
        navigate('/');
    };

    const filteredStories = (category) => {
        if (category === 'All') return stories;
        return stories.filter((story) => story.category === category.toLowerCase());
    };

    const handleSeeMore = () => {
        setVisibleUserStories(prevVisible => prevVisible + 4);
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
        fetchBookmarkedStories();
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
        <div className="stories">
            <div className="top-bar">
                {token ? (
                    <div className="user-buttons">
                        <button
                            className={`bookmark-btn ${isBookmarksActive ? 'active' : ''}`}
                            onClick={toggleBookmarksView}
                        >
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
                    closeModal={() => setShowAddStoryModal(false)}
                    postStory={editingStory ? handleUpdateStory : handleAddStory}
                    editingStory={editingStory}
                />
            )}

            {showBookmarksOnly ? (
                <div className="bookmarked-stories-section">
                    <h2>Your Bookmarks</h2>
                    <div className="story-list">
                        {bookmarkedStories.length === 0 ? (
                            <p>You have no bookmarked stories.</p>
                        ) : (
                            bookmarkedStories.map((bookmarkedStory, idx) => (
                                <StoryBox
                                    key={idx}
                                    story={{
                                        _id: bookmarkedStory.storyId,
                                        category: bookmarkedStory.category,
                                        slides: [{
                                            heading: bookmarkedStory.heading,
                                            description: bookmarkedStory.description,
                                            imageUrl: bookmarkedStory.imageUrl,
                                            videoUrl: bookmarkedStory.videoUrl
                                        }]
                                    }}
                                    onClick={() => openStoryModal({
                                        _id: bookmarkedStory.storyId,
                                        category: bookmarkedStory.category,
                                        slides: [{
                                            heading: bookmarkedStory.heading,
                                            description: bookmarkedStory.description,
                                            imageUrl: bookmarkedStory.imageUrl,
                                            videoUrl: bookmarkedStory.videoUrl
                                        }]
                                    }, bookmarkedStory.slideIndex)}
                                    showEditButton={false}
                                />
                            ))
                        )}
                    </div>
                    {bookmarkedStories.length > 4 && (
                        <button className="see-more-btn" onClick={handleSeeMore}>
                            See more
                        </button>
                    )}
                </div>
            ) : (
                <>
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
                                <>
                                    <div className="story-list">
                                        {userStories.map((story, idx) => (
                                            <StoryBox
                                                key={idx}
                                                story={story}
                                                onClick={() => openStoryModal(story, idx)}
                                                onEdit={handleEditStory}
                                                showEditButton={true}
                                            />
                                        ))}
                                    </div>
                                    {userStories.length > 4 && (
                                        <button className="see-more-btn" onClick={handleSeeMore}>
                                            See more
                                        </button>

                                    )}
                                </>


                            )}
                        </div>
                    )}

                    {/* Top Stories Section */}
                    {selectedCategory === 'All' ? (
                        categoryData.slice(1).map((category, index) => {
                            const categoryStories = filteredStories(category.name).slice(0, 4);
                            return (
                                <div key={index} className="category-section">
                                    <h2>Top Stories About {category.name}</h2>
                                    {categoryStories.length === 0 ? (
                                        <p>No stories available in this category.</p>
                                    ) : (
                                        <>
                                            <div className="story-list">
                                                {categoryStories.map((story, idx) => (
                                                    <StoryBox
                                                        key={idx}
                                                        story={story}
                                                        onClick={() => openStoryModal(story, idx)}
                                                        onEdit={handleEditStory}
                                                        showEditButton={user && user._id === story.userId}
                                                    />
                                                ))}
                                            </div>
                                            {userStories.length > 4 && (
                                                <button className="see-more-btn" onClick={handleSeeMore}>
                                                    See more
                                                </button>

                                            )}
                                        </>

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
                                <>
                                    <div className="story-list">
                                        {filteredStories(selectedCategory).slice(0, 4).map((story, idx) => (
                                            <StoryBox
                                                key={idx}
                                                story={story}
                                                onClick={() => openStoryModal(story, idx)}
                                                onEdit={handleEditStory}
                                                showEditButton={user && user._id === story.userId}
                                            />
                                        ))}
                                    </div>
                                    {filteredStories.length > 4 && (
                                        <button className="see-more-btn" onClick={handleSeeMore}>
                                            See more
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </>
            )}

            {showRegisterModal && <Register closeModal={() => setShowRegisterModal(false)} />}
            {showLoginModal && (
                <Login
                    closeModal={handleCloseLoginModal}
                    onLogin={handleLogin}
                />
            )}
        </div>
    );
}

export default Stories;







