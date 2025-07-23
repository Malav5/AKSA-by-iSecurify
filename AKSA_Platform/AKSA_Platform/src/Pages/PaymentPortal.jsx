import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';

const PaymentPortal = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { plan } = location.state || {};
  const [paymentMethod, setPaymentMethod] = useState('card');

  if (!plan) {
    navigate('/pricing');
    return null;
  }

  const handleGoToMainDashboard = () => {
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
            <img src="https://via.placeholder.com/150" alt="UPI QR Code" className="mx-auto mb-4 border border-gray-300 rounded-lg w-32 h-32 sm:w-40 sm:h-40" />
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
              Secure Your Plan
            </h2>
            <p className="text-base sm:text-lg text-gray-300 leading-relaxed">
              Finalize your subscription to the <span className="font-bold text-teal-300">{plan}</span> plan.
            </p>
          </div>
        </div>

        {/* Right Side - Payment Form */}
        <div className="lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:px-12 lg:py-8 bg-white text-gray-800">
          <div className="w-full max-w-md space-y-4 sm:space-y-6">
            <div className="text-center lg:text-left">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">Complete Your Payment</h2>
              <p className="text-sm sm:text-base text-gray-500">Selected Plan: <span className="font-semibold text-[#800080]">{plan}</span></p>
            </div>

            {/* Payment Method Selection */}
            <div className="mb-4 sm:mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Choose Payment Method:</label>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`px-3 sm:px-4 py-2 rounded-lg font-semibold transition duration-200 ease-in-out text-sm sm:text-base ${
                    paymentMethod === 'card' ? 'bg-[#800080] text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Credit/Debit Card
                </button>
                <button
                  onClick={() => setPaymentMethod('upi')}
                  className={`px-3 sm:px-4 py-2 rounded-lg font-semibold transition duration-200 ease-in-out text-sm sm:text-base ${
                    paymentMethod === 'upi' ? 'bg-[#800080] text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  UPI
                </button>
                <button
                  onClick={() => setPaymentMethod('bank_transfer')}
                  className={`px-3 sm:px-4 py-2 rounded-lg font-semibold transition duration-200 ease-in-out text-sm sm:text-base ${
                    paymentMethod === 'bank_transfer' ? 'bg-[#800080] text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Bank Transfer
                </button>
              </div>
            </div>

            {renderPaymentForm()}

            <button
              onClick={() => alert(`Confirming payment for ${plan} plan via ${paymentMethod}!`)}
              className="w-full px-4 py-3 bg-[#800080] text-white font-semibold rounded-lg hover:bg-[#6a006a] focus:outline-none focus:ring-2 focus:ring-[#800080] focus:ring-opacity-50 transition duration-200 ease-in-out transform hover:scale-105 text-sm sm:text-base"
            >
              Confirm Payment
            </button>

            <button
              onClick={() => navigate('/pricing')}
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