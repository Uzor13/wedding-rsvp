import {createContext, useCallback, useContext, useEffect, useState} from 'react';
import axios from 'axios';

const SettingsContext = createContext();

export const SettingsProvider = ({children}) => {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchSettings = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get(`${process.env.REACT_APP_SERVER_LINK}/api/settings/public`);
            setSettings(response.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    return (
        <SettingsContext.Provider value={{settings, loading, error, refreshSettings: fetchSettings, setSettings}}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => useContext(SettingsContext);

