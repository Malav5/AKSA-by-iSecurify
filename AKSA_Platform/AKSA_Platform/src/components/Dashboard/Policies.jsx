// src/Policies.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { X } from 'lucide-react'; // Close icon

const policiesList = [
  {
    category: 'General Security Policies',
    items: [
      'Acceptable Use Policy',
      'Anti‑Virus and Malware Policy',
      'Asset Management Policy',
      'Change Management Policy',
      'Code of Ethics Policy',
      'Corporate Policy Program',
    ],
  },
  {
    category: 'Data Management Policies',
    items: [
      'Data Access and Password Policy',
      'Data Back‑up Policy',
      'Data Classification Policy',
      'Data Retention Policy',
      'Encryption Policy',
    ],
  },
  {
    category: 'Facility and HR Policies',
    items: [
      'Facility Security Policy',
      'HR Corrective Action Procedure',
      'Human Resource Security Policy',
    ],
  },
  {
    category: 'Risk and Incident Management',
    items: [
      'Information Security Committee Policy',
      'Information Security Risk Assessment Policy',
      'Security Incident Response Policy',
    ],
  },
  {
    category: 'Compliance and Legal',
    items: [
      'Interconnection Agreement Policy',
      'Privacy Policy – External',
      'Privacy Policy – Internal',
      'Service Provider Security Policy',
    ],
  },
  {
    category: 'Technical and System Policies',
    items: [
      'Logging and Monitoring Policy',
      'Perimeter Security and Administration Policy',
      'Software Development Policy',
      'System Configuration Policy',
      'Vulnerability Identification and System Updates Policy',
    ],
  },
  {
    category: 'Telecommuting Policies',
    items: [
      'Telecommuting Assignment',
      'Telecommuting Policy',
      'Telecommuting Self‑Certification Safety Checklist',
    ],
  },
  {
    category: 'Policy Management',
    items: [
      'Policy or Standard Exception Request Form',
      'Policy or Standard Exception Request Procedure',
      'Policy or Standard Variance Request Form',
      'Policy or Standard Variance Request Procedure',
    ],
  },
];

const Policies = () => {
  const [policies, setPolicies] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    setPolicies(policiesList); // simulate API fetch
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="sticky top-0 h-screen">
        <Sidebar />
      </aside>

      <div className="flex-1 flex flex-col relative">
        <header className="sticky top-0 z-10">
          <Header />
        </header>

        {/* Close Button */}
        <button
          onClick={() => navigate(-1)} // Go back to previous page
          className="absolute top-4 right-6 z-20 text-gray-500 hover:text-red-600"
          title="Close"
        >
          <X className="w-6 h-6" />
        </button>

        <main className="flex-1 p-8 overflow-y-auto bg-gray-50">
          <h1 className="text-3xl font-bold mb-6">Cybersecurity Policies Library</h1>
          <p className="mb-8 text-gray-700">
            Choose from our library of professionally crafted policy templates. Customize, download, and implement instantly.
          </p>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {policies.map((section) => (
              <div key={section.category} className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">{section.category}</h2>
                <ul className="space-y-2">
                  {section.items.map((policy) => (
                    <li key={policy}>
                      <button className="w-full text-left text-blue-600 hover:underline">
                        {policy}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Policies;
