import {createContext, useContext, useEffect, useMemo, useState} from 'react';

const STORAGE_KEY = 'wedding_rsvp_session';

const AuthContext = createContext();

export const AuthProvider = ({children}) => {
    const [session, setSession] = useState(() => {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        try {
            return JSON.parse(raw);
        } catch (e) {
            return null;
        }
    });

    useEffect(() => {
        if (session) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
        } else {
            localStorage.removeItem(STORAGE_KEY);
        }
    }, [session]);

    const value = useMemo(() => {
        const token = session?.token || null;
        const role = session?.role || null;
        const coupleId = session?.couple?.id || null;
        return {
            session,
            token,
            role,
            coupleId,
            isAdmin: role === 'admin',
            isCouple: role === 'couple',
            setSession,
            logout: () => setSession(null)
        };
    }, [session]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

