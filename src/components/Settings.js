import {useEffect, useMemo, useState} from 'react';
import axios from 'axios';
import {useNavigate} from 'react-router-dom';
import NavBar from './ui/NavBar';
import {useSettings} from '../context/SettingsContext';

const defaultSettings = {
    eventTitle: 'Wedding Invitation',
    coupleNames: 'Chris & Amaka',
    eventDate: 'November 9, 2024',
    eventTime: '2:00 PM',
    venueName: 'Space and Function Event Center',
    venueAddress: 'City Park, Ahmadu Bello Way, Wuse 2, Abuja',
    colorOfDay: 'White, Coffee and Beige',
    theme: {
        primaryColor: '#6F4E37',
        secondaryColor: '#8B7355',
        accentColor: '#F5E9D3',
        backgroundColor: '#FFFFFF',
        textColor: '#3D2B1F',
        qrBackgroundColor: '#F9FAFB',
        qrTextColor: '#111827',
        buttonColor: '#6F4E37',
        buttonTextColor: '#FFFFFF'
    }
};

const Settings = () => {
    const navigate = useNavigate();
    const {settings, refreshSettings} = useSettings();
    const [formState, setFormState] = useState(() => ({
        ...defaultSettings,
        theme: {...defaultSettings.theme}
    }));
    const [status, setStatus] = useState(null);

    const mergedTheme = useMemo(() => {
        return {...defaultSettings.theme, ...(settings?.theme || {})};
    }, [settings]);

    useEffect(() => {
        if (settings) {
            setFormState({
                eventTitle: settings.eventTitle || defaultSettings.eventTitle,
                coupleNames: settings.coupleNames || defaultSettings.coupleNames,
                eventDate: settings.eventDate || defaultSettings.eventDate,
                eventTime: settings.eventTime || defaultSettings.eventTime,
                venueName: settings.venueName || defaultSettings.venueName,
                venueAddress: settings.venueAddress || defaultSettings.venueAddress,
                colorOfDay: settings.colorOfDay || defaultSettings.colorOfDay,
                theme: mergedTheme
            });
        }
    }, [settings, mergedTheme]);

    const handleChange = (field) => (event) => {
        const value = event.target.value;
        setFormState((prev) => ({
            ...prev,
            [field]: value
        }));
    };

    const handleThemeChange = (field) => (event) => {
        const value = event.target.value;
        setFormState((prev) => ({
            ...prev,
            theme: {
                ...prev.theme,
                [field]: value
            }
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setStatus({type: 'loading'});
        try {
            const token = localStorage.getItem('adminToken');
            if (!token) {
                navigate('/login');
                return;
            }

            await axios.put(
                `${process.env.REACT_APP_SERVER_LINK}/api/settings`,
                formState,
                {headers: {Authorization: `Bearer ${token}`}}
            );

            await refreshSettings();
            setStatus({type: 'success', message: 'Settings updated successfully'});
        } catch (error) {
            if (error.response?.status === 401) {
                navigate('/login');
                return;
            }
            setStatus({type: 'error', message: error.response?.data?.message || 'Failed to update settings'});
        }
    };

    const theme = formState.theme || defaultSettings.theme;

    return (
        <>
            <NavBar/>
            <div className="max-w-4xl mx-auto mt-10 pb-10">
                <h1 className="text-3xl font-semibold mb-6">Event Settings</h1>
                <form onSubmit={handleSubmit} className="space-y-10">
                    <section className="bg-white shadow rounded p-6 space-y-4">
                        <h2 className="text-xl font-semibold">Event Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Invitation Title</label>
                                <input
                                    type="text"
                                    value={formState.eventTitle}
                                    onChange={handleChange('eventTitle')}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Couple Names</label>
                                <input
                                    type="text"
                                    value={formState.coupleNames}
                                    onChange={handleChange('coupleNames')}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Event Date</label>
                                <input
                                    type="text"
                                    value={formState.eventDate}
                                    onChange={handleChange('eventDate')}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Event Time</label>
                                <input
                                    type="text"
                                    value={formState.eventTime}
                                    onChange={handleChange('eventTime')}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Venue Name</label>
                                <input
                                    type="text"
                                    value={formState.venueName}
                                    onChange={handleChange('venueName')}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Venue Address</label>
                                <textarea
                                    value={formState.venueAddress}
                                    onChange={handleChange('venueAddress')}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    rows={3}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Color of the Day</label>
                                <input
                                    type="text"
                                    value={formState.colorOfDay}
                                    onChange={handleChange('colorOfDay')}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </section>

                    <section className="bg-white shadow rounded p-6 space-y-4">
                        <h2 className="text-xl font-semibold">Color Theme</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Primary Color</label>
                                <input
                                    type="color"
                                    value={theme.primaryColor}
                                    onChange={handleThemeChange('primaryColor')}
                                    className="mt-1 h-10 w-full border border-gray-300 rounded"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Secondary Color</label>
                                <input
                                    type="color"
                                    value={theme.secondaryColor}
                                    onChange={handleThemeChange('secondaryColor')}
                                    className="mt-1 h-10 w-full border border-gray-300 rounded"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Accent Color</label>
                                <input
                                    type="color"
                                    value={theme.accentColor}
                                    onChange={handleThemeChange('accentColor')}
                                    className="mt-1 h-10 w-full border border-gray-300 rounded"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Background Color</label>
                                <input
                                    type="color"
                                    value={theme.backgroundColor}
                                    onChange={handleThemeChange('backgroundColor')}
                                    className="mt-1 h-10 w-full border border-gray-300 rounded"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Text Color</label>
                                <input
                                    type="color"
                                    value={theme.textColor}
                                    onChange={handleThemeChange('textColor')}
                                    className="mt-1 h-10 w-full border border-gray-300 rounded"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Button Color</label>
                                <input
                                    type="color"
                                    value={theme.buttonColor}
                                    onChange={handleThemeChange('buttonColor')}
                                    className="mt-1 h-10 w-full border border-gray-300 rounded"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Button Text Color</label>
                                <input
                                    type="color"
                                    value={theme.buttonTextColor}
                                    onChange={handleThemeChange('buttonTextColor')}
                                    className="mt-1 h-10 w-full border border-gray-300 rounded"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">QR Page Background</label>
                                <input
                                    type="color"
                                    value={theme.qrBackgroundColor}
                                    onChange={handleThemeChange('qrBackgroundColor')}
                                    className="mt-1 h-10 w-full border border-gray-300 rounded"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">QR Page Text</label>
                                <input
                                    type="color"
                                    value={theme.qrTextColor}
                                    onChange={handleThemeChange('qrTextColor')}
                                    className="mt-1 h-10 w-full border border-gray-300 rounded"
                                />
                            </div>
                        </div>
                    </section>

                    <div className="flex items-center space-x-4">
                        <button
                            type="submit"
                            disabled={status?.type === 'loading'}
                            className="px-6 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                        >
                            {status?.type === 'loading' ? 'Saving...' : 'Save Settings'}
                        </button>
                        {status?.type === 'success' && (
                            <span className="text-green-600">{status.message}</span>
                        )}
                        {status?.type === 'error' && (
                            <span className="text-red-600">{status.message}</span>
                        )}
                    </div>
                </form>
            </div>
        </>
    );
};

export default Settings;

