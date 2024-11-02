import {X} from 'lucide-react'

const AlertDescription = ({ alert, setAlert }) => {
    return (
        <div className="flex justify-between items-center p-4 rounded-lg border border-gray-300">
            <span
                className={`${
                    alert.type === 'error' ? 'text-red-800' :
                        alert.type === 'success' ? 'text-green-800' :
                            'text-gray-800' // Default color for other alert types
                }`}
            >
                {alert.message}
            </span>
            <button
                onClick={() => setAlert(prev => ({ ...prev, visible: false }))}
                className="h-auto p-0 bg-transparent"
            >
                <X className="h-4 w-4" aria-hidden="true" />
            </button>
        </div>
    );
};

export default AlertDescription;
