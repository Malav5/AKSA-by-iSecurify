import React, { useState } from "react";
import { Link } from "react-router-dom";
import AddMemberModal from "./AddMemberModal";
import QueAns from "./QueAns";

const OptionsMenu = () => {
  const [showAddMember, setShowAddMember] = useState(false);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);

  const cardData = [
    {
      title: "Assessment",
      subtitle: "Conduct an assessment of your Cybersecurity controls.",
      icon: "📝",
      iconColor: "border-blue-400 bg-blue-100",
      iconBg: "bg-lime-100",
      iconBorder: "border-lime-400",
      buttonLabel: "Retake my assessment",
      onClick: () => setShowQuestionnaire(true),
    },
    {
      title: "Policies Library",
      subtitle: "Download Security Policy Templates from our policy library.",
      icon: "📘",
      iconColor: "border-cyan-400 bg-cyan-100",
      iconBg: "bg-purple-100",
      iconBorder: "border-purple-400",
      buttonLabel: "View my policies",
      path: "/policies",
    },
    {
      title: "Risk Manager",
      subtitle:
        "Build your risk register, assign risk ownership and track remediation tasks.",
      icon: "📈",
      iconColor: "border-orange-400 bg-orange-100",
      iconBg: "bg-cyan-100",
      iconBorder: "border-cyan-400",
      buttonLabel: "View my risks",
      path: "/risk-manager",
    },
    {
      title: "Task Manager",
      subtitle:
        "Assign tasks to your Security team and keep track of priorities and due dates.",
      icon: "🗂️",
      iconColor: "border-pink-400 bg-pink-100",
      iconBg: "bg-yellow-100",
      iconBorder: "border-yellow-400",
      buttonLabel: "View my tasks",
      path: "/task-manager",
    },
    {
      title: "Add Member",
      subtitle: "Add new team members and assign their roles and permissions.",
      icon: "👥",
      iconColor: "border-green-400 bg-green-100",
      iconBg: "bg-green-50",
      iconBorder: "border-green-300",
      buttonLabel: "Add a member",
      onClick: () => setShowAddMember(true),
    },
    {
      title: "Issues Management",
      subtitle: "Manage, assign and follow up your company issues.",
      icon: "🛡️",
      iconColor: "border-fuchsia-400 bg-fuchsia-100",
      iconBg: "bg-pink-100",
      iconBorder: "border-pink-400",
      buttonLabel: "View my issues",
      path: "/issuePage",
    },
  ];
  
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-4 p-3 md:p-4 lg:p-6 bg-white">
        {cardData.map((card, index) => (
          <div
            key={index}
            className="bg-white p-3 md:p-4 rounded-lg text-gray-800 flex flex-col items-center text-center shadow-sm hover:shadow-md transition"
          >
            <div
              className={`w-16 h-16 md:w-20 md:h-20 mb-3 md:mb-4 rounded-full flex items-center justify-center border-4 ${card.iconBorder} ${card.iconBg} ${card.iconColor}`}
            >
              <span className="text-2xl md:text-3xl">{card.icon}</span>
            </div>
            <h3 className="font-semibold text-sm md:text-base">{card.title}</h3>
            <p className="text-xs md:text-sm mt-1 md:mt-2 mb-3 md:mb-4">{card.subtitle}</p>

            {card.path ? (
              <Link
                to={card.path}
                className="bg-primary text-white font-medium px-3 md:px-4 py-1 rounded hover:bg-primary/90 transition text-xs md:text-sm"
              >
                {card.buttonLabel}
              </Link>
            ) : (
              <button 
                onClick={card.onClick}
                className="bg-primary text-white font-medium px-3 md:px-4 py-1 rounded hover:bg-primary/90 transition text-xs md:text-sm"
              >
                {card.buttonLabel}
              </button>
            )}
          </div>
        ))}
      </div>

      {showAddMember && (
        <AddMemberModal onClose={() => setShowAddMember(false)} />
      )}

      {showQuestionnaire && (
        <QueAns
          onCancel={() => setShowQuestionnaire(false)}
          setQuestionnaireSubmitted={() => {
            setShowQuestionnaire(false);
            // You can add any additional logic here after questionnaire submission
          }}
        />
      )}
    </>
  );
};

export default OptionsMenu;
