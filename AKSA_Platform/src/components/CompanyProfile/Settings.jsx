import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Bell, ArrowUpRight, Trash2, Moon, Sun, LogOut, Globe, Eye } from "lucide-react";

const showToast = (msg, type = "info") => {
  const toast = document.createElement("div");
  toast.textContent = msg;
  toast.className = `fixed top-6 right-6 z-50 px-6 py-3 rounded shadow-lg text-white font-semibold transition-all duration-300 ${type === "error" ? "bg-red-600" : type === "success" ? "bg-green-600" : "bg-blue-600"}`;
  document.body.appendChild(toast);
  setTimeout(() => { toast.style.opacity = 0; setTimeout(() => toast.remove(), 300); }, 2000);
};

const Settings = () => {
  const navigate = useNavigate();
  const [theme, setTheme] = useState("light");
  const [language, setLanguage] = useState("en");
  const [highContrast, setHighContrast] = useState(false);
  const [privacyAnalytics, setPrivacyAnalytics] = useState(true);
  const [privacyMarketing, setPrivacyMarketing] = useState(false);

  // Get current user role (you'll need to implement this based on your auth system)
  const currentRole = localStorage.getItem("role") || "user"; // Default to 'user' if not set

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

  const handleThemeToggle = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
    showToast(`Switched to ${theme === "light" ? "dark" : "light"} mode`, "success");
  };



  const handleLogoutAll = () => {
    showToast("Logged out of all devices (placeholder)", "success");
  };

  return (
    <div className="w-full max-w-6xl mx-auto animate-fade-in-up">
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

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Theme Toggle */}
        <div className="bg-white/80 backdrop-blur-lg border border-gray-200 rounded-2xl p-6 shadow flex items-center gap-4 animate-fade-in-up">
          <span className="inline-flex items-center justify-center w-10 h-10 bg-purple-100 rounded-full">
            {theme === "light" ? <Sun className="w-6 h-6 text-primary" /> : <Moon className="w-6 h-6 text-primary" />}
          </span>
          <div className="flex-1">
            <div className="font-semibold text-gray-900">Theme</div>
            <div className="text-gray-600 text-sm">Switch between light and dark mode</div>
          </div>
          <button
            className="px-4 py-2 rounded-lg font-semibold bg-primary text-white hover:bg-[#700070] transition shadow"
            onClick={handleThemeToggle}
          >
            {theme === "light" ? "Enable Dark Mode" : "Enable Light Mode"}
          </button>
        </div>

        {/* Session Management */}
        <div className="bg-white/80 backdrop-blur-lg border border-gray-200 rounded-2xl p-6 shadow animate-fade-in-up">
          <div className="flex items-center gap-3 mb-2">
            <LogOut className="w-6 h-6 text-primary" />
            <div className="font-semibold text-gray-900">Session Management</div>
          </div>
          <div className="text-gray-600 text-sm mb-3">You are currently logged in on this device. For security, you can log out of all other devices.</div>
          <button
            className="px-4 py-2 rounded-lg font-semibold bg-primary text-white hover:bg-[#700070] transition shadow"
            onClick={handleLogoutAll}
          >
            Log out of all devices
          </button>
        </div>


      </div>

      {/* Privacy Controls */}
      <div className="bg-white/80 backdrop-blur-lg border border-gray-200 rounded-2xl p-6 mb-6 shadow animate-fade-in-up">
        <div className="flex items-center gap-3 mb-2">
          <Eye className="w-6 h-6 text-primary" />
          <div className="font-semibold text-gray-900">Privacy Controls</div>
        </div>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-gray-700">
            <input type="checkbox" checked={privacyAnalytics} onChange={() => setPrivacyAnalytics(v => !v)} className="accent-primary w-5 h-5" />
            Allow usage analytics (helps us improve the product)
          </label>
          <label className="flex items-center gap-2 text-gray-700">
            <input type="checkbox" checked={privacyMarketing} onChange={() => setPrivacyMarketing(v => !v)} className="accent-primary w-5 h-5" />
            Receive marketing emails
          </label>
        </div>
      </div>

      {/* Language Selection */}
      <div className="bg-white/80 backdrop-blur-lg border border-gray-200 rounded-2xl p-6 mb-6 shadow flex items-center gap-4 animate-fade-in-up">
        <span className="inline-flex items-center justify-center w-10 h-10 bg-purple-100 rounded-full">
          <Globe className="w-6 h-6 text-primary" />
        </span>
        <div className="flex-1">
          <div className="font-semibold text-gray-900">Language</div>
          <div className="text-gray-600 text-sm">Choose your preferred language</div>
        </div>
        <select
          className="px-4 py-2 rounded-lg border border-gray-300 text-gray-900 focus:outline-none"
          value={language}
          onChange={e => setLanguage(e.target.value)}
        >
          <option value="en">English</option>
          <option value="hi">Hindi</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
        </select>
      </div>

      {/* Accessibility Options */}
      <div className="bg-white/80 backdrop-blur-lg border border-gray-200 rounded-2xl p-6 mb-10 shadow flex items-center gap-4 animate-fade-in-up">
        <span className="inline-flex items-center justify-center w-10 h-10 bg-purple-100 rounded-full">
          <Eye className="w-6 h-6 text-primary" />
        </span>
        <div className="flex-1">
          <div className="font-semibold text-gray-900">Accessibility</div>
          <div className="text-gray-600 text-sm">Enable high-contrast mode for better visibility</div>
        </div>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={highContrast} onChange={() => setHighContrast(v => !v)} className="accent-primary w-5 h-5" />
          <span className="text-gray-700 font-medium">High Contrast</span>
        </label>
      </div>

      {/* Action buttons - Conditionally render Upgrade button */}
      <div className="flex flex-col md:flex-row gap-4">
        {currentRole !== "user" && (
          <button
            className="border border-primary text-primary rounded-lg px-6 py-3 text-lg font-semibold hover:bg-purple-50 transition mb-4 md:mb-0 shadow"
            onClick={handleUpgrade}
          >
            Upgrade My Plan
          </button>
        )}
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