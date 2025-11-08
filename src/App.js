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

function PrivateRoute({children}) {
    const token = localStorage.getItem('adminToken');
    return token ? children : <Navigate to="/login"/>;
}

function App() {
    return (
        <SettingsProvider>
            <Router>
                <div>
                    <Routes>
                        <Route path="/login" element={<AdminLogin/>}/>
                        <Route path="/" element={
                            <PrivateRoute>
                                <GuestForm/>
                            </PrivateRoute>
                        }/>
                        <Route path="/guests" element={
                            <PrivateRoute>
                                <GuestList/>
                            </PrivateRoute>
                        }/>
                        <Route path="/rsvp/:uniqueId" element={<Invitation/>}/>
                        <Route path="/verify" element={
                            <PrivateRoute>
                                <VerifyGuest/>
                            </PrivateRoute>
                        }/>
                        <Route path="/confirm-rsvp/:uniqueId" element={
                            <PrivateRoute>
                                <RSVPConfirmation/>
                            </PrivateRoute>
                        }/>
                        <Route path="/users/tags" element={
                            <PrivateRoute>
                                <TagManagement/>
                            </PrivateRoute>
                        }/>
                        <Route path="/settings" element={
                            <PrivateRoute>
                                <Settings/>
                            </PrivateRoute>
                        }/>
                    </Routes>
                </div>
            </Router>
        </SettingsProvider>
    );
}

export default App;
