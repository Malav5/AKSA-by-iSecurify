import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Home } from 'lucide-react';

const SOCLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.status === 404) {
        setError("User not found. Please check your email.");
        return;
      }

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Login failed");
      }

      const data = await res.json();
      console.log("Login API Response Data:", data);

      localStorage.setItem("token", data.token);
      
      // Clear existing user data before setting new
      localStorage.removeItem("soc_username");
      localStorage.removeItem("soc_fullname");
      localStorage.removeItem("soc_email");

      const usernameFromEmail = formData.email.split('@')[0];
      localStorage.setItem("soc_username", usernameFromEmail);
      
      // Store the real full name from backend response
      let fullNameToStore = usernameFromEmail.toUpperCase();
      if (data.user && (data.user.firstName || data.user.lastName)) {
        fullNameToStore = `${data.user.firstName || ''} ${data.user.lastName || ''}`.trim();
      }
      localStorage.setItem("soc_fullname", fullNameToStore);
      // Store the real email from backend response
      if (data.user && data.user.email) {
        localStorage.setItem("soc_email", data.user.email);
      } else {
        localStorage.setItem("soc_email", formData.email);
      }

      if (data.user.role) {
        localStorage.setItem("role", data.user.role);
      }

      console.log("SOCLogin: Stored soc_username:", usernameFromEmail);
      console.log("SOCLogin: Stored soc_fullname:", fullNameToStore);

      setSuccess("Login successful! Redirecting...");
      setTimeout(() => {
        navigate("/soc");
      }, 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="h-screen w-screen m-0 p-0 overflow-hidden">
      <button
        onClick={() => {
          window.close();
          window.opener.location.href = '/dashboard';
        }}
        className="absolute top-4 right-4 bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-800 transition duration-200 ease-in-out text-sm z-50 flex items-center space-x-1"
      >
        <Home className="w-4 h-4" />
        <span>Home</span>
      </button>

      <div className="flex flex-col w-full min-h-screen md:flex-row bg-white">
        <div className="md:w-1/2 bg-gray-900 text-white flex flex-col justify-center p-8 relative">
          <img
            src="/cyber.jpg"
            alt="Security"
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
          <div className="absolute top-0 my-8 flex flex-row items-center px-8 z-10">
             <div className="flex items-baseline space-x-2">
               <h1 className="text-3xl font-semibold">AKSA</h1>
               <div className="flex items-center space-x-1">
                 <span className="text-base">By</span>
                 <img src="/logo_white.png" alt="Logo" className="h-4 w-4" />
                 <span className="text-base">iSecurify</span>
               </div>
             </div>
           </div>
          <div className="relative z-10 max-w-md mx-auto">
            <h2 className="text-3xl font-bold mb-6">
              SOC Dashboard Access
            </h2>
            <p className="text-lg text-gray-300">
              Please log in to access the Security Operations Center dashboard.
            </p>
          </div>
        </div>

        <div className="md:w-1/2 flex items-center justify-center p-6 md:px-12 bg-white text-gray-800">
          <div className="w-full max-w-md space-y-6">
            <div>
              <h2 className="text-4xl font-bold text-gray-800">SOC Login</h2>
              <p className="text-gray-500">Sign in to the SOC dashboard</p>
            </div>

            {(error || success) && (
              <div
                className={`p-3 rounded mb-2 text-sm font-medium ${
                  error
                    ? "bg-red-100 text-red-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {error || success}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Work Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#800080] focus:border-transparent"
                  autoComplete="email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#800080] focus:border-transparent"
                  autoComplete="current-password"
                />
              </div>

              <button
                type="submit"
                disabled={loading || formData.email.trim() === '' || formData.password.trim() === ''}
                className="w-full bg-[#800080] text-white p-3 rounded-lg font-semibold hover:bg-[#6a006a] focus:outline-none focus:ring-2 focus:ring-[#800080] focus:ring-opacity-50 transition duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Logging In..." : "Login to SOC Dashboard"}
              </button>
            </form>
             <div className="text-sm text-gray-400 text-center pt-4">
              <p>✔ Enterprise-grade security</p>
              <p>Protected by AKSA by iSecurify • ISO 27001 Certified</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default SOCLogin; 