import './App.css';
import {BrowserRouter as Router, Route, Routes, Link} from 'react-router-dom';
import Invitation from "./components/Invitation";
import GuestForm from "./components/GuestForm";
import GuestList from "./components/GuestList";

function App() {
    return (
        <Router>
            <div>
                <nav className="bg-gray-800 p-4">
                    <ul className="flex space-x-4">
                        <li>
                            <Link to="/" className="text-white hover:text-gray-300">Add Guest</Link>
                        </li>
                        <li>
                            <Link to="/guests" className="text-white hover:text-gray-300">Guest List</Link>
                        </li>
                    </ul>
                </nav>
                <Routes>
                    <Route path="/" element={<GuestForm />} />
                    <Route path="/guests" element={<GuestList />} />
                    <Route path="/rsvp/:uniqueId" element={<Invitation />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
