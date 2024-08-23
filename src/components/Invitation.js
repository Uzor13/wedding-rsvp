import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import QRCode from 'qrcode.react';
import axios from "axios";

function Invitation() {
    const { uniqueId } = useParams();
    const [guest, setGuest] = useState(null);
    const [rsvpConfirmed, setRsvpConfirmed] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch(`${process.env.REACT_APP_SERVER_LINK}/api/guest/${uniqueId}`)
            .then(res => {
                if (!res.ok) {
                    throw new Error('Failed to fetch guest information');
                }
                return res.json();
            })
            .then(data => {
                setGuest(data);
                setRsvpConfirmed(data.rsvpStatus);
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [uniqueId]);

    const handleRSVP = () => {
        fetch(`${process.env.REACT_APP_SERVER_LINK}/api/rsvp/${uniqueId}`, { method: 'POST' })
            .then(res => {
                if (!res.ok) {
                    throw new Error('Failed to confirm RSVP');
                }
                return res.json();
            })
            .then(data => {
                if (data.success) {
                    setRsvpConfirmed(true);
                }
            })
            .catch(err => setError(err.message));
    };

    const handleDownloadPDF = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_SERVER_LINK}/api/invitation/${uniqueId}/pdf`, {
                responseType: 'blob'
            });
            const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
            const pdfUrl = URL.createObjectURL(pdfBlob);
            const link = document.createElement('a');
            link.href = pdfUrl;
            link.download = `invitation_${guest.name}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            setError('Failed to download PDF');
        }
    };

    if (loading) return <div className="text-center mt-8">Loading...</div>;
    if (error) return <div className="text-center mt-8 text-red-500">{error}</div>;
    if (!guest) return <div className="text-center mt-8">Guest not found</div>;

    return (
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl m-4">
            <div className="p-8">
                <h2 className="text-2xl font-bold mb-2">Wedding Invitation</h2>
                <p className="text-gray-600 mb-4">Dear {guest.name},</p>
                <p className="mb-4">You are cordially invited to our wedding celebration.</p>
                {!rsvpConfirmed ? (
                    <button
                        onClick={handleRSVP}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        Confirm RSVP
                    </button>
                ) : (
                    <p className="text-green-600">RSVP Confirmed!</p>
                )}
                <div className="mt-4">
                    <QRCode value={`http://localhost:3001/rsvp/${uniqueId}`} />
                </div>
                <div className="mt-4">
                    <p>Your unique code is <span className="font-bold">{guest.code}</span>,
                        which you can also present at the venue to confirm your RSVP.</p>
                </div>
                <button
                    onClick={handleDownloadPDF}
                    className="mt-4 bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                >
                    Download Invitation
                </button>
            </div>
        </div>
    );
}

export default Invitation;