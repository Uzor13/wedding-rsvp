import React from 'react';

const Alert = ({ type, message, onClose }) => {
    const alertStyles = {
        success: 'bg-green-100 border border-green-400 text-green-700',
        error: 'bg-red-100 border border-red-400 text-red-700',
        warning: 'bg-yellow-100 border border-yellow-400 text-yellow-700',
    };

    return (
        <div
            className={`fixed top-4 right-4 p-4 rounded-md shadow-md ${alertStyles[type]} flex items-center justify-between`}
            role="alert"
        >
            <span>{message}</span>
            <button onClick={onClose} className="ml-4 font-bold text-lg">&times;</button>
        </div>
    );
};

export default Alert;
