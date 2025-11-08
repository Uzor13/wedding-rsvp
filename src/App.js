import './App.css';
import {BrowserRouter as Router, Navigate, Route, Routes} from 'react-router-dom';
import Invitation from "./components/Invitation";
import GuestForm from "./components/GuestForm";
import GuestList from "./components/GuestList";
import VerifyGuest from "./components/VerifyGuest";
import AdminLogin from "./components/AdminLogin";
import RSVPConfirmation from "./components/RSVPConfirmation";
import TagManagement from "./components/Tag";
import Settings from "./components/Settings";
import {SettingsProvider} from "./context/SettingsContext";
import {AuthProvider, useAuth} from "./context/AuthContext";
import Couples from "./components/Couples";

function PrivateRoute({children, roles}) {
    const {session, role} = useAuth();
    if (!session) {
        return <Navigate to="/login"/>;
    }
    if (roles && !roles.includes(role)) {
        return <Navigate to="/login"/>;
    }
    return children;
}

function App() {
    return (
        <AuthProvider>
            <SettingsProvider>
                <Router>
                    <div>
                        <Routes>
                            <Route path="/login" element={<AdminLogin/>}/>
                            <Route path="/" element={
                                <PrivateRoute roles={['admin', 'couple']}>
                                    <GuestForm/>
                                </PrivateRoute>
                            }/>
                            <Route path="/guests" element={
                                <PrivateRoute roles={['admin', 'couple']}>
                                    <GuestList/>
                                </PrivateRoute>
                            }/>
                            <Route path="/rsvp/:uniqueId" element={<Invitation/>}/>
                            <Route path="/verify" element={
                                <PrivateRoute roles={['admin', 'couple']}>
                                    <VerifyGuest/>
                                </PrivateRoute>
                            }/>
                            <Route path="/confirm-rsvp/:uniqueId" element={
                                <PrivateRoute roles={['admin', 'couple']}>
                                    <RSVPConfirmation/>
                                </PrivateRoute>
                            }/>
                            <Route path="/users/tags" element={
                                <PrivateRoute roles={['admin', 'couple']}>
                                    <TagManagement/>
                                </PrivateRoute>
                            }/>
                            <Route path="/settings" element={
                                <PrivateRoute roles={['admin', 'couple']}>
                                    <Settings/>
                                </PrivateRoute>
                            }/>
                            <Route path="/couples" element={
                                <PrivateRoute roles={['admin']}>
                                    <Couples/>
                                </PrivateRoute>
                            }/>
                        </Routes>
                    </div>
                </Router>
            </SettingsProvider>
        </AuthProvider>
    );
}

export default App;
