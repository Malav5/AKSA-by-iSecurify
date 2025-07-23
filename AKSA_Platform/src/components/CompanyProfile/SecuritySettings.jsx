import React from "react";

const SecuritySettings = () => (
  <div className="max-w-2xl mx-auto">
    {  <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-semibold mb-2 text-gray-900">Account access and Security</h2>
              <p className="text-gray-600 mb-8">Settings to help you keep your account secure.</p>

              {/* Change Password Card */}
              <div className="bg-white border border-gray-300 rounded-xl p-6 mb-8 shadow-sm">
                <div className="mb-2">
                  <span className="text-lg font-semibold text-gray-900">Change password</span>
                      </div>
                <div className="text-gray-600 mb-4">Choose a unique password to protect your account.</div>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="mb-2 md:mb-0">
                    <span className="font-semibold text-gray-900">Password</span> <span className="tracking-widest">********</span>
                  </div>
                  <button className="text-primary font-semibold hover:underline text-base">Change</button>
                </div>
              </div>

              {/* Multi-factor Authentication Card */}
              <div className="bg-white border border-gray-300 rounded-xl p-6 shadow-sm">
                <div className="mb-2">
                  <span className="text-lg font-semibold text-gray-900">Multi-factor authentication</span>
                </div>
                <div className="text-gray-600 mb-4">Multi-factor authentication</div>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="mb-2 md:mb-0">
                    <span className="font-semibold text-gray-900">Two-step verification</span>
                    </div>
                  <button className="text-primary font-semibold hover:underline text-base">Change</button>
                </div>
              </div>
            </div>
            /* ...security settings JSX... */}
  </div>
);

export default SecuritySettings;
