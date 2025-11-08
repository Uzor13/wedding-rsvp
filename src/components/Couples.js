import {useEffect, useState} from 'react';
import axios from 'axios';
import NavBar from "./ui/NavBar";
import {useAuth} from "../context/AuthContext";
import {useSettings} from "../context/SettingsContext";
import {useNavigate} from "react-router-dom";

const Couples = () => {
    const {token} = useAuth();
    const {selectedCoupleId, setSelectedCoupleId} = useSettings();
    const [couples, setCouples] = useState([]);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [credentials, setCredentials] = useState(null);
    const navigate = useNavigate();

    const fetchCouples = async () => {
        if (!token) return;
        try {
            setLoading(true);
            const {data} = await axios.get(`${process.env.REACT_APP_SERVER_LINK}/api/admin/couples`, {
                headers: {Authorization: `Bearer ${token}`}
            });
            setCouples(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load couples');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCouples();
    }, [token]);

    const handleCreate = async (event) => {
        event.preventDefault();
        if (!name.trim()) {
            setError('Name is required');
            return;
        }
        setError('');
        try {
            setLoading(true);
            const {data} = await axios.post(`${process.env.REACT_APP_SERVER_LINK}/api/admin/couples`, {
                name,
                email
            }, {
                headers: {Authorization: `Bearer ${token}`}
            });
            setCouples((prev) => [data.couple, ...prev]);
            if (!selectedCoupleId) {
                setSelectedCoupleId(data.couple._id);
            }
            setCredentials(data.credentials);
            setName('');
            setEmail('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create couple');
        } finally {
            setLoading(false);
        }
    };

    const handleManage = (coupleId) => {
        setSelectedCoupleId(coupleId);
        navigate('/guests');
    };

    return (
        <>
            <NavBar/>
            <div className="max-w-4xl mx-auto py-10 px-4 space-y-8">
                <div className="bg-white shadow rounded p-6 space-y-4">
                    <h1 className="text-2xl font-semibold">Add New Couple</h1>
                    <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full border border-gray-300 rounded px-3 py-2"
                                required
                            />
                        </div>
                        <div className="col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full border border-gray-300 rounded px-3 py-2"
                            />
                        </div>
                        <div className="col-span-1 md:col-span-2 flex items-center space-x-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60"
                            >
                                {loading ? 'Creating...' : 'Create Couple'}
                            </button>
                            {error && <span className="text-red-600 text-sm">{error}</span>}
                        </div>
                    </form>
                    {credentials && (
                        <div className="bg-blue-50 border border-blue-200 rounded p-4">
                            <h2 className="text-lg font-semibold mb-2">Generated Credentials</h2>
                            <p><span className="font-medium">Username:</span> {credentials.username}</p>
                            <p><span className="font-medium">Password:</span> {credentials.password}</p>
                            <p className="text-sm text-blue-700 mt-2">Share these credentials securely with the couple.
                                They will not be shown again.</p>
                        </div>
                    )}
                </div>

                <div className="bg-white shadow rounded p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold">Couples</h2>
                        <button
                            type="button"
                            onClick={fetchCouples}
                            className="px-3 py-1 text-sm bg-gray-100 border border-gray-300 rounded hover:bg-gray-200"
                        >
                            Refresh
                        </button>
                    </div>
                    {loading && couples.length === 0 ? (
                        <p>Loading...</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                {couples.map((couple) => (
                                    <tr key={couple._id} className={selectedCoupleId === couple._id ? 'bg-blue-50' : ''}>
                                        <td className="px-4 py-2 text-sm text-gray-900">{couple.name}</td>
                                        <td className="px-4 py-2 text-sm text-gray-500">{couple.email || '—'}</td>
                                        <td className="px-4 py-2 text-sm text-gray-500">{couple.username}</td>
                                        <td className="px-4 py-2 text-sm text-gray-500">
                                            {couple.createdAt ? new Date(couple.createdAt).toLocaleDateString() : '—'}
                                        </td>
                                        <td className="px-4 py-2 text-sm text-right space-x-2">
                                            <button
                                                type="button"
                                                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                                                onClick={() => handleManage(couple._id)}
                                            >
                                                Manage
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                            {couples.length === 0 && !loading && (
                                <p className="text-center text-gray-500 py-4">No couples yet. Add one above.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Couples;

