import './App.css';
import {BrowserRouter as Router, Route, Routes, Link} from 'react-router-dom';
import Invitation from "./components/Invitation";
import GuestForm from "./components/GuestForm";
import GuestList from "./components/GuestList";
import VerifyGuest from "./components/VerifyGuest";

function App() {
    return (
        <Router>
            <div>
                <Routes>
                    <Route path="/" element={<GuestForm />} />
                    <Route path="/guests" element={<GuestList />} />
                    <Route path="/rsvp/:uniqueId" element={<Invitation />} />
                    <Route path="/verify" element={<VerifyGuest />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
