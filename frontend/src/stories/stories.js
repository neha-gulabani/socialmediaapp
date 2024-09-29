import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/stories.css';
import Register from '../user/signup';
import Login from '../user/login';
import { FaBookmark, FaPlus, FaCheck, FaUserCircle, FaEdit, FaHeart, FaRegHeart, FaDownload, FaShareAlt, FaRegBookmark } from 'react-icons/fa';
import { GiHamburgerMenu } from 'react-icons/gi';
import AddStoryModal from './addstory';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import StoryBox from './storybox';
import StoryView from './storiesview';
import Yourstories from './yourstories';
import Filteredstories from './filteredstory';

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

    const [showAddStoryModal, setShowAddStoryModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [showStoryModal, setShowStoryModal] = useState(null);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [currentStoryIndex, setCurrentStoryIndex] = useState(null);
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const [user, setUser] = useState(null);
    const [showHamburgerMenu, setShowHamburgerMenu] = useState(false);
    const [bookmarkSlideIndex, setBookmarkSlideIndex] = useState(undefined);

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
    const [selectedStory, setSelectedStory] = useState(null);


    useEffect(() => {
        console.log(token);
        fetchStories();
        fetchUserData();
        if (token) {

            fetchBookmarkedStories();
        }
    }, [token]);

    useEffect(() => {
        const storyIdInUrl = new URLSearchParams(location.search).get('storyId');
        if (storyIdInUrl) {
            const story = stories.find(s => s._id === storyIdInUrl);
            if (story) {
                setSelectedStory(story);
            }
        }
    }, [location, stories]);

    const fetchBookmarkedStories = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/stories/bookmarked', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setBookmarkedStories(response.data);

            // Update bookmarks state
            const newBookmarks = {};
            response.data.forEach(story => {
                newBookmarks[story._id] = true;
            });
            setBookmarks(newBookmarks);
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

    const handleBookmark = async (storyId, slideIndex = 0) => {
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
                [storyId]: response.data.bookmarked
            }));

            // Refresh bookmarked stories if the story was bookmarked
            if (response.data.bookmarked) {
                fetchBookmarkedStories();
            }
        } catch (error) {
            console.error('Error bookmarking story:', error);
            alert('Failed to bookmark the story. Please try again.');
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
        setSelectedStory(story);
        navigate(`/?storyId=${story._id}`);

    };

    const openBookmarkIndex = (story, index) => {
        setBookmarkSlideIndex(index)
        setSelectedStory(story);
        navigate(`/?storyId=${story._id}`);

    }
    const closeStoryModal = () => {
        setSelectedStory(null);
        navigate('/');
    };

    const filteredStories = (category) => {
        if (category === 'All') return stories;
        return stories.filter((story) => story.category === category.toLowerCase());
    };

    const handleSeeMore = () => {
        setVisibleUserStories(prevVisible => prevVisible + 3);
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
        // fetchUserStories();
        fetchBookmarkedStories();
    };

    const toggleHamburgerMenu = () => {
        setShowHamburgerMenu((prev) => !prev);
    };

    const handleEditStory = (story) => {
        // setEditingStory(story);
        setShowAddStoryModal(true);
    };









    console.log(bookmarkedStories)



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
                                    onClick={() => openBookmarkIndex({
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
                        <Yourstories showAddStoryModal={showAddStoryModal} setStories={setStories} setShowAddStoryModal={setShowAddStoryModal} stories={stories} openStoryModal={openStoryModal} />
                    )}

                    {/* Top Stories Section */}
                    {selectedCategory === 'All' ? (
                        categoryData.slice(1).map((category, index) => {
                            const categoryStories = filteredStories(category.name).slice(0, 4);
                            return (
                                <div key={index} className="category-section">
                                    <Filteredstories filteredStories={filteredStories} selectedCategory={category.name} openStoryModal={openStoryModal} />
                                </div>
                            );
                        })
                    ) : (

                        <Filteredstories filteredStories={filteredStories} selectedCategory={selectedCategory} openStoryModal={openStoryModal} />

                    )}
                </>
            )
            }

            {showRegisterModal && <Register closeModal={() => setShowRegisterModal(false)} />}
            {
                showLoginModal && (
                    <Login
                        closeModal={handleCloseLoginModal}
                        onLogin={handleLogin}
                    />
                )
            }
            {
                selectedStory && (
                    <>
                        <StoryView selectedStory={selectedStory} setSelectedStory={setSelectedStory} bookmarkedIndex={bookmarkSlideIndex} setBookmarkSlideIndex={setBookmarkSlideIndex} />

                    </>
                )
            }
        </div >
    );
}

export default Stories;







