import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from "axios";
import { showSuccess, showError } from "../components/ui/toast";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PaymentPortal = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { plan, upgradeForUser, userEmail, userName } = location.state || {};
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [loading, setLoading] = useState(false);

  if (!plan) {
    navigate('/pricing');
    return null;
  }

  const handleGoToMainDashboard = () => {
    navigate("/dashboard");
  };

  const handleConfirmPayment = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      console.log("Starting payment confirmation...", { upgradeForUser, userEmail, plan });
      
      if (upgradeForUser && userEmail) {
        // Upgrade for specific user
        try {
          console.log("Fetching users list...");
          // First, find the user by email to get their ID
          const userResponse = await axios.get(
            "http://localhost:3000/api/agentMap/users-with-role-user",
            { headers: { Authorization: `Bearer ${token}` } }
          );
          
          console.log("Users response:", userResponse.data);
          const user = userResponse.data.users.find(u => u.email === userEmail);
          console.log("Found user:", user);
          
          if (!user) {
            throw new Error("User not found in the system");
          }

          console.log("Upgrading user plan...", { userId: user._id, plan });
          // Update the specific user's plan
          const upgradeResponse = await axios.put(
            `http://localhost:3000/api/agentMap/upgrade-user-plan/${user._id}`,
            { plan },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          
          console.log("Upgrade response:", upgradeResponse.data);
          if (upgradeResponse.data.message) {
            showSuccess(`Plan upgraded successfully for ${userName}!`);
          } else {
            showSuccess(`Plan upgraded successfully for ${userName}!`);
          }
          setTimeout(() => navigate("/dashboard"), 1200);
        } catch (error) {
          console.error("User upgrade error:", error);
          if (error.response?.status === 404) {
            showError("User not found or API endpoint not available");
          } else if (error.response?.status === 403) {
            showError("You don't have permission to upgrade user plans");
          } else if (error.response?.status === 400) {
            showError("Invalid plan selected");
          } else {
            showError("Failed to upgrade user plan. Please try again.");
          }
        }
      } else {
        // Upgrade current user's plan
        try {
          console.log("Upgrading current user plan...", { plan });
          const response = await axios.patch(
            "http://localhost:3000/api/auth/update-plan",
            { plan },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          console.log("Self upgrade response:", response.data);
          showSuccess("Plan upgraded successfully!");
          setTimeout(() => navigate("/dashboard"), 1200);
        } catch (error) {
          console.error("Self upgrade error:", error);
          if (error.response?.status === 404) {
            showError("API endpoint not available");
          } else if (error.response?.status === 401) {
            showError("Authentication failed. Please login again.");
          } else {
            showError("Failed to update plan. Please try again.");
          }
        }
      }
    } catch (err) {
      console.error("Payment confirmation error:", err);
      showError("Failed to process payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/dashboard");
  };

  const renderPaymentForm = () => {
    switch (paymentMethod) {
      case 'card':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
              <input
                type="text"
                placeholder="XXXX XXXX XXXX XXXX"
                className="w-full p-3 sm:p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#800080] focus:border-transparent text-sm sm:text-base"
              />
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  className="w-full p-3 sm:p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#800080] focus:border-transparent text-sm sm:text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CVC</label>
                <input
                  type="text"
                  placeholder="XXX"
                  className="w-full p-3 sm:p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#800080] focus:border-transparent text-sm sm:text-base"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cardholder Name</label>
              <input
                type="text"
                placeholder="Full Name"
                className="w-full p-3 sm:p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#800080] focus:border-transparent text-sm sm:text-base"
              />
            </div>
          </div>
        );
      case 'upi':
        return (
          <div className="space-y-4 text-center">
            <p className="text-sm sm:text-base text-gray-700 mb-4">Scan the QR code or enter UPI ID to pay:</p>
            <div className="mx-auto mb-4 border border-gray-300 rounded-lg w-32 h-32 sm:w-40 sm:h-40 bg-gray-100 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-300 rounded-lg mx-auto mb-2 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V6a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1zm12 0h2a1 1 0 001-1V6a1 1 0 00-1-1h-2a1 1 0 00-1 1v1a1 1 0 001 1zM5 20h2a1 1 0 001-1v-1a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1z" />
                  </svg>
                </div>
                <span className="text-xs text-gray-500">QR Code</span>
              </div>
            </div>
            <input
              type="text"
              placeholder="yourupiid@bank"
              className="w-full p-3 sm:p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#800080] focus:border-transparent text-sm sm:text-base"
            />
            <p className="text-xs sm:text-sm text-gray-500 mt-2">After successful payment, please click 'Confirm Payment'.</p>
          </div>
        );
      case 'bank_transfer':
        return (
          <div className="space-y-4">
            <p className="text-sm sm:text-base text-gray-700 mb-4">Please transfer the amount to the following bank details:</p>
            <div className="bg-gray-100 p-3 sm:p-4 rounded-lg border border-gray-300 space-y-2">
              <p className="text-xs sm:text-sm text-gray-800"><span className="font-semibold">Bank Name:</span> Example Bank</p>
              <p className="text-xs sm:text-sm text-gray-800"><span className="font-semibold">Account Name:</span> AKSA Solutions Pvt Ltd</p>
              <p className="text-xs sm:text-sm text-gray-800"><span className="font-semibold">Account Number:</span> 123456789012</p>
              <p className="text-xs sm:text-sm text-gray-800"><span className="font-semibold">IFSC Code:</span> EXMP0001234</p>
              <p className="text-xs sm:text-sm text-gray-800"><span className="font-semibold">SWIFT Code:</span> EXMPINBBXXX</p>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText('123456789012') && alert('Account number copied!')}
              className="w-full mt-4 px-3 sm:px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition duration-200 ease-in-out text-sm sm:text-base"
            >
              Copy Account Number
            </button>
            <p className="text-xs sm:text-sm text-gray-500 mt-2">Please complete the transfer and then click 'Confirm Payment'.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen w-full bg-white">
      <ToastContainer />
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Left Side - Hero Section */}
        <div className="lg:w-1/2 bg-gray-900 text-white flex flex-col justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
          <img
            src="/cyber.jpg"
            alt="Security"
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />

          {/* Mobile Logo - Top left on mobile */}
          <div className="lg:hidden absolute top-4 left-4 z-10">
            <div className="flex items-baseline space-x-2">
              <h1 className="text-2xl font-semibold">AKSA</h1>
              <div className="flex items-center space-x-1">
                <span className="text-sm">By</span>
                <img src="/logo_white.png" alt="Logo" className="h-3 w-3" />
                <span className="text-sm">iSecurify</span>
              </div>
            </div>
          </div>

          {/* Desktop Logo - Top left on desktop */}
          <div className="hidden lg:block absolute top-8 left-8 z-10">
            <div className="flex items-baseline space-x-2">
              <h1 className="text-3xl font-semibold">AKSA</h1>
              <div className="flex items-center space-x-1">
                <span className="text-base">By</span>
                <img src="/logo_white.png" alt="Logo" className="h-4 w-4" />
                <span className="text-base">iSecurify</span>
              </div>
            </div>
          </div>

          {/* Hero Content */}
          <div className="relative z-10 max-w-md mx-auto text-center lg:text-left">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 lg:mb-6">
              {upgradeForUser ? `Upgrade ${userName}'s Plan` : 'Secure Your Plan'}
            </h2>
            {upgradeForUser && (
              <div className="mt-4 p-3 bg-blue-900 bg-opacity-50 rounded-lg border border-blue-400">
                <p className="text-blue-200 text-sm">
                  <strong>Upgrading for:</strong> {userName} ({userEmail})
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Payment Form */}
        <div className="lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:px-12 lg:py-8 bg-white text-gray-800">
          <div className="w-full max-w-md space-y-4 sm:space-y-6">
            <div className="text-center lg:text-left">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">Complete Your Payment</h2>
              <p className="text-sm sm:text-base text-gray-500">
                Selected Plan: <span className="font-semibold text-[#800080]">{plan}</span>
                {upgradeForUser && (
                  <span className="block mt-1">
                    For: <span className="font-semibold text-[#800080]">{userName}</span>
                  </span>
                )}
              </p>
            </div>

            {/* Payment Method Selection */}
            <div className="mb-4 sm:mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Choose Payment Method:</label>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`px-3 sm:px-4 py-2 rounded-lg font-semibold transition duration-200 ease-in-out text-sm sm:text-base ${paymentMethod === 'card' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                  Credit/Debit Card
                </button>
                <button
                  onClick={() => setPaymentMethod('upi')}
                  className={`px-3 sm:px-4 py-2 rounded-lg font-semibold transition duration-200 ease-in-out text-sm sm:text-base ${paymentMethod === 'upi' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                  UPI
                </button>
                <button
                  onClick={() => setPaymentMethod('bank_transfer')}
                  className={`px-3 sm:px-4 py-2 rounded-lg font-semibold transition duration-200 ease-in-out text-sm sm:text-base ${paymentMethod === 'bank_transfer' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                  Bank Transfer
                </button>
              </div>
            </div>

            {renderPaymentForm()}

            <button
              onClick={handleConfirmPayment}
              disabled={loading}
              className="w-full px-4 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-[#6a006a] focus:outline-none focus:ring-2 focus:ring-[#800080] focus:ring-opacity-50 transition duration-200 ease-in-out transform hover:scale-105 text-sm sm:text-base"
            >
              {loading ? "Processing..." : upgradeForUser ? "Upgrade User Plan" : "Confirm Payment"}
            </button>

            <button
              onClick={handleCancel}
              className="w-full mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition duration-200 ease-in-out text-sm sm:text-base"
            >
              Cancel
            </button>

            <div className="text-xs sm:text-sm text-gray-400 text-center pt-4 space-y-1">
              <p>✔ Enterprise-grade security</p>
              <p>Protected by AKSA by iSecurify • ISO 27001 Certified</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default PaymentPortal; 