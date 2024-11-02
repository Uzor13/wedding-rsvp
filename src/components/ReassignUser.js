import React, { useState } from 'react';
import axios from 'axios';

const ReassignUser = ({ userId, currentTagId, tags }) => {
    const [selectedTagId, setSelectedTagId] = useState(currentTagId);
    const [message, setMessage] = useState('');

    const handleReassign = async () => {
        try {
            const response = await axios.put(`${process.env.REACT_APP_SERVER_LINK}/api/tags/reassign`, {
                userId,
                newTagId: selectedTagId,
            });
            setMessage(response.data.message);
        } catch (error) {
            setMessage('Error reassigning user');
        }
    };

    return (
        <div>
            <select
                value={selectedTagId}
                onChange={(e) => setSelectedTagId(e.target.value)}
                className="border p-2 rounded-lg"
            >
                {tags.map(tag => (
                    <option key={tag._id} value={tag._id}>
                        {tag.name}
                    </option>
                ))}
            </select>

            <button
                onClick={handleReassign}
                className="ml-4 bg-blue-500 text-white px-4 py-2 rounded-lg"
            >
                Reassign User
            </button>

            {message && <p className="mt-2 text-green-600">{message}</p>}
        </div>
    );
};

export default ReassignUser;