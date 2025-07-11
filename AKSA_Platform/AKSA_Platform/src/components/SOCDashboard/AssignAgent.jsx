// src/pages/AssignAgent.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const AssignAgent = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6 mt-24 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          ← Back
        </button>
        <h2 className="text-2xl font-bold text-gray-800">Assign Agents</h2>
      </div>

      {/* Placeholder: Add your assign agent form or logic here */}
      <div className="bg-white p-6 rounded shadow-md">
        <p className="text-gray-600">This is where you can assign agents to users. Implement the logic here.</p>
      </div>
    </div>
  );
};

export default AssignAgent;
