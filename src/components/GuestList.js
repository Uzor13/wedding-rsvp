import React, {useCallback, useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import axios from 'axios';
import {useDropzone} from 'react-dropzone';
import {CopyToClipboard} from "react-copy-to-clipboard/src";
import {ClipboardCopy, Send, Trash, Edit} from 'lucide-react';
import Alert from "./ui/Alert";
import NavBar from "./ui/NavBar";
import {useAuth} from "../context/AuthContext";
import {useSettings} from "../context/SettingsContext";


function GuestList() {
    const [guests, setGuests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [copySuccess, setCopySuccess] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const [verificationFilter, setVerificationFilter] = useState('all');
    const [rsvpFilter, setRsvpFilter] = useState('all');
    const [alert, setAlert] = useState({type: '', message: '', visible: false});
    const [selectedTag, setSelectedTag] = useState('all'); // Default to 'all' (no tag filter)
    const [tags, setTags] = useState([]);
    const [userTags, setUserTags] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);  // Track the selected user for reassignment
    const [newTagId, setNewTagId] = useState('');            // Track the selected new tag
    const [message, setMessage] = useState('');

    const navigate = useNavigate();
    const {token, isAdmin, coupleId} = useAuth();
    const {selectedCoupleId, setSelectedCoupleId} = useSettings();
    const [couples, setCouples] = useState([]);
    const currentCoupleId = isAdmin ? selectedCoupleId : coupleId;

    useEffect(() => {
        const loadCouples = async () => {
            if (!isAdmin || !token) return;
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_SERVER_LINK}/api/admin/couples`,
                    {headers: {Authorization: `Bearer ${token}`}}
                );
                setCouples(response.data);
                if (!selectedCoupleId && response.data.length > 0) {
                    setSelectedCoupleId(response.data[0]._id);
                }
            } catch (err) {
                console.error(err);
            }
        };
        loadCouples();
    }, [isAdmin, token, selectedCoupleId, setSelectedCoupleId]);

    const fetchGuests = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        if (isAdmin && !currentCoupleId) {
            setGuests([]);
            setLoading(false);
            return;
        }
        try {
            const serverLink = process.env.REACT_APP_SERVER_LINK;
            const response = await axios.get(`${serverLink}/api/admin/guests`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                params: isAdmin && currentCoupleId ? {coupleId: currentCoupleId} : {}
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
    }, [token, currentCoupleId, isAdmin, navigate]);

    const onDrop = useCallback((acceptedFiles) => {
        if (!token) {
            navigate('/login');
            return;
        }
        if (isAdmin && !currentCoupleId) {
            setError('Select a couple before importing guests.');
            return;
        }
        const file = acceptedFiles[0];
        const reader = new FileReader();

        reader.onabort = () => console.log('file reading was aborted');
        reader.onerror = () => console.log('file reading has failed');
        reader.onload = async () => {
            const csvData = reader.result;
            try {
                const serverLink = process.env.REACT_APP_SERVER_LINK;
                await axios.post(`${serverLink}/api/admin/import`, {csvData, coupleId: currentCoupleId}, {
                    headers: {Authorization: `Bearer ${token}`}
                });
                fetchGuests();
            } catch (error) {
                setError('Failed to import CSV');
            }
        };

        reader.readAsText(file);
    }, [currentCoupleId, token, fetchGuests]);

    const handleCopy = (id) => {
        setCopySuccess({...copySuccess, [id]: true});
        setTimeout(() => {
            setCopySuccess({...copySuccess, [id]: false});
        }, 2000);
    };

    function formatPhoneNumber(phoneNumber) {
        // Remove spaces and +234 if present
        let cleanedNumber = phoneNumber.replace(/\s+/g, '').replace(/^\+?234/, '');

        // Remove the first 0 if present
        cleanedNumber = cleanedNumber.replace(/^0/, '');

        // Add 234 to the beginning
        return '234' + cleanedNumber;
    }

    const sendSMS = async (phoneNumber, link, guestName) => {
        if (!token) return;
        if (isAdmin && !currentCoupleId) {
            setAlert({
                type: 'error',
                message: 'Select a couple before sending SMS.',
                visible: true,
            });
            return;
        }
        phoneNumber = formatPhoneNumber(phoneNumber);
        try {
            await axios.post(`${process.env.REACT_APP_SERVER_LINK}/api/admin/send-sms`,
                {
                    name: guestName,
                    phoneNumber: phoneNumber,
                    link: link,
                    coupleId: currentCoupleId
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
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
            if (!token) return;
            if (isAdmin && !currentCoupleId) {
                setAlert({
                    type: 'error',
                    message: 'Select a couple before deleting guests.',
                    visible: true,
                });
                return;
            }
            const serverLink = process.env.REACT_APP_SERVER_LINK;
            await axios.delete(`${serverLink}/api/admin/delete/${phoneNumber}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                params: isAdmin ? {coupleId: currentCoupleId} : {}
            });
            await fetchGuests();
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

    // Function to fetch tags
    const fetchTags = useCallback(async () => {
        if (!token) return;
        if (isAdmin && !currentCoupleId) {
            setTags([]);
            return;
        }
        setLoading(true);
        try {
            const serverLink = process.env.REACT_APP_SERVER_LINK;
            const {data} = await axios.get(`${serverLink}/api/tags`, {
                headers: {Authorization: `Bearer ${token}`},
                params: isAdmin ? {coupleId: currentCoupleId} : {}
            });
            setTags(data);
        } catch (error) {
           setAlert({type: 'error', message: 'Failed to fetch tags', visible: true, });
        } finally {
            setLoading(false);
        }
    }, [token, isAdmin, currentCoupleId]);

    // Function to fetch tags for users
    const fetchTagsMapForUsers = useCallback(async () => {
        if (!token) return;
        if (isAdmin && !currentCoupleId) {
            setUserTags({});
            return;
        }
        setLoading(true);
        try {
            const serverLink = process.env.REACT_APP_SERVER_LINK;
            const tagMap = {};
            const {data} = await axios.get(`${serverLink}/api/tags`, {
                headers: {Authorization: `Bearer ${token}`},
                params: isAdmin ? {coupleId: currentCoupleId} : {}
            });
            data.forEach((tag) => {
                tag.users.forEach((user) => {
                    tagMap[user._id] = tag.name;
                })
            });
            setUserTags(tagMap);
        } catch (error) {
            setAlert({type: 'error', message: 'Failed to fetch tags', visible: true, });
        } finally {
            setLoading(false);
        }
    }, [token, isAdmin, currentCoupleId]);

    const handleReassign = async () => {
        if (!selectedUser || !newTagId) return;

        try {
            if (!token) return;
            const response = await axios.put(`${process.env.REACT_APP_SERVER_LINK}/api/tags/reassign`, {
                userId: selectedUser._id,
                newTagId,
                coupleId: currentCoupleId
            }, {
                headers: {Authorization: `Bearer ${token}`}
            });

            setMessage(response.data.message || 'User reassigned successfully');

            // Update userTags map to show the new tag on the UI
            setUserTags((prevTags) => ({
                ...prevTags,
                [selectedUser._id]: tags.find(tag => tag._id === newTagId)?.name || "No tag",
            }));

            setModalOpen(false);  // Close modal
        } catch (error) {
            if (error.response?.status === 401) {
                navigate('/login');
                return;
            }
            setMessage('Error reassigning user');
        }
    };

    useEffect(() => {
        if (!token) return;
        if (isAdmin && !currentCoupleId) return;
        fetchGuests();
        fetchTags();
        fetchTagsMapForUsers();
    }, [fetchGuests, fetchTags, fetchTagsMapForUsers, currentCoupleId, token, isAdmin]);

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

        const tagUsers = tags.find(tag => tag._id === selectedTag)?.users || [];

        const matchesTag =
            selectedTag === 'all' ||
            tagUsers.some(user => user._id === guest._id);

        return matchesSearch && matchesVerification && matchesRsvp && matchesTag;
    });

    const closeAlert = () => {
        setAlert({...alert, visible: false});
    };

    const openReassignModal = (user) => {
        setSelectedUser(user);
        setModalOpen(true);
    };


    const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop});

    if (loading) return <div className="text-center mt-8">Loading...</div>;
    if (isAdmin && couples.length === 0) {
        return (
            <>
                <NavBar/>
                <div className="container mx-auto px-4 sm:px-8">
                    <div className="py-16 text-center">
                        <h2 className="text-2xl font-semibold mb-2">No couples found</h2>
                        <p className="text-gray-600">
                            Create a couple first from the Couples page to start managing guests.
                        </p>
                    </div>
                </div>
            </>
        );
    }
    if (error) return <div className="text-center mt-8 text-red-500">{error}</div>;

    return (
        <>
            <NavBar/>
            <div className="container mx-auto px-4 sm:px-8">
                <div className="py-8">
                    <h2 className="text-2xl font-sans font-semibold leading-tight">Guest List</h2>
                    {isAdmin && (
                        <div className="mt-4 max-w-xs">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Couple</label>
                            <select
                                value={selectedCoupleId || ''}
                                onChange={(e) => setSelectedCoupleId(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded"
                            >
                                <option value="" disabled>Select couple</option>
                                {couples.map((couple) => (
                                    <option key={couple._id} value={couple._id}>{couple.name}</option>
                                ))}
                            </select>
                        </div>
                    )}
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

                        {/* Tag Filter */}
                        <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-2">
                            <label className="text-gray-700">Tags:</label>
                            <select
                                className="px-4 py-2 border border-gray-300 rounded-lg"
                                value={selectedTag}
                                onChange={(e) => setSelectedTag(e.target.value)}
                            >
                                <option value="all">All</option>
                                {tags.map(tag => (
                                    <option key={tag._id} value={tag._id}>{tag.name}</option>
                                ))}
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
                                        Table Tag
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
                                    const tagName = userTags[guest._id] || "No tag";
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
                                                <p className="text-gray-900 whitespace-no-wrap">{tagName}</p>
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
                                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm flex space-x-2">
                                                {/* Copy Link */}
                                                <CopyToClipboard text={invitationLink}
                                                                 onCopy={() => handleCopy(guest.uniqueId)}>
                                                    <button className="text-blue-600 hover:text-blue-900">
                                                        <ClipboardCopy className="inline h-5 w-5"/>
                                                    </button>
                                                </CopyToClipboard>

                                                {/* Send SMS */}
                                                <button
                                                    onClick={() => sendSMS(guest.phoneNumber, invitationLink, guest.name)}
                                                    className="text-purple-600 hover:text-purple-900"
                                                >
                                                    <Send className="inline h-5 w-5"/>
                                                </button>

                                                {/* Delete Guest */}
                                                <button
                                                    onClick={() => deleteGuest(guest.phoneNumber)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <Trash className="inline h-5 w-5"/>
                                                </button>

                                                {/* Reassign Tag */}
                                                <button
                                                    onClick={() => openReassignModal(guest)}
                                                    className="text-green-500 hover:text-green-700"
                                                >
                                                    <Edit className="inline h-5 w-5"/>
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })}
                                </tbody>
                            </table>
                            {modalOpen && (
                                <div
                                    className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
                                    <div className="bg-white p-6 rounded-md w-96">
                                        <p className="text-xl text-center">Reassign Tag for {selectedUser.name}</p>
                                        <select
                                            value={newTagId}
                                            onChange={(e) => setNewTagId(e.target.value)}
                                            className="border p-2 mt-2 w-full"
                                        >
                                            <option value="">Select a new tag</option>
                                            {tags.map(tag => (
                                                <option key={tag._id} value={tag._id}>
                                                    {tag.name}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="mt-4 flex justify-end space-x-2">
                                            <button
                                                onClick={() => setModalOpen(false)}
                                                className="px-4 py-2 bg-gray-300 rounded"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleReassign}
                                                className="px-4 py-2 bg-blue-500 text-white rounded"
                                            >
                                                Confirm
                                            </button>
                                        </div>
                                        {message && <p className="mt-4 text-green-600 text-center">{message}</p>}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default GuestList;