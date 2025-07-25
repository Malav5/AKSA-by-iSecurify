import React from "react";
import { KeyRound, ShieldCheck } from "lucide-react";

const SecuritySettings = () => (
  <div className="max-w-2xl mx-auto px-2 md:px-0">
    <div className="mb-10">
      <h2 className="text-3xl font-bold mb-2 text-gray-900 tracking-tight flex items-center gap-2">
        <ShieldCheck className="w-7 h-7 text-primary" />
        Account access and Security
      </h2>
      <p className="text-gray-600 mb-8">Settings to help you keep your account secure.</p>
    </div>

    {/* Change Password Card */}
    <div className="bg-white/80 backdrop-blur-lg border border-gray-200 rounded-2xl p-6 mb-8 shadow-xl transition-transform duration-300 hover:scale-[1.02] hover:shadow-2xl animate-fade-in-up flex items-center gap-4">
      <div className="bg-primary/10 p-3 rounded-full flex items-center justify-center">
        <KeyRound className="w-7 h-7 text-primary" />
      </div>
      <div className="flex-1">
        <div className="mb-1">
          <span className="text-lg font-semibold text-gray-900">Change password</span>
        </div>
        <div className="text-gray-600 mb-2 text-sm">Choose a unique password to protect your account.</div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="mb-2 md:mb-0">
            <span className="font-semibold text-gray-900">Password</span> <span className="tracking-widest">********</span>
          </div>
          <button className="bg-primary text-white font-semibold px-5 py-2 rounded-lg shadow hover:bg-[#700070] transition-all duration-200 text-base">Change</button>
        </div>
      </div>
    </div>

    {/* Multi-factor Authentication Card */}
    <div className="bg-white/80 backdrop-blur-lg border border-gray-200 rounded-2xl p-6 shadow-xl transition-transform duration-300 hover:scale-[1.02] hover:shadow-2xl animate-fade-in-up flex items-center gap-4">
      <div className="bg-primary/10 p-3 rounded-full flex items-center justify-center">
        <ShieldCheck className="w-7 h-7 text-primary" />
      </div>
      <div className="flex-1">
        <div className="mb-1">
          <span className="text-lg font-semibold text-gray-900">Multi-factor authentication</span>
        </div>
        <div className="text-gray-600 mb-2 text-sm">Multi-factor authentication</div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="mb-2 md:mb-0">
            <span className="font-semibold text-gray-900">Two-step verification</span>
          </div>
          <button className="bg-primary text-white font-semibold px-5 py-2 rounded-lg shadow hover:bg-[#700070] transition-all duration-200 text-base">Change</button>
        </div>
      </div>
    </div>
  </div>
);

export default SecuritySettings;
