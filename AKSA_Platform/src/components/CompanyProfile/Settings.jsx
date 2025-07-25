import React from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Bell, ArrowUpRight, Trash2 } from "lucide-react";

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
    <div className="max-w-2xl mx-auto animate-fade-in-up">
      <div className="mb-10 flex items-center gap-3">
        <Bell className="w-7 h-7 text-primary bg-secondary rounded-full p-1 shadow" />
        <h2 className="text-2xl font-bold text-gray-900">Opt-in notifications</h2>
      </div>
      <p className="text-gray-600 mb-8">Your recurring subscriptions like App notifications.</p>

      {/* Unsubscribe Card */}
      <div className="bg-white/80 backdrop-blur-lg border border-gray-200 rounded-2xl p-8 mb-10 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between animate-fade-in-up">
        <span className="text-lg font-semibold text-gray-900 mb-4 md:mb-0 flex items-center gap-2">
          <ArrowUpRight className="w-5 h-5 text-primary" />
          Want to stop receiving our App notifications
        </span>
        <button className="text-teal-700 font-semibold hover:underline text-lg md:ml-8">Unsubscribe from this list</button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <button
          className="border border-primary text-primary rounded-lg px-6 py-3 text-lg font-semibold hover:bg-purple-50 transition mb-4 md:mb-0 shadow"
          onClick={handleUpgrade}
        >
          Upgrade My Plan
        </button>
        <button
          className="border border-gray-400 rounded-lg px-6 py-3 text-lg font-semibold text-gray-700 hover:bg-gray-100 transition mb-4 md:mb-0 shadow"
          onClick={handleCancelMembership}
        >
          Cancel membership
        </button>
        <button
          className="flex items-center justify-center border border-gray-400 rounded-lg px-6 py-3 text-lg font-semibold text-gray-700 hover:bg-gray-100 transition shadow"
          onClick={handleCancelAccount}
        >
          <Trash2 className="w-5 h-5 mr-2 text-red-500" />
          Cancel my account
        </button>
      </div>
    </div>
  );
};

export default Settings;