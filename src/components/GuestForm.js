import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {useNavigate} from "react-router-dom";
import NavBar from "./ui/NavBar";
import {useAuth} from "../context/AuthContext";
import {useSettings} from "../context/SettingsContext";

function GuestForm() {
    const {token, isAdmin, coupleId} = useAuth();
    const {selectedCoupleId, setSelectedCoupleId} = useSettings();
    const [couples, setCouples] = useState([]);
    const [tags, setTags] = useState([]);
    const [selectedTagId, setSelectedTagId] = useState('');
    const [name, setName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const loadCouples = async () => {
            if (!isAdmin || !token) return;
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_SERVER_LINK}/api/admin/couples`,
                    {headers: {Authorization: `Bearer ${token}`}}
                );
                setCouples(response.data);
                if (!selectedCoupleId && response.data.length > 0) {
                    setSelectedCoupleId(response.data[0]._id);
                }
            } catch (error) {
                console.error(error);
            }
        };

        loadCouples();
    }, [isAdmin, token, selectedCoupleId, setSelectedCoupleId]);

    useEffect(() => {
        const loadTags = async () => {
            if (!token) return;
            const targetCoupleId = isAdmin ? selectedCoupleId : coupleId;
            if (!targetCoupleId) {
                setTags([]);
                setSelectedTagId('');
                return;
            }

            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_SERVER_LINK}/api/tags`,
                    {
                        headers: {Authorization: `Bearer ${token}`},
                        params: {coupleId: targetCoupleId}
                    }
                );
                setTags(response.data);
                if (response.data.length > 0) {
                    setSelectedTagId((prev) => prev || response.data[0]._id);
                } else {
                    setSelectedTagId('');
                }
            } catch (error) {
                console.error(error);
            }
        };

        loadTags();
    }, [token, isAdmin, selectedCoupleId, coupleId]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setMessage('');

        const targetCoupleId = isAdmin ? selectedCoupleId : coupleId;
        if (!token) {
            navigate('/login');
            return;
        }
        if (!targetCoupleId) {
            setMessage('Select a couple before adding guests.');
            return;
        }
        if (!selectedTagId) {
            setMessage('Create a tag and select it before adding guests.');
            return;
        }

        try {
            await axios.post(
                `${process.env.REACT_APP_SERVER_LINK}/api/admin/add-guest`,
                {
                    name,
                    phoneNumber,
                    coupleId: targetCoupleId,
                    tagId: selectedTagId
                },
                {
                    headers: {Authorization: `Bearer ${token}`}
                }
            );
            setMessage('Guest added successfully.');
            setName('');
            setPhoneNumber('');
            if (tags.length > 0) {
                setSelectedTagId(tags[0]._id);
            }
        } catch (error) {
            if (error.response?.status === 401) {
                navigate('/login');
            } else {
                setMessage(error.response?.data?.message || 'Failed to add guest');
            }
        }
    };

    return (
        <>
            <NavBar/>
            <div className="max-w-xl mx-auto mt-10">
                <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 space-y-4">
                    {isAdmin && (
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="couple">
                                Couple
                            </label>
                            <select
                                id="couple"
                                value={selectedCoupleId || ''}
                                onChange={(event) => setSelectedCoupleId(event.target.value)}
                                className="shadow border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:shadow-outline"
                                required
                            >
                                <option value="" disabled>Select couple</option>
                                {couples.map((couple) => (
                                    <option key={couple._id} value={couple._id}>
                                        {couple.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                            Name
                        </label>
                        <input
                            className="shadow border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:shadow-outline"
                            id="name"
                            type="text"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phoneNumber">
                            Phone Number
                        </label>
                        <input
                            className="shadow border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:shadow-outline"
                            id="phoneNumber"
                            type="tel"
                            value={phoneNumber}
                            onChange={(event) => setPhoneNumber(event.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="tag">
                            Tag
                        </label>
                        {tags.length === 0 ? (
                            <p className="text-sm text-red-600">
                                No tags available. Create a tag in the Assign Tags page first.
                            </p>
                        ) : (
                            <select
                                id="tag"
                                value={selectedTagId}
                                onChange={(event) => setSelectedTagId(event.target.value)}
                                className="shadow border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:shadow-outline"
                                required
                            >
                                {tags.map((tag) => (
                                    <option key={tag._id} value={tag._id}>
                                        {tag.name}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>
                    <div className="flex items-center justify-between">
                        <button
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            type="submit"
                            disabled={tags.length === 0}
                        >
                            Add Guest
                        </button>
                    </div>
                </form>
                {message && (
                    <p className="text-center text-gray-700 font-bold">{message}</p>
                )}
            </div>
        </>
    );
}

export default GuestForm;
