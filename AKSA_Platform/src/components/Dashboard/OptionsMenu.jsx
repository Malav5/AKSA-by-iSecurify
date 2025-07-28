import React, { useState } from "react";
import { Link } from "react-router-dom";
import AddMemberModal from "./AddMemberModal";
import QueAns from "./QueAns";
import {
  FiFileText,
  FiBook,
  FiTrendingUp,
  FiFolder,
  FiUsers,
  FiShield,
} from "react-icons/fi";

const OptionsMenu = () => {
  const [showAddMember, setShowAddMember] = useState(false);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);

  const cardData = [
    {
      title: "Assessment",
      subtitle: "Conduct an assessment of your Cybersecurity controls.",
      icon: <FiFileText className="w-10 h-10" />,
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-50 to-cyan-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-700",
      buttonGradient: "from-blue-600 to-cyan-600",
      buttonHover: "from-blue-700 to-cyan-700",
      buttonLabel: "Retake my assessment",
      onClick: () => setShowQuestionnaire(true),
    },
    {
      title: "Policies Library",
      subtitle: "Download Security Policy Templates from our policy library.",
      icon: <FiBook className="w-10 h-10" />,
      gradient: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-50 to-pink-50",
      borderColor: "border-purple-200",
      textColor: "text-purple-700",
      buttonGradient: "from-purple-600 to-pink-600",
      buttonHover: "from-purple-700 to-pink-700",
      buttonLabel: "View my policies",
      path: "/policies",
    },
    {
      title: "Risk Manager",
      subtitle: "Build your risk register, assign risk ownership and track remediation tasks.",
      icon: <FiTrendingUp className="w-10 h-10" />,
      gradient: "from-orange-500 to-red-500",
      bgGradient: "from-orange-50 to-red-50",
      borderColor: "border-orange-200",
      textColor: "text-orange-700",
      buttonGradient: "from-orange-600 to-red-600",
      buttonHover: "from-orange-700 to-red-700",
      buttonLabel: "View my risks",
      path: "/risk-manager",
    },
    {
      title: "Task Manager",
      subtitle: "Assign tasks to your Security team and keep track of priorities and due dates.",
      icon: <FiFolder className="w-10 h-10" />,
      gradient: "from-emerald-500 to-teal-500",
      bgGradient: "from-emerald-50 to-teal-50",
      borderColor: "border-emerald-200",
      textColor: "text-emerald-700",
      buttonGradient: "from-emerald-600 to-teal-600",
      buttonHover: "from-emerald-700 to-teal-700",
      buttonLabel: "View my tasks",
      path: "/task-manager",
    },
    {
      title: "Add Member",
      subtitle: "Add new team members and assign their roles and permissions.",
      icon: <FiUsers className="w-10 h-10" />,
      gradient: "from-green-500 to-emerald-500",
      bgGradient: "from-green-50 to-emerald-50",
      borderColor: "border-green-200",
      textColor: "text-green-700",
      buttonGradient: "from-green-600 to-emerald-600",
      buttonHover: "from-green-700 to-emerald-700",
      buttonLabel: "Add a member",
      onClick: () => setShowAddMember(true),
    },
    {
      title: "Issues Management",
      subtitle: "Manage, assign and follow up your company issues.",
      icon: <FiShield className="w-10 h-10" />,
      gradient: "from-indigo-500 to-purple-500",
      bgGradient: "from-indigo-50 to-purple-50",
      borderColor: "border-indigo-200",
      textColor: "text-indigo-700",
      buttonGradient: "from-indigo-600 to-purple-600",
      buttonHover: "from-indigo-700 to-purple-700",
      buttonLabel: "View my issues",
      path: "/issues",
    },
  ];

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 md:gap-6 p-4 md:p-6 lg:p-8 bg-white">
        {cardData.map((card, index) => (
          <div
            key={index}
            className={`bg-white p-6 md:p-8 rounded-2xl text-gray-800 flex flex-col text-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 h-full border-2 ${card.borderColor} relative overflow-hidden group`}
          >
            {/* Background decoration */}
            <div
              className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${card.gradient} rounded-full -translate-y-10 translate-x-10 opacity-10 group-hover:opacity-20 transition-opacity duration-300`}
            ></div>

            {/* Icon container */}
            <div
              className={`w-20 h-20 md:w-24 md:h-24 mb-6 rounded-2xl mx-auto flex items-center justify-center bg-gradient-to-br ${card.gradient} shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110`}
            >
              <span className="text-white">{card.icon}</span>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col">
              <h3 className="font-bold text-lg md:text-xl mb-3 text-gray-800 group-hover:text-gray-900 transition-colors duration-200">
                {card.title}
              </h3>
              <p className="text-sm md:text-base text-gray-600 mb-6 leading-relaxed flex-1">
                {card.subtitle}
              </p>

              {/* Button */}
              <div className="mt-auto">
                {card.path ? (
                  <Link
                    to={card.path}
                    className={`bg-gradient-to-r ${card.buttonGradient} hover:${card.buttonHover} text-white font-semibold px-6 md:px-8 py-3 md:py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-sm md:text-base inline-block w-full`}
                    onClick={(e) => {
                      // Debugging - remove in production
                      console.log(`Navigating to ${card.path}`);
                    }}
                  >
                    {card.buttonLabel}
                  </Link>
                ) : (
                  <button
                    onClick={card.onClick}
                    className={`bg-gradient-to-r ${card.buttonGradient} hover:${card.buttonHover} text-white font-semibold px-6 md:px-8 py-3 md:py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-sm md:text-base w-full`}
                  >
                    {card.buttonLabel}
                  </button>
                )}
              </div>
            </div>

            {/* Hover overlay */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${card.bgGradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-2xl`}
            ></div>
          </div>
        ))}
      </div>

      {showAddMember && <AddMemberModal onClose={() => setShowAddMember(false)} />}
      {showQuestionnaire && (
        <QueAns
          onCancel={() => setShowQuestionnaire(false)}
          setQuestionnaireSubmitted={() => setShowQuestionnaire(false)}
        />
      )}
    </>
  );
};

export default OptionsMenu;
