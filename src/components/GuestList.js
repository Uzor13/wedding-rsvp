import React, {useState, useEffect, useCallback} from 'react';
import {useNavigate} from 'react-router-dom';
import axios from 'axios';
import {Link} from "react-router-dom";
import {useDropzone} from 'react-dropzone';
import {CopyToClipboard} from "react-copy-to-clipboard/src";
import Alert from "./Alert";


function GuestList() {
    const [guests, setGuests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [copySuccess, setCopySuccess] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const [verificationFilter, setVerificationFilter] = useState('all');
    const [rsvpFilter, setRsvpFilter] = useState('all');
    const [alert, setAlert] = useState({ type: '', message: '', visible: false });

    const navigate = useNavigate();

    useEffect(() => {
        fetchGuests()
            .then(r => console.log("Guests returned"))
            .catch(e => console.log(e.message));
    }, []);

    const fetchGuests = async () => {
        try {
            const serverLink = process.env.REACT_APP_SERVER_LINK;
            const token = localStorage.getItem('adminToken');
            const response = await axios.get(`${serverLink}/api/admin/guests`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setGuests(response.data);
            setLoading(false);
        } catch (err) {
            if (err.response?.status === 401) {
                navigate('/login');
            }
            setError('Failed to fetch guests');
            setLoading(false);
        }
    };

    const onDrop = useCallback((acceptedFiles) => {
        const file = acceptedFiles[0];
        const reader = new FileReader();

        reader.onabort = () => console.log('file reading was aborted');
        reader.onerror = () => console.log('file reading has failed');
        reader.onload = async () => {
            const csvData = reader.result;
            try {
                const serverLink = process.env.REACT_APP_SERVER_LINK;
                const response = await axios.post(`${serverLink}/api/admin/guests/import`, {csvData});
                setGuests(response.data);
            } catch (error) {
                setError('Failed to import CSV');
            }
        };

        reader.readAsText(file);
    }, []);

    const handleCopy = (id) => {
        setCopySuccess({...copySuccess, [id]: true});
        setTimeout(() => {
            setCopySuccess({...copySuccess, [id]: false});
        }, 2000);
    };

    const sendWhatsApp = async (phoneNumber, link) => {
        const whatsappLink = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=
        ${encodeURIComponent(`Here's your wedding invitation link: ${link}`)}`;
        window.open(whatsappLink, '_blank');
    };

    const sendSMS = async (phoneNumber, link) => {
        try {
            const serverLink = process.env.REACT_APP_SERVER_LINK;
            await axios.post(`${serverLink}/api/send-sms`, {phoneNumber, message: `Here's your wedding invitation link: ${link}`});
            setAlert({
                type: 'success',
                message: 'SMS sent successfully!',
                visible: true,
            });
        } catch (error) {
            setAlert({
                type: 'error',
                message: 'Sorry, SMS was not sent',
                visible: true,
            });
        }
    };

    const deleteGuest = async (phoneNumber) => {
        try {
            const token = localStorage.getItem('adminToken');
            const serverLink = process.env.REACT_APP_SERVER_LINK;
            await axios.delete(`${serverLink}/api/admin/delete/${phoneNumber}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setAlert({
                type: 'success',
                message: 'Guest deleted successfully!',
                visible: true,
            });
        } catch (error) {
            setAlert({
                type: 'error',
                message: error.response?.data?.message || 'Error deleting guest',
                visible: true,
            });
        }
    };

    const filteredGuests = guests.filter((guest) => {
        const matchesSearch = guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            guest.phoneNumber.includes(searchQuery);

        const matchesVerification =
            verificationFilter === 'all' ||
            (verificationFilter === 'verified' && guest.isUsed) ||
            (verificationFilter === 'pending' && !guest.isUsed);

        const matchesRsvp =
            rsvpFilter === 'all' ||
            (rsvpFilter === 'confirmed' && guest.rsvpStatus) ||
            (rsvpFilter === 'pending' && !guest.rsvpStatus);

        return matchesSearch && matchesVerification && matchesRsvp;
    });

    const closeAlert = () => {
        setAlert({ ...alert, visible: false });
    };


    const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop});

    if (loading) return <div className="text-center mt-8">Loading...</div>;
    if (error) return <div className="text-center mt-8 text-red-500">{error}</div>;

    return (
        <>
            <nav className="bg-gray-800 p-4">
                <ul className="flex space-x-4">
                    <li>
                        <Link to="/" className="text-white hover:text-gray-300">Add Guest</Link>
                    </li>
                    <li>
                        <Link to="/guests" className="text-white hover:text-gray-300">Guest List</Link>
                    </li>
                    <li>
                        <Link to="/verify" className="text-white hover:text-gray-300">Verify Guest</Link>
                    </li>
                </ul>
            </nav>
            <div className="container mx-auto px-4 sm:px-8">
                <div className="py-8">
                    <h2 className="text-2xl font-sans font-semibold leading-tight">Guest List</h2>
                    <div {...getRootProps()}
                         className="dropzone mt-4 p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
                        <input {...getInputProps()} />
                        {
                            isDragActive ?
                                <p>Drop the CSV file here ...</p> :
                                <p>Drag 'n' drop a CSV file here, or click to select file</p>
                        }
                    </div>
                    <div
                        className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 md:space-x-4 mt-8 mb-6">
                        {/* Search Input */}
                        <input
                            type="text"
                            placeholder="Search by name or phone number"
                            className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-lg"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />

                        {/* Verification Status Filter */}
                        <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-2">
                            <label className="text-gray-700">Verification Status:</label>
                            <select
                                className="px-4 py-2 border border-gray-300 rounded-lg"
                                value={verificationFilter}
                                onChange={(e) => setVerificationFilter(e.target.value)}
                            >
                                <option value="all">All</option>
                                <option value="verified">Verified</option>
                                <option value="pending">Pending</option>
                            </select>
                        </div>

                        {/* RSVP Status Filter */}
                        <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-2">
                            <label className="text-gray-700">RSVP Status:</label>
                            <select
                                className="px-4 py-2 border border-gray-300 rounded-lg"
                                value={rsvpFilter}
                                onChange={(e) => setRsvpFilter(e.target.value)}
                            >
                                <option value="all">All</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="pending">Pending</option>
                            </select>
                        </div>
                    </div>
                    <div className="-mx-4 sm:-mx-8 px-4 sm:px-8 py-4 overflow-x-auto">
                        <div className="inline-block min-w-full shadow rounded-lg overflow-hidden">
                            <table className="min-w-full leading-normal">
                                <thead>
                                <tr>
                                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">S/N</th>
                                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Phone Number
                                    </th>
                                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Unique Code
                                    </th>
                                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Guest Verified
                                    </th>
                                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        RSVP Status
                                    </th>
                                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                                </thead>
                                <tbody>
                                {filteredGuests.map((guest, index) => {
                                    const invitationLink = `${window.location.origin}/rsvp/${guest.uniqueId}`;
                                    return (
                                        <tr key={guest.uniqueId}>
                                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                                <p className="text-gray-900 whitespace-no-wrap">{index + 1}</p>
                                            </td>
                                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                                <p className="text-gray-900 whitespace-no-wrap">{guest.name}</p>
                                            </td>
                                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                                <p className="text-gray-900 whitespace-no-wrap">{guest.phoneNumber}</p>
                                            </td>
                                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                                <p className="text-gray-900 whitespace-no-wrap">{guest.code}</p>
                                            </td>
                                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      <span
                          className={`relative inline-block px-3 py-1 font-semibold ${guest.isUsed ? 'text-green-900' : 'text-red-900'} leading-tight`}>
                        <span aria-hidden
                              className={`absolute inset-0 ${guest.isUsed ? 'bg-green-200' : 'bg-red-200'} opacity-50 rounded-full`}></span>
                        <span className="relative">{guest.isUsed ? 'Verified' : 'Pending'}</span>
                      </span>
                                            </td>
                                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      <span
                          className={`relative inline-block px-3 py-1 font-semibold ${guest.rsvpStatus ? 'text-green-900' : 'text-red-900'} leading-tight`}>
                        <span aria-hidden
                              className={`absolute inset-0 ${guest.rsvpStatus ? 'bg-green-200' : 'bg-red-200'} opacity-50 rounded-full`}></span>
                        <span className="relative">{guest.rsvpStatus ? 'Confirmed' : 'Pending'}</span>
                      </span>
                                            </td>
                                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                                <CopyToClipboard text={invitationLink}
                                                                 onCopy={() => handleCopy(guest.uniqueId)}>
                                                    <button className="text-blue-600 hover:text-blue-900 mr-2">
                                                        {copySuccess[guest.uniqueId] ? 'Copied!' : 'Copy Link'}
                                                    </button>
                                                </CopyToClipboard>
                                                <button
                                                    onClick={() => sendWhatsApp(guest.phoneNumber, invitationLink)}
                                                    className="text-green-600 hover:text-green-900 mr-2"
                                                >
                                                    WhatsApp
                                                </button>
                                                <button
                                                    onClick={() => sendSMS(guest.phoneNumber, invitationLink)}
                                                    className="text-purple-600 hover:text-purple-900 mr-2"
                                                >
                                                    SMS
                                                </button>
                                                <button
                                                    onClick={() => deleteGuest(guest.phoneNumber)}
                                                    className="text-red-500 hover:text-purple-900"
                                                >
                                                    Delete
                                                </button>
                                                {alert.visible && (
                                                    <Alert
                                                        type={alert.type}
                                                        message={alert.message}
                                                        onClose={closeAlert}
                                                    />
                                                )}
                                            </td>
                                        </tr>
                                    )
                                })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default GuestList;