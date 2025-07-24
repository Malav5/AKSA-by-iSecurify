import React from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const showToast = (msg, type = "info") => {
  const toast = document.createElement("div");
  toast.textContent = msg;
  toast.className = `fixed top-6 right-6 z-50 px-6 py-3 rounded shadow-lg text-white font-semibold transition-all duration-300 ${type === "error" ? "bg-red-600" : type === "success" ? "bg-green-600" : "bg-blue-600"}`;
  document.body.appendChild(toast);
  setTimeout(() => { toast.style.opacity = 0; setTimeout(() => toast.remove(), 300); }, 2000);
};

const Settings = () => {
  const navigate = useNavigate();

  const handleUpgrade = () => {
    navigate("/upgrade-plan");
  };

  const handleCancelMembership = async () => {
    if (window.confirm("Are you sure you want to cancel your membership and switch to the Freemium plan?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.patch("/api/auth/update-plan", { plan: "Freemium" }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showToast("Membership cancelled. You are now on the Freemium plan.", "success");
        setTimeout(() => window.location.reload(), 1000);
      } catch (err) {
        showToast("Failed to cancel membership.", "error");
      }
    } else {
      showToast("Membership cancellation aborted.", "info");
    }
  };

  const handleCancelAccount = async () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete("/api/auth/delete-account", {
          headers: { Authorization: `Bearer ${token}` }
        });
        showToast("Account deleted. Goodbye!", "success");
        localStorage.clear();
        navigate("/login");
      } catch (err) {
        const msg = err?.response?.data?.error || "Failed to delete account.";
        showToast(msg, "error");
      }
    } else {
      showToast("Account deletion cancelled.", "info");
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-semibold mb-2 text-gray-900">Opt-in notifications</h2>
        <p className="text-gray-600 mb-8">Your recurring subscriptions like App notifications.</p>

        {/* Unsubscribe Card */}
        <div className="bg-white border border-gray-300 rounded-xl p-8 mb-10 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between">
          <span className="text-lg font-semibold text-gray-900 mb-4 md:mb-0">Want to stop receiving our App notifications</span>
          <button className="text-teal-700 font-semibold hover:underline text-lg md:ml-8">Unsubscribe from this list</button>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <button
            className="border border-purple-600 text-purple-700 rounded-lg px-6 py-3 text-lg font-semibold hover:bg-purple-50 transition mb-4 md:mb-0"
            onClick={handleUpgrade}
          >
            Upgrade My Plan
          </button>
          <button
            className="border border-gray-400 rounded-lg px-6 py-3 text-lg font-semibold text-gray-700 hover:bg-gray-100 transition mb-4 md:mb-0"
            onClick={handleCancelMembership}
          >
            Cancel membership
          </button>
          <button
            className="flex items-center justify-center border border-gray-400 rounded-lg px-6 py-3 text-lg font-semibold text-gray-700 hover:bg-gray-100 transition"
            onClick={handleCancelAccount}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0 1 16.138 21H7.862a2 2 0 0 1-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M10 3h4a2 2 0 0 1 2 2v2H8V5a2 2 0 0 1 2-2z" /></svg>
            Cancel my account
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;