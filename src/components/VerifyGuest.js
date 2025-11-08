import React, {useState} from 'react';
import axios from 'axios';
import {useNavigate} from "react-router-dom";
import NavBar from "./ui/NavBar";
import {useSettings} from "../context/SettingsContext";
import {useAuth} from "../context/AuthContext";

function VerifyGuest() {
    const [code, setCode] = useState('');
    const [message, setMessage] = useState('');
    const {settings, selectedCoupleId} = useSettings();
    const {token, isAdmin, coupleId} = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        await verifyCode(code);
    };

    const navigate = useNavigate();
    const verifyCode = async (codeToVerify) => {
        setMessage('');
        try {
            if (!token) {
                navigate('/login');
                return;
            }
            if (isAdmin && !selectedCoupleId) {
                setMessage('Select a couple before verifying.');
                return;
            }
            const payload = {
                uniqueId: codeToVerify,
                code: codeToVerify
            };
            const targetCoupleId = isAdmin ? selectedCoupleId : coupleId;
            if (targetCoupleId) {
                payload.coupleId = targetCoupleId;
            }
            const response = await axios.post(`${process.env.REACT_APP_SERVER_LINK}/api/admin/verify-guest`,
                payload,
                {
                    headers: {Authorization: `Bearer ${token}`},
                });
            setMessage(`Verification successful. Welcome, ${response.data.guestName}!`);
        } catch (error) {
            if (error.response?.status === 401) {
                navigate('/login');
            }
            setMessage(error.response?.data?.message || 'Verification failed');
        }
        setCode('');
    };

    const theme = settings?.theme || {};
    const pageStyle = {
        backgroundColor: theme.qrBackgroundColor || '#F3F4F6',
        color: theme.qrTextColor || '#111827'
    };
    const buttonStyle = {
        backgroundColor: theme.buttonColor || '#6F4E37',
        color: theme.buttonTextColor || '#FFFFFF'
    };

    return (
        <>
            <NavBar/>
            <div className="min-h-screen" style={pageStyle}>
                <div className="max-w-md mx-auto pt-24">
                    <div className="shadow-md rounded px-8 pt-6 pb-8 mb-4"
                         style={{backgroundColor: '#FFFFFF'}}>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-bold mb-2" htmlFor="code">
                                    Enter 4-Digit Code
                                </label>
                                <input
                                    className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
                                    style={{color: pageStyle.color}}
                                    id="code"
                                    type="text"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <button
                                    className="font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                    type="submit"
                                    style={buttonStyle}
                                >
                                    Verify
                                </button>
                            </div>
                        </form>
                    </div>
                    {message && (
                        <p className="text-center font-bold" style={{color: message.includes('successful') ? '#047857' : '#DC2626'}}>
                            {message}
                        </p>
                    )}
                </div>
            </div>
        </>
    );
}

export default VerifyGuest;