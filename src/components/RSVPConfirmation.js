import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import {CheckCircle, CircleX} from 'lucide-react'

const RSVPConfirmation = () => {
    const { uniqueId } = useParams();
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const confirmRSVP = async () => {
            try {
                const token = localStorage.getItem('adminToken');
                const response = await axios.post(`${process.env.REACT_APP_SERVER_LINK}/api/admin/confirm-rsvp/${uniqueId}`,
                    {}, {headers: {Authorization: `Bearer ${token}`}});
                setMessage(response.data.message);
            } catch (error) {
                console.log(error.response?.data?.message)
                setError(error.response?.data?.message || 'Verification failed');
            }
        };

        confirmRSVP().then(r => console.log(r));
    }, [uniqueId]);

    return (
        <div className="flex justify-center items-center h-screen">
            <div className="bg-white p-6 rounded-lg text-center">
                {message && (
                    <div className="flex flex-col justify-center items-center">
                        <CheckCircle size={48} className="mr-2 text-green-600"/>
                        <p className="text-4xl font-semibold">{message}</p>
                    </div>
                )}
                {error && (
                    <div className="flex flex-col justify-center items-center">
                        <CircleX size={48} className="mr-2 text-center text-red-600"/>
                        <p className="text-4xl font-semibold">{error}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RSVPConfirmation;