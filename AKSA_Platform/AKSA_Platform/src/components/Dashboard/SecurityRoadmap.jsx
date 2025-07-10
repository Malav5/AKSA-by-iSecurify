import React from "react";
import {
  ShieldCheck,
  AlertCircle,
  Lock,
  Mail,
  Globe,
  Clipboard,
} from "lucide-react";

const roadmap = [
  {
    icon: <ShieldCheck className="w-6 h-6" />,
    title: "Vulnerability Assessment",
    description: "Identify system flaws and weaknesses.",
    status: "completed",
  },
  {
    icon: <AlertCircle className="w-6 h-6" />,
    title: "Penetration Testing",
    description: "Simulate real-world attacks to find vulnerabilities.",
    status: "completed",
  },
  {
    icon: <Lock className="w-6 h-6" />,
    title: "Firewall Monitoring",
    description: "Continuously monitor firewall activity.",
    status: "completed",
  },
  {
    icon: <Mail className="w-6 h-6" />,
    title: "Email Security",
    description: "Protect emails from phishing and spam.",
    status: "recommended",
  },
  {
    icon: <Globe className="w-6 h-6" />,
    title: "DNS Security",
    description: "Safeguard domains from DNS attacks.",
    status: "pending",
  },
  {
    icon: <Clipboard className="w-6 h-6" />,
    title: "SSL/TLS Monitoring",
    description: "Ensure certificates are valid and secure.",
    status: "pending",
  },
];

const SecurityRoadmap = () => {
  const width = 1000;
  const height = 200;
  const stepCount = roadmap.length;
  const stepSpacing = width / (stepCount - 1);
  const y = height / 2;

  // Line path straight through all steps horizontally
  const pathD = roadmap
    .map((_, idx) => {
      const x = idx * stepSpacing;
      return idx === 0 ? `M${x},${y}` : `L${x},${y}`;
    })
    .join(" ");

  return (
    <div className="bg-white rounded-xl p-8 mt-6 shadow-lg overflow-hidden relative">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Your Security Journey
      </h2>

      {/* SVG straight dashed line */}
      <svg
        className="absolute left-0 w-full h-56 pointer-events-none z-0"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
      >
        <path
          d={pathD}
          fill="none"
          stroke="#cbd5e0"
          strokeWidth="2"
          strokeDasharray="6,6"
        />
      </svg>

      {/* Roadmap Steps */}
      <div
        className="flex justify-between items-center relative z-10"
        style={{ height: `${height}px` }}
      >
        {roadmap.map((step, idx) => {
          let bgColor = "bg-gray-200";
          let iconColor = "text-gray-700";
          let ringColor = "";

          if (step.status === "completed") {
            bgColor = "bg-secondary";
            iconColor = "text-primary";
          } else if (step.status === "recommended") {
            bgColor = "bg-green-200 p-6";
            iconColor = "text-green-600";
            ringColor = "ring-2 ring-green-400";
          }

          return (
            <div
              key={idx}
              className="flex flex-col items-center text-center w-1/6 min-w-[100px]"
            >
              <div
                className={`p-4 ${bgColor} ${ringColor} rounded-full shadow-md flex items-center justify-center`}
                style={{ marginBottom: "8px" }}
              >
                <div className={`${iconColor}`}>{step.icon}</div>
              </div>
              <h3 className="text-sm font-semibold text-gray-700">
                {step.title}
              </h3>
              <p className="text-xs text-gray-500 mt-1">{step.description}</p>
              {step.status === "recommended" && (
                <span className="text-xs text-blue-500 font-medium mt-1">
                  Recommended
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SecurityRoadmap;
