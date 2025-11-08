import React, {useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import axios from 'axios';
import {CheckCircle, CircleX} from 'lucide-react';
import {useSettings} from '../context/SettingsContext';
import {useAuth} from '../context/AuthContext';

const RSVPConfirmation = () => {
    const {uniqueId} = useParams();
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const {settings, selectedCoupleId} = useSettings();
    const {token, isAdmin, coupleId} = useAuth();

    useEffect(() => {
        const confirmRSVP = async () => {
            try {
                if (!token) return;
                if (isAdmin && !selectedCoupleId) return;
                const payload = {};
                const targetCoupleId = isAdmin ? selectedCoupleId : coupleId;
                if (targetCoupleId) {
                    payload.coupleId = targetCoupleId;
                }
                const response = await axios.post(`${process.env.REACT_APP_SERVER_LINK}/api/admin/confirm-rsvp/${uniqueId}`,
                    payload, {headers: {Authorization: `Bearer ${token}`}});
                setMessage(response.data.message);
            } catch (err) {
                setError(err.response?.data?.message || 'Verification failed');
            }
        };

        confirmRSVP();
    }, [uniqueId, token, selectedCoupleId, isAdmin, coupleId]);

    const theme = settings?.theme || {};
    const pageStyle = {
        backgroundColor: theme.qrBackgroundColor || '#F3F4F6',
        color: theme.qrTextColor || '#111827'
    };
    const cardStyle = {
        backgroundColor: '#FFFFFF',
        border: `2px solid ${theme.primaryColor || '#6F4E37'}`,
        color: theme.textColor || '#3D2B1F'
    };

    return (
        <div className="flex justify-center items-center min-h-screen" style={pageStyle}>
            <div className="p-6 rounded-lg text-center shadow-md max-w-lg w-full" style={cardStyle}>
                {settings?.eventTitle && (
                    <h1 className="text-3xl font-semibold mb-4">{settings.eventTitle}</h1>
                )}
                {message && (
                    <div className="flex flex-col justify-center items-center space-y-4">
                        <CheckCircle size={48} color="#16A34A"/>
                        <p className="text-2xl font-semibold">{message}</p>
                    </div>
                )}
                {error && (
                    <div className="flex flex-col justify-center items-center space-y-4">
                        <CircleX size={48} color="#DC2626"/>
                        <p className="text-2xl font-semibold">{error}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RSVPConfirmation;