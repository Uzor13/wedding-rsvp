import React, {useState, useEffect, useRef} from 'react';
import {useParams} from 'react-router-dom';
import {QRCodeSVG} from 'qrcode.react';
import {CheckCircle, Download, Check, Heart} from 'lucide-react';
import html2pdf from 'html2pdf.js';
import axios from 'axios';
import {useSettings} from '../context/SettingsContext';

function Invitation() {
    const {uniqueId} = useParams();
    const {settings, loading: settingsLoading, error: settingsError} = useSettings();
    const [guest, setGuest] = useState(null);
    const [rsvpConfirmed, setRsvpConfirmed] = useState(false);
    const [guestLoading, setGuestLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tag, setTag] = useState(null);

    useEffect(() => {
        const loadGuest = async () => {
            try {
                setGuestLoading(true);
                setError(null);
                const response = await fetch(`${process.env.REACT_APP_SERVER_LINK}/api/guest/${uniqueId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch guest information');
                }
                const data = await response.json();
                setGuest(data);
                setRsvpConfirmed(data.rsvpStatus);
                try {
                    await fetchUserTag(data._id);
                } catch (tagError) {
                    setTag(null);
                }
            } catch (err) {
                setError(err.message);
                setTag(null);
            } finally {
                setGuestLoading(false);
            }
        };

        loadGuest();
    }, [uniqueId]);

    const fetchUserTag = async (userId) => {
        const response = await axios.get(`${process.env.REACT_APP_SERVER_LINK}/api/tags/user/${userId}`);
        setTag(response.data);
    };

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

    const isLoading = guestLoading || settingsLoading;
    const combinedError = error || settingsError;

    if (isLoading) return <div className="text-center mt-8">Loading...</div>;
    if (combinedError) return <div className="text-center mt-8 text-red-500">{combinedError}</div>;
    if (!guest) return <div className="text-center mt-8">Guest not found</div>;

    const theme = settings?.theme || {};
    const palette = {
        background: theme.backgroundColor || '#FFFFFF',
        text: theme.textColor || '#3D2B1F',
        primary: theme.primaryColor || '#6F4E37',
        secondary: theme.secondaryColor || '#8B7355',
        accent: theme.accentColor || '#F5E9D3',
        button: theme.buttonColor || theme.primaryColor || '#6F4E37',
        buttonText: theme.buttonTextColor || '#FFFFFF'
    };

    const eventTitle = settings?.eventTitle || 'Wedding Invitation';
    const coupleNames = settings?.coupleNames || 'Chris & Amaka';
    const eventDate = settings?.eventDate || 'November 9, 2024';
    const eventTime = settings?.eventTime || '2:00 PM';
    const venueName = settings?.venueName || 'Space and Function Event Center';
    const venueAddress = settings?.venueAddress || 'City Park, Ahmadu Bello Way, Wuse 2, Abuja';
    const colorOfDay = settings?.colorOfDay || 'White, Coffee and Beige';

    return (
        <div ref={contentRef}
             className="min-h-screen flex items-center justify-center p-4"
             style={{backgroundColor: palette.background, color: palette.text}}>
            <div
                className="rounded-lg shadow-lg p-8 max-w-md w-full text-center"
                style={{backgroundColor: '#FFFFFF', border: `2px solid ${palette.primary}`}}
            >
                <h1 className="text-5xl mb-6" style={{color: palette.primary}}>{eventTitle}</h1>

                <div className="mb-6 flex items-center justify-center" style={{color: palette.primary}}>
                    <Heart size={24} className="mr-2" color={palette.primary} fill={palette.primary}/>
                    <span className="text-xl font-semibold">{coupleNames}</span>
                    <Heart size={24} className="ml-2" color={palette.primary} fill={palette.primary}/>
                </div>

                <p className="mb-6" style={{color: palette.secondary}}>
                    We joyfully invite you, <span className="font-semibold">{guest.name}</span>, to celebrate our
                    wedding day with us!
                </p>

                <div className="mb-6 space-y-2" style={{color: palette.secondary}}>
                    <p><strong>Venue:</strong> {venueName}, <br/>{venueAddress}</p>
                    <p><strong>Date:</strong> {eventDate}</p>
                    <p><strong>Time:</strong> {eventTime}</p>
                    <p><strong>Color of the Day:</strong> {colorOfDay}</p>
                    <p><strong>NB:</strong> This admits only 1(One) person</p>
                    <p><strong>Guest Table Tag:</strong> {tag ? `${tag.name}` : 'No tag assigned to this guest'}</p>
                </div>

                <div className="mb-6">
                    <QRCodeSVG value={`${process.env.REACT_APP_SITE_LINK}/confirm-rsvp/${uniqueId}`} size={200}
                               className="mx-auto w-full break-before-auto break-after-avoid break-before-avoid"/>
                </div>

                <div className="mb-6">
                    <p className="text-sm mb-2" style={{color: palette.secondary}}>Your RSVP PIN:</p>
                    <p className="text-2xl font-bold" style={{color: palette.primary}}>{guest.code}</p>
                </div>

                <p className="text-sm text-gray-900 mb-4">
                    Please present this QR code or PIN to verify your invite at the venue.
                </p>

                <div className="space-y-4">
                    {!rsvpConfirmed ? (
                        <button
                            className="font-bold py-2 px-4 rounded-full w-full transition duration-300 flex items-center justify-center"
                            onClick={handleRSVP}
                            style={{backgroundColor: palette.button, color: palette.buttonText}}
                        >
                            <Check size={18} className="mr-2"/>
                            Confirm RSVP
                        </button>
                    ) : (
                        <div
                            className="mb-6 p-4 rounded-lg flex items-center justify-center"
                            style={{backgroundColor: '#DCFCE7', color: '#166534'}}
                        >
                            <CheckCircle size={24} className="mr-2"/>
                            <span className="font-semibold">RSVP Confirmed</span>
                        </div>
                    )}

                    <button
                        className="font-semibold py-2 px-4 rounded-full w-full transition duration-300 flex items-center justify-center border"
                        onClick={handleDownload}
                        style={{
                            backgroundColor: palette.accent,
                            color: palette.primary,
                            borderColor: palette.primary
                        }}
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
