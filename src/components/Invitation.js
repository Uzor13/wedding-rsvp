import React, {useState, useEffect, useRef} from 'react';
import {useParams} from 'react-router-dom';
import {QRCodeSVG} from 'qrcode.react';
import {CheckCircle, Download, Check, Heart} from 'lucide-react';
import html2pdf from 'html2pdf.js';

function Invitation() {
    const {uniqueId} = useParams();
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
        fetch(`${process.env.REACT_APP_SERVER_LINK}/api/rsvp/${uniqueId}`, {method: 'POST'})
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

    const contentRef = useRef(null);

    const handleDownload = () => {
        const element = contentRef.current;
        const opt = {
            margin: 10,
            filename: 'wedding_invitation.pdf',
            image: {type: 'jpeg', quality: 1},
            html2canvas: {scale: 2, useCORS: true},
            jsPDF: {unit: 'mm', format: 'a4', orientation: 'portrait'}
        };

        html2pdf().set(opt).from(element).save();
    };

    if (loading) return <div className="text-center mt-8">Loading...</div>;
    if (error) return <div className="text-center mt-8 text-red-500">{error}</div>;
    if (!guest) return <div className="text-center mt-8">Guest not found</div>;

    return (
        <div ref={contentRef}
             className="min-h-screen bg-white flex items-center justify-center p-4">
            <div className="bg-white border border-coffee rounded-lg shadow-lg p-8 max-w-md w-full text-center">
                <h1 className="text-5xl text-coffee mb-6">Wedding Invitation</h1>

                <div className="mb-6 flex items-center justify-center text-coffee">
                    <Heart size={24} className="mr-2 fill-coffee"/>
                    <span className="text-xl font-semibold">Christopher & Amaka</span>
                    <Heart size={24} className="ml-2 fill-coffee"/>
                </div>

                <p className="text-coffee-dark mb-6">
                    We joyfully invite you, <span className="font-semibold">{guest.name}</span>, to celebrate our
                    wedding day with us!
                </p>

                <div className="mb-6 space-y-2 text-coffee-dark">
                    <p><strong>Venue:</strong> Grand Hotel Ballroom</p>
                    <p><strong>Date:</strong> November 9, 2024</p>
                    <p><strong>Time:</strong> 9:00 AM</p>
                    <p><strong>Color of the Day:</strong> White and Coffee</p>
                </div>

                <div className="mb-6">
                    <QRCodeSVG value={`${process.env.REACT_SITE_LINK}/confirm-rsvp/${uniqueId}`} size={200}
                               className="mx-auto w-full"/>
                </div>

                <div className="mb-6">
                    <p className="text-sm text-coffee-light mb-2">Your RSVP PIN:</p>
                    <p className="text-2xl font-bold text-coffee">{guest.code}</p>
                </div>

                <p className="text-sm text-gray-900 mb-4">
                    Please present this QR code or PIN at the venue to confirm your attendance.
                </p>

                <div className="space-y-4">
                    {!rsvpConfirmed ? <button
                        className="bg-coffee hover:bg-coffee-dark text-white font-bold py-2 px-4 rounded-full w-full transition duration-300 flex items-center justify-center"
                        onClick={handleRSVP}
                    >
                        <Check size={18} className="mr-2"/>
                        Confirm RSVP
                    </button> : <div
                        className="mb-6 p-4 bg-green-100 rounded-lg flex items-center justify-center text-green-800">
                        <CheckCircle size={24} className="mr-2 text-green-600"/>
                        <span className="font-semibold">RSVP Confirmed</span>
                    </div>
                    }

                    <button
                        className="bg-white hover:bg-latte text-coffee font-semibold py-2 px-4 rounded-full w-full border border-coffee transition duration-300 flex items-center justify-center"
                        onClick={handleDownload}
                    >
                        <Download size={18} className="mr-2"/>
                        Download Invitation
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Invitation;