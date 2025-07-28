import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { CheckCircle, XCircle, Mail, RefreshCw } from "lucide-react";

const VerifyEmail = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState("verifying"); // verifying, success, error, expired, resent
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");

    const token = searchParams.get("token");

    useEffect(() => {
        if (token) {
            verifyEmail(token);
        } else {
            setStatus("error");
            setMessage("Invalid verification link. Please check your email and try again.");
        }
    }, [token]);

    const verifyEmail = async (verificationToken) => {
        try {
            setLoading(true);
            const response = await fetch("http://localhost:3000/api/auth/verify-email", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ token: verificationToken }),
            });

            const data = await response.json();

            if (response.ok) {
                setStatus("success");
                setMessage(data.message);

                // Store token and user data for automatic login
                localStorage.setItem("token", data.token);
                localStorage.setItem("currentUser", data.user.email);

                if (data.user.role) {
                    localStorage.setItem("role", data.user.role);
                }
                if (data.user.plan) {
                    localStorage.setItem("plan", data.user.plan);
                }

                // Redirect to dashboard after 3 seconds
                setTimeout(() => {
                    navigate("/deaddashboard");
                }, 3000);
            } else {
                if (data.error.includes("expired")) {
                    setStatus("expired");
                    setMessage("Verification link has expired. Please request a new one.");
                } else {
                    setStatus("error");
                    setMessage(data.error || "Verification failed. Please try again.");
                }
            }
        } catch (error) {
            setStatus("error");
            setMessage("Network error. Please check your connection and try again.");
        } finally {
            setLoading(false);
        }
    };

    const resendVerification = async () => {
        if (!email) {
            setMessage("Please enter your email address.");
            return;
        }

        try {
            setLoading(true);
            const response = await fetch("http://localhost:3000/api/auth/resend-verification", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(data.message);
                setStatus("resent");
            } else {
                setMessage(data.error || "Failed to resend verification email.");
                setStatus("error");
            }
        } catch (error) {
            setMessage("Network error. Please try again.");
            setStatus("error");
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = () => {
        switch (status) {
            case "success":
                return <CheckCircle className="w-16 h-16 text-green-500" />;
            case "resent":
                return <CheckCircle className="w-16 h-16 text-blue-500" />;
            case "error":
            case "expired":
                return <XCircle className="w-16 h-16 text-red-500" />;
            default:
                return <Mail className="w-16 h-16 text-blue-500 animate-pulse" />;
        }
    };

    const getStatusColor = () => {
        switch (status) {
            case "success":
                return "text-green-600";
            case "resent":
                return "text-blue-600";
            case "error":
            case "expired":
                return "text-red-600";
            default:
                return "text-blue-600";
        }
    };

    return (
        <main className="min-h-screen w-full bg-white flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center">
                    {/* Logo */}
                    <div className="mb-8">
                        <div className="flex items-baseline justify-center space-x-2">
                            <h1 className="text-3xl font-semibold text-gray-800">AKSA</h1>
                            <div className="flex items-center space-x-1">
                                <span className="text-base text-gray-600">By</span>
                                <img src="/logo.png" alt="Logo" className="h-4 w-4" />
                                <span className="text-base text-gray-600">iSecurify</span>
                            </div>
                        </div>
                    </div>

                    {/* Status Icon */}
                    <div className="flex justify-center mb-6">
                        {getStatusIcon()}
                    </div>

                    {/* Title */}
                    <h2 className={`text-2xl font-bold mb-4 ${getStatusColor()}`}>
                        {status === "verifying" && "Verifying Your Email"}
                        {status === "success" && "Email Verified!"}
                        {status === "resent" && "Email Sent!"}
                        {status === "error" && "Verification Failed"}
                        {status === "expired" && "Link Expired"}
                    </h2>

                    {/* Message */}
                    <p className="text-gray-600 mb-6 leading-relaxed">
                        {message || "Please wait while we verify your email address..."}
                    </p>

                    {/* Loading Spinner */}
                    {loading && (
                        <div className="flex justify-center mb-6">
                            <RefreshCw className="w-6 h-6 text-blue-500 animate-spin" />
                        </div>
                    )}

                    {/* Action Buttons */}
                    {status === "success" && (
                        <div className="space-y-4">
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <p className="text-green-700 text-sm">
                                    Redirecting to dashboard in a few seconds...
                                </p>
                            </div>
                            <button
                                onClick={() => navigate("/deaddashboard")}
                                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition duration-200"
                            >
                                Go to Dashboard
                            </button>
                        </div>
                    )}

                    {status === "resent" && (
                        <div className="space-y-4">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-blue-700 text-sm">
                                    A new verification email has been sent to your inbox. Please check your email and click the verification link.
                                </p>
                            </div>
                            <Link
                                to="/login"
                                className="block w-full text-center bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition duration-200"
                            >
                                Back to Login
                            </Link>
                        </div>
                    )}

                    {(status === "error" || status === "expired") && (
                        <div className="space-y-4">
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <p className="text-red-700 text-sm mb-3">
                                    Don't worry! You can request a new verification email.
                                </p>
                                <input
                                    type="email"
                                    placeholder="Enter your email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <button
                                onClick={resendVerification}
                                disabled={loading}
                                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? "Sending..." : "Resend Verification Email"}
                            </button>
                            <Link
                                to="/login"
                                className="block w-full text-center text-blue-600 hover:text-blue-700 font-medium"
                            >
                                Back to Login
                            </Link>
                        </div>
                    )}

                    {/* Help Text */}
                    <div className="mt-8 text-sm text-gray-500">
                        <p>
                            Having trouble? Check your spam folder or{" "}
                            <Link to="/contact" className="text-blue-600 hover:text-blue-700">
                                contact support
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default VerifyEmail; 