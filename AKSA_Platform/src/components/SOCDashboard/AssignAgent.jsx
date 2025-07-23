import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import DeviceManagement from './DeviceManagement';

const AssignAgent = () => {
    const navigate = useNavigate();

    return (
        <div className="h-screen bg-gray-50 overflow-y-auto scrollbar-hide">
            <Navbar />
            <div className="p-6 mt-24">
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                    >
                        ← Back
                    </button>
                    <h2 className="text-2xl font-bold text-gray-800">Assign Agents</h2>
                </div>
                <DeviceManagement />
                <div className="bg-white p-6 rounded shadow-md mt-6">
                    <p className="text-gray-600">This is where you can assign agents to users. Implement the logic here.</p>
                </div>
            </div>
        </div>
    );
};

export default AssignAgent;
