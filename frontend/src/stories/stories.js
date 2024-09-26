import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/stories.css';
import Register from '../user/signup';
import Login from '../user/login';
import { FaBookmark, FaPlus, FaUserCircle, FaEdit } from 'react-icons/fa';
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
    const token = localStorage.getItem("token");

    useEffect(() => {
        fetchStories();
        fetchUserData();
        if (token) {
            fetchUserStories();
        }
    }, [token]);

    const fetchStories = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/stories/fetchstories', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setStories(response.data);
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

    const handleShare = () => {
        alert('Share functionality coming soon!');
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
                        <button className="bookmark-btn">
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
                                                    <FaEdit /> Edit
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

            {showStoryModal && (
                <div className="story-modal">
                    <div className="modal-content">
                        <h2>{showStoryModal.slides[currentSlideIndex].heading}</h2>
                        <img src={showStoryModal.slides[currentSlideIndex].imageUrl} alt="Story Slide" />
                        <p>{showStoryModal.slides[currentSlideIndex].description}</p>
                        <div className="modal-controls">
                            {currentSlideIndex > 0 && (
                                <button onClick={goToPreviousSlide} className="prev-btn">
                                    Prev
                                </button>
                            )}
                            {currentSlideIndex < showStoryModal.slides.length - 1 && (
                                <button onClick={goToNextSlide} className="next-btn">
                                    Next
                                </button>
                            )}
                        </div>
                        <div className="modal-actions">
                            <button onClick={handleShare}>Share</button>
                            <button onClick={() => setShowStoryModal(null)}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            {showRegisterModal && <Register closeModal={() => setShowRegisterModal(false)} />}
            {showLoginModal && <Login closeModal={() => setShowLoginModal(false)} onLogin={handleLogin} />}
        </div>
    );
}

export default Stories;







