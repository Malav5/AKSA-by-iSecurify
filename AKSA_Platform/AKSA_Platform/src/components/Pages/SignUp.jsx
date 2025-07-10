import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Signup = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    companyName: "",
    email: "",
    phoneNumber: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    // Password validation before sending to backend
    if (!passwordRegex.test(formData.password)) {
      setError("Password must be at least 8 characters long and include a number, a letter, and a special character.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Signup failed");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("currentUser", data.user.email);

      const userPrefix = data.user.email.split('@')[0];
      localStorage.removeItem(`${userPrefix}_savedDomain`);
      localStorage.removeItem(`${userPrefix}_domainChecked`);
      localStorage.removeItem(`${userPrefix}_domainCheckResult`);
      localStorage.removeItem(`${userPrefix}_questionnaireSubmitted`);
      localStorage.removeItem(`${userPrefix}_domainHealthAnswers`);
      localStorage.removeItem(`${userPrefix}_domainHealthScore`);
      localStorage.removeItem(`${userPrefix}_domainHealthStatus`);
      localStorage.removeItem(`${userPrefix}_recommendedProducts`);

      setSuccess("Signup successful! Redirecting to dashboard...");

      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full bg-white">
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Left Side - Hero Section */}
        <div className="lg:w-1/2 bg-gray-900 text-white flex flex-col justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
          <img src="/cyber.jpg" alt="Security" className="absolute inset-0 w-full h-full object-cover opacity-30" />
          
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
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 lg:mb-6">Secure your digital world</h2>
            <p className="text-base sm:text-lg text-gray-300 leading-relaxed">Trusted enterprise security for modern infrastructure.</p>
          </div>
        </div>

        {/* Right Side - Signup Form */}
        <div className="lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:px-12 lg:py-8">
          <div className="w-full max-w-md space-y-4 sm:space-y-6">
            <div className="text-center lg:text-left">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">Welcome to AKSA by iSecurify</h2>
              <p className="text-sm sm:text-base text-gray-500">Create your account</p>
            </div>

            {error && <div className="bg-red-100 text-red-600 p-3 sm:p-4 rounded-lg border border-red-200 text-sm sm:text-base">{error}</div>}
            {success && <div className="bg-green-100 text-green-700 p-3 sm:p-4 rounded-lg border border-green-200 text-sm sm:text-base">{success}</div>}

            <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
              {/* Name Fields - Stack on mobile, side by side on larger screens */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <div className="flex-1">
                  <input 
                    type="text" 
                    name="firstName" 
                    placeholder="First Name" 
                    value={formData.firstName} 
                    onChange={handleChange} 
                    required 
                    className="w-full p-3 sm:p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-sm sm:text-base" 
                  />
                </div>
                <div className="flex-1">
                  <input 
                    type="text" 
                    name="lastName" 
                    placeholder="Last Name" 
                    value={formData.lastName} 
                    onChange={handleChange} 
                    required 
                    className="w-full p-3 sm:p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-sm sm:text-base" 
                  />
                </div>
              </div>

              <div>
                <input 
                  type="text" 
                  name="companyName" 
                  placeholder="Company Name" 
                  value={formData.companyName} 
                  onChange={handleChange} 
                  className="w-full p-3 sm:p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-sm sm:text-base" 
                />
              </div>
              
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
                <input 
                  type="tel" 
                  name="phoneNumber" 
                  placeholder="Phone Number" 
                  value={formData.phoneNumber} 
                  onChange={handleChange} 
                  className="w-full p-3 sm:p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-sm sm:text-base" 
                />
              </div>

              <div>
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full p-3 sm:p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-sm sm:text-base"
                />
                {formData.password && !passwordRegex.test(formData.password) && (
                  <p className="text-xs sm:text-sm text-red-500 mt-2">
                    Password must be at least 8 characters long and include a number, a letter, and a special character.
                  </p>
                )}
              </div>

              <button 
                type="submit" 
                disabled={loading} 
                className="w-full bg-primary text-white p-3 sm:p-4 rounded-lg font-semibold disabled:opacity-50 transition-all duration-200 hover:bg-[#700070] text-sm sm:text-base"
              >
                {loading ? "Signing Up..." : "Sign Up"}
              </button>
            </form>

            <p className="text-sm sm:text-base text-center text-gray-500">
              Already have an account?{" "}
              <Link to="/login" className="text-primary underline hover:text-[#700070]">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Signup;
