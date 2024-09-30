import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/addstory.css';

const AddStoryModal = ({ closeModal, postStory, editingStory }) => {
    const [slides, setSlides] = useState([
        { id: 1, heading: '', description: '', imageUrl: '', videoUrl: '' },
        { id: 2, heading: '', description: '', imageUrl: '', videoUrl: '' },
        { id: 3, heading: '', description: '', imageUrl: '', videoUrl: '' }
    ]);
    const [currentSlide, setCurrentSlide] = useState(1);
    const [category, setCategory] = useState('');
    const [error, setError] = useState('');
    const token = localStorage.getItem('token');
    const isFirstSlide = currentSlide === slides[0].id;
    const isLastSlide = currentSlide === slides[slides.length - 1].id;
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    s
    const categories = ['Food', 'Medical', 'Technology', 'Travel', 'World', 'India', 'News'];

    useEffect(() => {
        if (editingStory) {
            const editedSlides = editingStory.slides.map((slide, index) => ({
                id: index + 1,
                heading: slide.heading,
                description: slide.description,
                imageUrl: slide.imageUrl || '',
                videoUrl: slide.videoUrl || ''
            }));

            while (editedSlides.length < 3) {
                editedSlides.push({
                    id: editedSlides.length + 1,
                    heading: '',
                    description: '',
                    imageUrl: '',
                    videoUrl: ''
                });
            }
            setSlides(editedSlides);
            setCategory(editingStory.category);
        } else {

            setSlides([
                { id: 1, heading: '', description: '', imageUrl: '', videoUrl: '' },
                { id: 2, heading: '', description: '', imageUrl: '', videoUrl: '' },
                { id: 3, heading: '', description: '', imageUrl: '', videoUrl: '' }
            ]);
            setCategory('');
        }
    }, [editingStory]);
    const handleInputChange = (e, slideId) => {
        const { name, value } = e.target;
        setSlides(slides.map(slide =>
            slide.id === slideId ? { ...slide, [name]: value } : slide
        ));
    };

    const addSlide = () => {
        if (slides.length < 6) {
            const newSlide = { id: slides.length + 1, heading: '', description: '', imageUrl: '', videoUrl: '' };
            setSlides([...slides, newSlide]);
            setCurrentSlide(newSlide.id);
        }
    };

    const deleteSlide = (id) => {
        if (slides.length > 3) {
            const newSlides = slides.filter(slide => slide.id !== id);
            setCurrentSlide(newSlides[0].id);
            setSlides(newSlides);
        }
    };

    const handlePrevious = () => {
        const index = slides.findIndex(slide => slide.id === currentSlide);
        if (index > 0) {
            setCurrentSlide(slides[index - 1].id);
        }
    };

    const handleNext = () => {
        const index = slides.findIndex(slide => slide.id === currentSlide);
        if (index < slides.length - 1) {
            setCurrentSlide(slides[index + 1].id);
        }
    };

    const handlePostStory = async () => {
        if (!category) {
            setError("Please select a category");
            return;
        }
        const isValid = slides.every(slide => slide.imageUrl || slide.videoUrl);
        if (!isValid) {
            setError("Please fill all fields.");
            return;
        }

        const storyData = {
            category,
            slides: slides.map(slide => ({
                heading: slide.heading,
                description: slide.description,
                imageUrl: slide.imageUrl,
                videoUrl: slide.videoUrl,
            }))
        };

        try {
            if (editingStory) {
                await postStory(storyData);
            } else {
                await postStory(storyData);
            }
            closeModal();
        } catch (error) {
            console.error('Error posting/updating story:', error);
            setError('Failed to save the story. Please try again.');
        }
    };

    const checkVideoDuration = (url) => {
        return new Promise((resolve, reject) => {
            const video = document.createElement('video');
            video.onloadedmetadata = () => {
                if (video.duration > 15) {
                    reject(new Error('Video duration exceeds 15 seconds'));
                } else {
                    resolve(url);
                }
            };
            video.onerror = () => reject(new Error('Invalid video URL'));
            video.src = url;
        });
    };

    const handleMediaUrlChange = async (e, slideId) => {
        const url = e.target.value;
        const isVideo = url.match(/\.(mp4|webm|ogg)$/i);

        if (isVideo) {
            try {
                await checkVideoDuration(url);
                setError('');
                setSlides(slides.map(slide =>
                    slide.id === slideId
                        ? { ...slide, imageUrl: '', videoUrl: url }
                        : slide
                ));
            } catch (error) {
                setError(error.message);
            }
        } else {
            setError('');
            setSlides(slides.map(slide =>
                slide.id === slideId
                    ? { ...slide, imageUrl: url, videoUrl: '' }
                    : slide
            ));
        }
    };



    return (
        <div className="addstory">
            <div className="add-story-modal">
                {isMobile && (
                    <div className="modalheader"><h2>Add Story To Feed</h2></div>
                )}
                <button className="close-modal-button" onClick={closeModal}>×</button>
                <div className="slideandinput">
                    <div className="slide-tabs">
                        {slides.map((slide) => (
                            <div key={slide.id} className="slide-tab-container">
                                <button
                                    className={`slide-tab ${currentSlide === slide.id ? 'active' : ''}`}
                                    onClick={() => setCurrentSlide(slide.id)}
                                >
                                    Slide {slide.id}
                                    {slides.length > 3 && slide.id !== 1 && slide.id !== 2 && slide.id !== 3 && (
                                        <button className="delete-slide" onClick={() => deleteSlide(slide.id)}>×</button>
                                    )}
                                </button>
                            </div>
                        ))}
                        {slides.length < 6 && (
                            <button className="slide-tab add-slide" onClick={addSlide}>Add +</button>
                        )}
                    </div>
                    {slides.map((slide) => (
                        <div key={slide.id} className={`form-container ${currentSlide === slide.id ? '' : 'hidden'}`}>
                            <div className="form-group">
                                <label htmlFor={`heading-${slide.id}`}>Heading :</label>
                                <input
                                    type="text"
                                    id={`heading-${slide.id}`}
                                    name="heading"
                                    placeholder="Your heading"
                                    value={slide.heading}
                                    onChange={(e) => handleInputChange(e, slide.id)}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor={`description-${slide.id}`}>Description :</label>
                                <textarea
                                    id={`description-${slide.id}`}
                                    name="description"
                                    placeholder="Story Description"
                                    value={slide.description}
                                    onChange={(e) => handleInputChange(e, slide.id)}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor={`mediaUrl-${slide.id}`}>Image/Video URL :</label>
                                <input
                                    type="text"
                                    id={`mediaUrl-${slide.id}`}
                                    name="mediaUrl"
                                    placeholder="Enter image or video URL"
                                    value={slide.imageUrl || slide.videoUrl}
                                    onChange={(e) => handleMediaUrlChange(e, slide.id)}
                                />
                                <div className="form-group category-group">
                                    <label htmlFor="category">Category :</label>
                                    <select
                                        id="category"
                                        name="category"
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="scrollable-dropdown"
                                    >
                                        <option value="">Select category</option>
                                        {categories.map((cat, index) => (
                                            <option key={index} value={cat.toLowerCase()}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {error && <div className="error-message">{error}</div>}
                <div className="button-group">
                    <div>
                        <button
                            className={`btn previous ${isFirstSlide ? 'disabled' : ''}`}
                            onClick={handlePrevious}
                            disabled={isFirstSlide}
                        >
                            Previous
                        </button>
                        <button
                            className={`btn next ${isLastSlide ? 'disabled' : ''}`}
                            onClick={handleNext}
                            disabled={isLastSlide}
                        >
                            Next
                        </button>
                    </div>
                    <button className="btn post" onClick={handlePostStory}>
                        {editingStory ? 'Update' : 'Post'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddStoryModal;

