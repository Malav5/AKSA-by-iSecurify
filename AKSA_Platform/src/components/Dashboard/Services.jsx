import React from "react";
import { ShieldCheck, Ban, Server, Mail, Globe, Lock } from "lucide-react";

const services = [
  {
    name: "Vulnerability Assessment",
    description: "Finds system flaws",
    icon: <ShieldCheck className="w-5 h-5 text-blue-600" />,
  },
  {
    name: "Penetration Testing",
    description: "Simulates attacks",
    icon: <Ban className="w-5 h-5 text-red-600" />,
  },
  {
    name: "Firewall Monitoring",
    description: "Tracks firewall use",
    icon: <Server className="w-5 h-5 text-yellow-600" />,
  },
  {
    name: "Email Security",
    description: "Blocks email threats",
    icon: <Mail className="w-5 h-5 text-green-600" />,
  },
  {
    name: "DNS Security",
    description: "Secures domain DNS",
    icon: <Globe className="w-5 h-5 text-purple-600" />,
  },
  {
    name: "SSL/TLS Monitoring",
    description: "Checks certificates",
    icon: <Lock className="w-5 h-5 text-indigo-600" />,
  },
];

const AksaSecurityServices = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-6 text-center">
        AKSA Platform Security Services
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4 text-gray-700 text-sm h-64 cursor-pointer">
        {services.map((service, idx) => (
          <div
            key={idx}
            className="bg-[#F8FAFC] hover:bg-[#e2e8f0] p-4 rounded-lg flex flex-col items-center justify-center gap-3"
          >
            <div className="flex items-center justify-center ">
              {service.icon}
            </div>
            <div className="text-center">
              <div className="font-semibold">{service.name}</div>
              <div className="text-xs text-gray-500">{service.description}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AksaSecurityServices;
