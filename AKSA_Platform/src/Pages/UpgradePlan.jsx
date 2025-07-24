import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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
        icon: <Server className="w-6 h-6 text-green-500" />,
        bestFor: "Enterprises & agencies",
        scanFrequency: "Real-time",
        users: "Unlimited users",
        highlights: [
            "Enterprise solution",
            "Custom security",
            "Dedicated support"
        ]
    },
];

const FeatureIcon = ({ icon, label }) => (
    <div className="flex items-center gap-2 mb-1">
        <div className="text-primary">{icon}</div>
        <span className="text-xs text-gray-500">{label}</span>
    </div>
);

const PlanHighlights = ({ highlights }) => (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-xs font-semibold text-gray-500 mb-2">HIGHLIGHTS</h4>
        <ul className="space-y-2">
            {highlights.map((highlight, index) => (
                <li key={index} className="flex items-start gap-2">
                    <Zap className="w-3 h-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <span className="text-xs text-gray-700">{highlight}</span>
                </li>
            ))}
        </ul>
    </div>
);

const FeatureComparison = () => (
    <div className="mt-16 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Feature Comparison</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-1">
                <div className="font-medium text-gray-500 text-sm mb-4">FEATURES</div>
                <ul className="space-y-4 text-sm text-gray-700">
                    <li className="h-8 flex items-center">User Accounts</li>
                    <li className="h-8 flex items-center">Scan Frequency</li>
                    <li className="h-8 flex items-center">Support</li>
                    <li className="h-8 flex items-center">API Access</li>
                    <li className="h-8 flex items-center">Data Retention</li>
                    <li className="h-8 flex items-center">Reporting</li>
                </ul>
            </div>
            {plans.map((plan, index) => (
                <div key={index} className="text-center">
                    <div className="font-medium text-sm mb-4">{plan.name}</div>
                    <ul className="space-y-4 text-sm">
                        <li className="h-8 flex items-center justify-center">{plan.users}</li>
                        <li className="h-8 flex items-center justify-center">{plan.scanFrequency}</li>
                        <li className="h-8 flex items-center justify-center">
                            {plan.name === "Moksha" ? "24/7 Dedicated" : 
                             plan.name === "Ayush" ? "24/7 Priority" : 
                             plan.name === "Aditya" ? "Priority Email" : "Email"}
                        </li>
                        <li className="h-8 flex items-center justify-center">
                            {plan.name === "Freemium" ? "None" : 
                             plan.name === "Aditya" ? "Basic" : "Full"}
                        </li>
                        <li className="h-8 flex items-center justify-center">
                            {plan.name === "Moksha" ? "1 Year" : 
                             plan.name === "Ayush" ? "30 Days" : "None"}
                        </li>
                        <li className="h-8 flex items-center justify-center">
                            {plan.name === "Moksha" ? "White Label" : 
                             plan.name === "Ayush" ? "Advanced" : "Basic"}
                        </li>
                    </ul>
                </div>
            ))}
        </div>
    </div>
);

const UpgradePlan = () => {
    const navigate = useNavigate();
    const [currentPlan, setCurrentPlan] = useState("Freemium");

    useEffect(() => {
        // Fetch the user's current plan from the backend
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

        const cards = document.querySelectorAll(".price-card");
        cards.forEach((card, index) => {
            card.style.opacity = "0";
            card.style.transform = "translateY(20px)";
            setTimeout(() => {
                card.style.opacity = "1";
                card.style.transform = "translateY(0)";
            }, 200 * (index + 1));
        });
    }, []);

    const handleCardClick = (planName) => {
        if (planName !== currentPlan) {
            navigate("/payment-portal", { state: { plan: planName } });
        }
    };

    return (
        <div className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-gray-50 to-white" id="upgrade-plan">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                <div className="text-center mb-12">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                        Choose Your Security Plan
                    </h2>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                        Protect your digital assets with our comprehensive security solutions. 
                        Upgrade to unlock advanced features and enterprise-grade protection.
                    </p>
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
                                {plan.name === currentPlan ? "Current Plan" : "Upgrade"}
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