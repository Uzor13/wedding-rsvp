const AlertDialogHeader = ({ children }) => (
    <div className="mb-4">{children}</div>
);

const AlertDialogTitle = ({ children }) => (
    <p className="text-2xl font-semibold mb-2">{children}</p>
);

const AlertDialogDescription = ({ children }) => (
    <p className="text-gray-600">{children}</p>
);

const AlertDialogFooter = ({ children }) => (
    <div className="flex justify-end space-x-2 mt-4">{children}</div>
);

const AlertDialogCancel = ({ onClick, children }) => (
    <button
        onClick={onClick}
        className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
    >
        {children}
    </button>
);

const AlertDialogAction = ({ onClick, children, className }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-white rounded ${className}`}
    >
        {children}
    </button>
);


export { AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction };
