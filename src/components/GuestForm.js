import React, {useState} from 'react';
import axios from 'axios';
import {Link} from "react-router-dom";

function GuestForm() {
    const [name, setName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            const response = await axios.post(`${process.env.REACT_APP_SERVER_LINK}/api/guests`, {
                name,
                phoneNumber
            });
            setMessage(`Guest added successfully. Unique link: ${response.data.uniqueLink}`);
            setName('');
            setPhoneNumber('');
        } catch (error) {
            setMessage(`Error: ${error.response?.data?.error || 'Failed to add guest'}`);
        }
    };

    return (
        <>
            <nav className="bg-gray-800 p-4">
                <ul className="flex space-x-4">
                    <li>
                        <Link to="/wedding-rsvp/public" className="text-white hover:text-gray-300">Add Guest</Link>
                    </li>
                    <li>
                        <Link to="/guests" className="text-white hover:text-gray-300">Guest List</Link>
                    </li>
                    <li>
                        <Link to="/verify" className="text-white hover:text-gray-300">Verify Guest</Link>
                    </li>
                </ul>
            </nav>
            <div className="max-w-md mx-auto mt-10">
                <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                            Name
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phoneNumber">
                            Phone Number
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="phoneNumber"
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            required
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <button
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            type="submit"
                        >
                            Add Guest
                        </button>
                    </div>
                </form>
                {message && (
                    <p className="text-center text-green-500 font-bold">{message}</p>
                )}
            </div>
        </>
    );
}

export default GuestForm;