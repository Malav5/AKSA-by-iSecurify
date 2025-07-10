import React from 'react';
import { ShieldAlert, Sliders, FileText, BookOpen } from 'lucide-react';

const SecurityInfoCards = () => {
  const securityInfoCards = [
    { icon: ShieldAlert, title: "Security Events", description: "Visualize and analyze security alerts from your agents." },
    { icon: Sliders, title: "Integrity Monitoring", description: "Monitor file system changes for security and compliance." },
    { icon: FileText, title: "Log Analysis", description: "Collect, analyze, and store log data from various sources." },
    { icon: BookOpen, title: "Vulnerability Detection", description: "Identify system vulnerabilities and receive recommendations." },
  ];

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold mb-4 text-primary">Security Information Management</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {securityInfoCards.map((card, index) => (
          <div key={index} className="bg-white rounded-xl shadow p-6 flex items-start gap-4 hover:bg-gray-50 hover:shadow-lg transition duration-300 cursor-pointer">
            <div className="bg-primary/10 text-primary rounded-full p-3">
              <card.icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1">{card.title}</h3>
              <p className="text-gray-600 text-sm">{card.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SecurityInfoCards; 