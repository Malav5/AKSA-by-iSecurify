import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { userServices } from "../services/UserServices";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";
const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  // Add state for password visibility
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
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
        setError("User not found. Please check your email or sign up.");
        return;
      }

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Login failed");
      }

      const data = await res.json();

      // Store the JWT token in localStorage for later authenticated requests
      localStorage.setItem("token", data.token);

      // For returning users, ensure we don't clear their data
      const lastUser = localStorage.getItem("currentUser");
      const userPrefix = data.user.email.split("@")[0];
      if (lastUser === data.user.email) {
        // Same user logging in again, keep their data
        const savedDomain = localStorage.getItem(`${userPrefix}_savedDomain`);
        if (savedDomain) {
          localStorage.setItem(`${userPrefix}_savedDomain`, savedDomain);
        }
      } else {
        // New user logging in, set current user but don't clear data
        localStorage.setItem("currentUser", data.user.email);
      }
      if (data.user.role) {
        localStorage.setItem("role", data.user.role);
      }
      if (data.user.plan) {
        localStorage.setItem("plan", data.user.plan);
      }
      setSuccess("Login successful! Redirecting...");
      setTimeout(async () => {
        // Check if user has domains
        try {
          const res = await axios.get("/api/domains", {
            headers: { Authorization: `Bearer ${data.token}` },
          });
          const userDomains = res.data.filter(
            (domain) => domain.userEmail === data.user.email
          );
          if (userDomains.length > 0) {
            navigate("/dashboard");
          } else {
            navigate("/deaddashboard");
          }
        } catch (err) {
          navigate("/deaddashboard");
        }
      }, 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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
              Secure your digital world
            </h2>
            <p className="text-base sm:text-lg text-gray-300 leading-relaxed">
              Trusted enterprise security for modern infrastructure.
            </p>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:px-12 lg:py-8">
          <div className="w-full max-w-md space-y-4 sm:space-y-6">
            <div className="text-center lg:text-left">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
                Welcome back
              </h2>
              <p className="text-sm sm:text-base text-gray-500">
                Sign in to your account
              </p>
            </div>

            {/* Alert Messages */}
            {(error || success) && (
              <div
                className={`p-3 sm:p-4 rounded-lg mb-4 text-sm sm:text-base font-medium ${
                  error
                    ? "bg-red-100 text-red-700 border border-red-200"
                    : "bg-green-100 text-green-700 border border-green-200"
                }`}
              >
                {error || success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div>
                <input
                  type="email"
                  name="email"
                  placeholder="Work Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full p-3 sm:p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-sm sm:text-base"
                />
              </div>

              <div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full p-3 sm:p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-sm sm:text-base pr-12"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 focus:outline-none"
                    onClick={() => setShowPassword((prev) => !prev)}
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm text-gray-600 space-y-2 sm:space-y-0">
                <label className="flex items-center cursor-pointer">
                  <input type="checkbox" className="mr-2 h-4 w-4" />
                  Remember me
                </label>
                <a href="#" className="text-[#800080] hover:underline text-sm">
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white p-3 sm:p-4 rounded-lg font-semibold disabled:opacity-50 transition-all duration-200 hover:bg-[#700070] text-sm sm:text-base"
              >
                {loading ? "Signing In..." : "Sign In"}
              </button>
            </form>

            <hr className="border-gray-200" />

            <p className="text-sm sm:text-base text-center">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-[#800080] underline hover:text-[#700070]"
              >
                Sign up
              </Link>
            </p>

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

export default Login;
