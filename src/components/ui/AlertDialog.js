import React from 'react';

const AlertDialog = ({ open, onOpenChange, children }) => {
    if (!open) return null;
    return (
        <div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
            onClick={() => onOpenChange(false)}
        >
            <div
                className="bg-white rounded-lg shadow-lg p-4 w-11/12 max-w-md"
                onClick={(e) => e.stopPropagation()} // Prevents closing when clicking inside the dialog
            >
                {children}
            </div>
        </div>
    );
};

export default AlertDialog;