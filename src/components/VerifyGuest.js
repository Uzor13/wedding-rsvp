// VerifyGuest.js

import React, {useState, useRef} from 'react';
import axios from 'axios';
import QrReader from '@yudiel/react-qr-scanner';
import {Link} from "react-router-dom";

function VerifyGuest() {
    const [code, setCode] = useState('');
    const [message, setMessage] = useState('');
    // const [scannerOpen, setScannerOpen] = useState(false);
    // const qrReaderRef = useRef(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        await verifyCode(code);
    };

    const verifyCode = async (codeToVerify) => {
        setMessage('');
        try {
            const response = await axios.post(`${process.env.REACT_APP_SERVER_LINK}/api/verify`, {
                uniqueId: codeToVerify,
                code: codeToVerify
            });
            setMessage(`Verification successful. Welcome, ${response.data.guestName}!`);
        } catch (error) {
            setMessage(error.response?.data?.message || 'Verification failed');
        }
        setCode('');
    };

    // const handleScan = async (data) => {
    //     if (data) {
    //         setScannerOpen(false);
    //         await verifyCode(data);
    //     }
    // };
    //
    // const handleError = (err) => {
    //     console.error(err);
    //     setMessage('QR scan error. Please try again.');
    // };

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
                <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                    {/*<div className="mb-4">*/}
                    {/*    <button*/}
                    {/*        onClick={() => setScannerOpen(!scannerOpen)}*/}
                    {/*        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-4"*/}
                    {/*    >*/}
                    {/*        {scannerOpen ? 'Close QR Scanner' : 'Open QR Scanner'}*/}
                    {/*    </button>*/}
                    {/*    {scannerOpen && (*/}
                    {/*        <QrReader*/}
                    {/*            ref={qrReaderRef}*/}
                    {/*            delay={300}*/}
                    {/*            onError={handleError}*/}
                    {/*            onScan={handleScan}*/}
                    {/*            style={{ width: '100%' }}*/}
                    {/*        />*/}
                    {/*    )}*/}
                    {/*</div>*/}
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="code">
                                Enter 4-Digit Code
                            </label>
                            <input
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                id="code"
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                required
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <button
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                type="submit"
                            >
                                Verify
                            </button>
                        </div>
                    </form>
                </div>
                {message && (
                    <p className="text-center text-green-500 font-bold">{message}</p>
                )}
            </div>
        </>
    );
}

export default VerifyGuest;