import React, { useState, useEffect } from 'react'
import StoryBox from './storybox'

export default function Filteredstories({ filteredStories, selectedCategory, openStoryModal }) {
    const [visibleUserStories, setVisibleUserStories] = useState(4);

    useEffect(() => {
        if (selectedCategory) {
            setVisibleUserStories(4)
        }

    }, [selectedCategory])


    return (
        <div className="category-section">
            <h2>Top Stories About {selectedCategory}</h2>
            {filteredStories(selectedCategory).length === 0 ? (
                <p>No stories available in this category.</p>
            ) : (
                <>

                    <div className="story-list">
                        {filteredStories(selectedCategory).slice(0, visibleUserStories).map((story, idx) => (
                            <StoryBox
                                key={idx}
                                story={story}
                                onClick={() => openStoryModal(story, idx)}

                            />
                        ))}
                    </div>
                    {filteredStories(selectedCategory).length > 4 && visibleUserStories % 4 == 0 && (
                        <button className="see-more-btn" onClick={() => setVisibleUserStories(prevVisible => prevVisible + 3)}>
                            See more
                        </button>
                    )}
                </>
            )
            }
        </div >
    )
}
