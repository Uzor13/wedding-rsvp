import React, {useState, useEffect, useCallback} from 'react';
import axios from 'axios';
import {Link} from "react-router-dom";
import {useDropzone} from 'react-dropzone';
import {CopyToClipboard} from "react-copy-to-clipboard/src";


function GuestList() {
    const [guests, setGuests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [copySuccess, setCopySuccess] = useState({});

    useEffect(() => {
        fetchGuests()
            .then(r => console.log("Guests returned"))
            .catch(e => console.log(e.message));
    }, []);

    const fetchGuests = async () => {
        try {
            const serverLink = process.env.REACT_APP_SERVER_LINK;
            const response = await axios.get(`${serverLink}/api/guests`);
            setGuests(response.data);
            setLoading(false);
        } catch (err) {
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
                const response = await axios.post(`${serverLink}/api/guests/import`, {csvData});
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
        const whatsappLink = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(`Here's your wedding invitation link: ${link}`)}`;
        window.open(whatsappLink, '_blank');
    };

    const sendSMS = async (phoneNumber, link) => {
        try {
            const serverLink = process.env.REACT_APP_SERVER_LINK;
            await axios.post(`${serverLink}/api/send-sms`, {phoneNumber, message: `Here's your wedding invitation link: ${link}`});
            alert('SMS sent successfully');
        } catch (error) {
            alert('Failed to send SMS');
        }
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
                    <h2 className="text-2xl font-semibold leading-tight">Guest List</h2>
                    <div {...getRootProps()}
                         className="dropzone mt-4 p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
                        <input {...getInputProps()} />
                        {
                            isDragActive ?
                                <p>Drop the CSV file here ...</p> :
                                <p>Drag 'n' drop a CSV file here, or click to select file</p>
                        }
                    </div>
                    <div className="my-2 flex sm:flex-row flex-col">
                        <div className="flex flex-row mb-1 sm:mb-0">
                            <div className="relative">
                                {/* Add filter options here if needed */}
                            </div>
                        </div>
                    </div>
                    <div className="-mx-4 sm:-mx-8 px-4 sm:px-8 py-4 overflow-x-auto">
                        <div className="inline-block min-w-full shadow rounded-lg overflow-hidden">
                            <table className="min-w-full leading-normal">
                                <thead>
                                <tr>
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
                                {guests.map((guest) => {
                                    const invitationLink = `${window.location.origin}/rsvp/${guest.uniqueId}`;
                                    return (
                                        <tr key={guest.uniqueId}>
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
                                                    className="text-purple-600 hover:text-purple-900"
                                                >
                                                    SMS
                                                </button>
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