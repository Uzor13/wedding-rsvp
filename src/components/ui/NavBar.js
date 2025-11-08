import React from 'react';
import {Link} from "react-router-dom";

const NavBar = () => {

    return (
        <nav className="bg-gray-800 p-4">
            <ul className="flex space-x-4">
                <li>
                    <Link to="/" className="text-white hover:text-gray-300">Add Guest</Link>
                </li>
                <li>
                    <Link to="/guests" className="text-white hover:text-gray-300">Guest List</Link>
                </li>
                <li>
                    <Link to="/verify" className="text-white hover:text-gray-300">Verify Guest</Link>
                </li>
                <li>
                    <Link to="/users/tags" className="text-white hover:text-gray-300">Assign Tags</Link>
                </li>
                <li>
                    <Link to="/settings" className="text-white hover:text-gray-300">Settings</Link>
                </li>
            </ul>
        </nav>
    );
};

export default NavBar;