import React, { useEffect, useState } from 'react'
import axios from 'axios';
import StoryBox from './storybox';
import AddStoryModal from './addstory';

export default function Yourstories({ showAddStoryModal, setStories, setShowAddStoryModal, stories, openStoryModal }) {

    const [userStories, setUserStories] = useState([]);
    const token = localStorage.getItem("token");
    const [visibleUserStories, setVisibleUserStories] = useState(4);
    const [editingStory, setEditingStory] = useState(null);


    const handleEditStory = (story) => {
        setEditingStory(story);
        setShowAddStoryModal(true);
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
            setStories((prev) => [...prev, response.data]);
            setUserStories([...userStories, response.data]);
            setShowAddStoryModal(false);
        } catch (error) {
            console.error('Error adding story:', error);
        }
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


    useEffect(() => {
        fetchUserStories()
    }, [token])
    return (
        <div className="your-stories-section">
            <h2>Your Stories</h2>
            {userStories.length === 0 ? (
                <p>You haven't created any stories yet.</p>
            ) : (
                <>
                    <div className="story-list">
                        {userStories.slice(0, visibleUserStories).map((story, idx) => (
                            <StoryBox
                                key={idx}
                                story={story}
                                onClick={() => openStoryModal(story, idx)}
                                onEdit={handleEditStory}
                                showEditButton={true}
                            />
                        ))}
                    </div>
                    {userStories.length > 4 && visibleUserStories % 4 == 0 && (
                        <button className="see-more-btn" onClick={() => setVisibleUserStories(prevVisible => prevVisible + 3)}>
                            See more
                        </button>

                    )}
                </>


            )
            }

            {
                showAddStoryModal && (
                    <AddStoryModal
                        closeModal={() => {
                            setShowAddStoryModal(false)
                            setEditingStory(null)
                        }}
                        postStory={editingStory ? handleUpdateStory : handleAddStory}
                        editingStory={editingStory}
                    />
                )
            }

        </div >
    )
}
