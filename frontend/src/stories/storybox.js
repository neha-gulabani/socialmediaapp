import React, { useState, useEffect } from 'react';
import { FaEdit } from 'react-icons/fa';

const StoryBox = ({ story, onClick, onEdit }) => {
    const isVideo = story.slides[0].videoUrl && story.slides[0].videoUrl.trim() !== '';

    return (
        <div className='storybox-wrapper'>
            <div
                className="story-box"
                onClick={onClick}
            >

                {isVideo ? (
                    <video
                        src={story.slides[0].videoUrl}
                        autoPlay
                        loop
                        muted
                        style={{
                            position: 'relative',
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',


                        }}
                    />
                ) : (
                    <div
                        style={{
                            backgroundImage: `url(${story.slides[0].imageUrl})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            position: 'relative',
                            width: '100%',
                            height: '100%',

                        }}
                    />
                )}
                <div style={{ position: 'relative', zIndex: 1, bottom: 0 }}>
                    <h3 className="story-heading">{story.slides[0].heading}</h3>
                    <p className="story-description">{story.slides[0].description}</p>

                </div>

            </div>
            {onEdit ? (
                <button className="edit-btn" onClick={(e) => {
                    e.stopPropagation();
                    if (onEdit) {
                        onEdit(story);
                    }
                }}>
                    <FaEdit />
                    <span>Edit</span>
                </button>
            ) : null}
        </div>
    );
};

export default StoryBox