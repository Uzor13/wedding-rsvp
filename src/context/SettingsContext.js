import {createContext, useCallback, useContext, useEffect, useState} from 'react';
import axios from 'axios';
import {useAuth} from './AuthContext';

const SettingsContext = createContext();

export const SettingsProvider = ({children}) => {
    const {token, role, coupleId, isAdmin} = useAuth();
    const [selectedCoupleId, setSelectedCoupleId] = useState(coupleId || null);
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!isAdmin) {
            setSelectedCoupleId(coupleId || null);
        }
    }, [isAdmin, coupleId]);

    const fetchSettings = useCallback(async (overrides = {}) => {
        try {
            setLoading(true);
            setError(null);

            const targetCoupleId = overrides.coupleId !== undefined
                ? overrides.coupleId
                : (selectedCoupleId || coupleId || null);

            const hasToken = Boolean(token);
            const url = hasToken
                ? `${process.env.REACT_APP_SERVER_LINK}/api/settings`
                : `${process.env.REACT_APP_SERVER_LINK}/api/settings/public`;

            const params = {};
            if (targetCoupleId) {
                params.coupleId = targetCoupleId;
            }

            const config = {
                params
            };

            if (hasToken) {
                config.headers = {Authorization: `Bearer ${token}`};
            }

            const response = await axios.get(url, config);
            setSettings(response.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [token, selectedCoupleId, coupleId]);

    useEffect(() => {
        if (token || selectedCoupleId || !isAdmin) {
            fetchSettings();
        }
    }, [fetchSettings, token, selectedCoupleId, isAdmin]);

    return (
        <SettingsContext.Provider
            value={{
                settings,
                loading,
                error,
                refreshSettings: fetchSettings,
                setSettings,
                selectedCoupleId,
                setSelectedCoupleId
            }}
        >
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => useContext(SettingsContext);

