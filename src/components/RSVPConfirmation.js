import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const RSVPConfirmation = () => {
    const { uniqueId } = useParams();
    const [message, setMessage] = useState('');

    useEffect(() => {
        const confirmRSVP = async () => {
            try {
                const token = localStorage.getItem('adminToken');
                const response = await axios.post(`${process.env.REACT_APP_SERVER_LINK}/admin/confirm-rsvp/${uniqueId}`,
                    {}, {headers: {Authorization: `Bearer ${token}`}});
                setMessage(response.data.message);
            } catch (error) {
                setMessage(error.response?.data?.message || 'RSVP confirmation failed');
            }
        };

        confirmRSVP().then(r => console.log(r));
    }, [uniqueId]);

    return (
        <div className="flex justify-center items-center h-screen">
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                <h2 className="text-2xl font-semibold">{message}</h2>
            </div>
        </div>
    );
};

export default RSVPConfirmation;