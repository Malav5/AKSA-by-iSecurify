import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
    Globe,
    Lock,
    Shield,Server, Users, Clock,LifeBuoy,Zap
  } from "lucide-react";

const plans = [
    {
        name: "Freemium",
        price: "0",
        features: [
            "1 Domain Scan per month",
            "Basic DNS Check",
            "Limited Personal Security Scan",
            "Email Support (48h response)",
            "Basic Threat Detection",
            "PDF Report Generation"
        ],
        icon: <Shield className="w-6 h-6 text-gray-500" />,
        bestFor: "Individuals getting started",
        scanFrequency: "Monthly",
        users: "Single user",
        highlights: [
            "Basic protection",
            "Ideal for personal websites",
            "Introductory security"
        ]
    },
    {
        name: "Aditya",
        price: "29",
        features: [
            "5 Domain Scans per month",
            "Advanced DNS Check",
            "Full Personal Security Scan",
            "Priority Email Support (24h response)",
            "Quttera Scan Integration",
            "Detailed Vulnerability Reports",
            "Scheduled Scanning",
            "CSV Export",
            "Basic API Access"
        ],
        icon: <Globe className="w-6 h-6 text-blue-500" />,
        bestFor: "Freelancers & small businesses",
        scanFrequency: "Weekly",
        users: "Up to 3 users",
        popular: true,
        highlights: [
            "Best value",
            "Growing business protection",
            "Enhanced scanning"
        ]
    },
    {
        name: "Ayush",
        price: "79",
        features: [
            "15 Domain Scans per month",
            "Premium DNS Check with history",
            "Advanced Security Features",
            "24/7 Priority Support",
            "Full API Access",
            "Custom Scan Intervals",
            "Team Management",
            "White-label Options",
            "Bulk Scanning",
            "Historical Data (30 days)"
        ],
        icon: <Lock className="w-6 h-6 text-purple-500" />,
        bestFor: "Growing businesses",
        scanFrequency: "Daily",
        users: "Up to 10 users",
        highlights: [
            "Professional grade",
            "Team collaboration",
            "Advanced analytics"
        ]
    },
    {
        name: "Moksha",
        price: "199",
        features: [
            "Unlimited Domain Scans",
            "Enterprise-grade DNS Security",
            "Custom Security Solutions",
            "Dedicated Support Team",
            "White Label Reports",
            "Custom Integration Options",
            "On-premise Deployment",
            "SIEM Integration",
            "Custom SLAs",
            "Security Consultation",
            "Historical Data (1 year)",
            "Custom Dashboard",
            "Priority Feature Requests"
        ],
        icon: <Server className="w-6 h-6 text-yellow-500" />,
        bestFor: "Enterprise organizations",
        scanFrequency: "Real-time",
        users: "Unlimited users",
        highlights: [
            "Enterprise grade",
            "Custom solutions",
            "Dedicated support"
        ]
    }
];

const FeatureIcon = ({ icon, label }) => (
    <div className="flex items-center gap-2 text-sm text-gray-600">
        {icon}
        <span>{label}</span>
    </div>
);

const PlanHighlights = ({ highlights }) => (
    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <ul className="space-y-1">
            {highlights.map((highlight, idx) => (
                <li key={idx} className="text-xs text-gray-600 flex items-center gap-2">
                    <div className="w-1 h-1 bg-primary rounded-full"></div>
                    {highlight}
                </li>
            ))}
        </ul>
    </div>
);

const FeatureComparison = () => (
    <div className="mt-16">
        <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Feature Comparison</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan, index) => (
                <div key={index} className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                    <div className="text-center mb-6">
                        <h4 className="text-lg font-bold text-gray-900 mb-2">{plan.name}</h4>
                        <span className="text-2xl font-bold text-primary">${plan.price}</span>
                        <span className="text-gray-500">/month</span>
                    </div>
                    <ul className="space-y-3">
                        <li className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Domain Scans</span>
                            <span className="text-sm font-medium">{plan.name === "Moksha" ? "Unlimited" : 
                                plan.name === "Ayush" ? "15/month" : 
                                plan.name === "Aditya" ? "5/month" : "1/month"}</span>
                        </li>
                        <li className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Users</span>
                            <span className="text-sm font-medium">{plan.users}</span>
                        </li>
                        <li className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Support</span>
                            <span className="text-sm font-medium">{plan.name === "Moksha" ? "24/7 Dedicated" : 
                                plan.name === "Ayush" ? "24/7 Priority" : 
                                plan.name === "Aditya" ? "24h Response" : "48h Response"}</span>
                        </li>
                        <li className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">API Access</span>
                            <span className="text-sm font-medium">{plan.name === "Freemium" ? "Basic" : 
                                plan.name === "Aditya" ? "Basic" : "Full"}</span>
                        </li>
                        <li className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Security Level</span>
                            <span className="text-sm font-medium">{plan.name === "Moksha" ? "Enterprise" : 
                                plan.name === "Ayush" ? "Advanced" : "Basic"}</span>
                        </li>
                    </ul>
                </div>
            ))}
        </div>
    </div>
);

const UpgradePlan = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [currentPlan, setCurrentPlan] = useState("Freemium");
    const [upgradeForUser, setUpgradeForUser] = useState(false);
    const [userInfo, setUserInfo] = useState(null);

    useEffect(() => {
        // Check if this is for upgrading a specific user
        if (location.state?.upgradeForUser) {
            setUpgradeForUser(true);
            setUserInfo({
                email: location.state.userEmail,
                name: location.state.userName,
                currentPlan: location.state.currentPlan
            });
            setCurrentPlan(location.state.currentPlan);
        } else {
            // Fetch the current user's plan from the backend
            const fetchUserPlan = async () => {
                try {
                    const token = localStorage.getItem("token");
                    const res = await axios.get("/api/auth/user", {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setCurrentPlan(res.data.user.plan || "Freemium");
                } catch (err) {
                    setCurrentPlan("Freemium");
                }
            };
            fetchUserPlan();
        }

        const cards = document.querySelectorAll(".price-card");
        cards.forEach((card, index) => {
            card.style.opacity = "0";
            card.style.transform = "translateY(20px)";
            setTimeout(() => {
                card.style.opacity = "1";
                card.style.transform = "translateY(0)";
            }, 200 * (index + 1));
        });
    }, [location.state]);

    const handleCardClick = (planName) => {
        if (planName !== currentPlan) {
            if (upgradeForUser) {
                // Navigate to payment portal with user upgrade info
                navigate("/payment-portal", { 
                    state: { 
                        plan: planName,
                        upgradeForUser: true,
                        userEmail: userInfo.email,
                        userName: userInfo.name
                    } 
                });
            } else {
                // Regular plan upgrade
                navigate("/payment-portal", { state: { plan: planName } });
            }
        }
    };

    return (
        <div className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-gray-50 to-white" id="upgrade-plan">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                <div className="mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center text-sm text-primary font-medium hover:underline hover:text-[#700070] transition"
                    >
                        ← Back
                    </button>
                </div>

                {/* Hero Content */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                        {upgradeForUser ? `Upgrade Plan for ${userInfo?.name}` : "Choose Your Security Plan"}
                    </h2>
                    {upgradeForUser && (
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="text-blue-800">
                                <strong>Current Plan:</strong> {userInfo?.currentPlan} | <strong>Email:</strong> {userInfo?.email}
                            </p>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                    {plans.map((plan, index) => (
                        <div
                            key={index}
                            className={`price-card relative border rounded-xl p-6 transition-all duration-300 ease-in-out 
                                ${plan.popular ? "border-2 border-primary shadow-xl" : "border-gray-200 shadow-md"} 
                                hover:shadow-lg hover:-translate-y-2 bg-white flex flex-col h-full cursor-pointer`}
                            onClick={() => handleCardClick(plan.name)}
                        >
                            {plan.popular && (
                                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
                                    MOST POPULAR
                                </div>
                            )}

                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        {plan.icon}
                                        <h3 className={`text-xl font-bold ${plan.popular ? "text-primary" : "text-gray-900"}`}>
                                            {plan.name}
                                        </h3>
                                    </div>
                                    {plan.popular && <Zap className="w-5 h-5 text-yellow-400 fill-current" />}
                                </div>

                                <div className="mb-6">
                                    <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                                    <span className="text-gray-500">/month</span>
                                </div>

                                <div className="mb-6 space-y-3">
                                    <FeatureIcon icon={<Users className="w-4 h-4" />} label={plan.users} />
                                    <FeatureIcon icon={<Clock className="w-4 h-4" />} label={plan.scanFrequency} />
                                    <FeatureIcon icon={<LifeBuoy className="w-4 h-4" />} label={plan.bestFor} />
                                </div>

                                <ul className="space-y-3 mb-6">
                                    {plan.features.slice(0, 5).map((feature, idx) => (
                                        <li key={idx} className="flex items-start gap-3 group">
                                            <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${plan.popular ? "text-primary" : "text-gray-400"} group-hover:text-primary`} />
                                            <span className="text-sm text-gray-700 leading-snug">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                {plan.highlights && <PlanHighlights highlights={plan.highlights} />}
                            </div>

                            <button
                                className={`w-full py-2 sm:py-3 rounded-lg transition-all duration-300 text-sm sm:text-base font-medium ${plan.name === currentPlan ? "bg-gray-300 text-gray-400 cursor-not-allowed" : "bg-primary text-white hover:bg-[#700070] hover:scale-105 transform"}`}
                                disabled={plan.name === currentPlan}
                            >
                                {plan.name === currentPlan ? "Current Plan" : upgradeForUser ? "Upgrade User" : "Upgrade"}
                            </button>
                        </div>
                    ))}
                </div>

                {/* <FeatureComparison /> */}

                <div className="mt-16 text-center">
                    <div className="inline-flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full">
                        <Check className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium">30-day money back guarantee</span>
                    </div>
                    <p className="mt-4 text-gray-600">
                        Need help choosing? <a href="#" className="text-primary hover:underline">Contact our sales team</a>
                    </p>
                </div>

                <div className="mt-16 bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-medium text-gray-900 mb-2">Can I upgrade or downgrade anytime?</h4>
                            <p className="text-gray-600 text-sm">Yes, you can change your plan at any time. Your billing will be prorated based on your usage.</p>
                        </div>
                        <div>
                            <h4 className="font-medium text-gray-900 mb-2">Is there a contract or long-term commitment?</h4>
                            <p className="text-gray-600 text-sm">No, all plans are month-to-month with no long-term contracts. Cancel anytime.</p>
                        </div>
                        <div>
                            <h4 className="font-medium text-gray-900 mb-2">Do you offer discounts for annual billing?</h4>
                            <p className="text-gray-600 text-sm">Yes, we offer 15% discount for annual payments. Contact sales for enterprise pricing.</p>
                        </div>
                        <div>
                            <h4 className="font-medium text-gray-900 mb-2">How does the free trial work?</h4>
                            <p className="text-gray-600 text-sm">All paid plans come with a 14-day free trial. No credit card required to start.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UpgradePlan;