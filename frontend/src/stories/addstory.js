import React, { useState } from 'react';
import axios from 'axios';
import '../styles/addstory.css';

const AddStoryModal = ({ closeModal, postStory }) => {
    const [slides, setSlides] = useState([{ id: 1, heading: '', description: '', imageUrl: '', videoUrl: '' }]);
    const [currentSlide, setCurrentSlide] = useState(1);
    const [category, setCategory] = useState('');
    const token = localStorage.getItem('token');

    // List of predefined categories
    const categories = ['Food', 'Travel', 'World', 'Sports', 'Technology', 'Health', 'Science', 'Business', 'Entertainment', 'Politics'];

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
        if (slides.length > 1) {
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
        // Validate that each slide has either an image or video URL
        const isValid = slides.every(slide => slide.imageUrl || slide.videoUrl);
        if (!isValid) {
            alert("Each slide must have either an image or video URL.");
            return;
        }

        const storyData = slides.map(slide => ({
            heading: slide.heading,
            description: slide.description,
            imageUrl: slide.imageUrl,
            videoUrl: slide.videoUrl,
        }));

        console.log('Posting story data:', {
            category,
            slides: storyData,
        });

        postStory({
            category,
            slides: storyData,
        });

        closeModal();
    };

    const handleMediaUrlChange = (e, slideId) => {
        const url = e.target.value;
        const isVideo = url.match(/\.(mp4|webm|ogg)$/i);
        setSlides(slides.map(slide =>
            slide.id === slideId
                ? {
                    ...slide,
                    imageUrl: isVideo ? '' : url,
                    videoUrl: isVideo ? url : ''
                }
                : slide
        ));
    };
    return (
        <div className="addstory">
            <div className="add-story-modal">
                <button className="close-modal-button" onClick={closeModal}>×</button>
                <div className="slide-tabs">
                    {slides.map((slide) => (
                        <div key={slide.id} className="slide-tab-container">
                            <button
                                className={`slide-tab ${currentSlide === slide.id ? 'active' : ''}`}
                                onClick={() => setCurrentSlide(slide.id)}
                            >
                                Slide {slide.id}
                                {currentSlide === slide.id && slides.length > 1 && slide.id !== 1 && (
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

                            {/* Scrolling Category Selection */}
                            <div className="form-group category-group">
                                <label htmlFor="category">Category :</label>
                                <select
                                    id="category"
                                    name="category"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="scrollable-dropdown" // Add a class for styling
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

                <div className="button-group">
                    <div>
                        <button className="btn previous" onClick={handlePrevious}>Previous</button>
                        <button className="btn next" onClick={handleNext}>Next</button>
                    </div>
                    <button className="btn post" onClick={handlePostStory}>Post</button>
                </div>
            </div>
        </div>
    );
};

export default AddStoryModal;


