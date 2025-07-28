import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  Globe,
  Lock,
  Shield,
  Server,
  Users,
  Clock,
  LifeBuoy,
  Zap,
  ArrowLeft,
  BadgeCheck,
  BarChart2,
  CreditCard,
  RefreshCw,
  HelpCircle
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
  <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
    <ul className="space-y-2">
      {highlights.map((highlight, idx) => (
        <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
          <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
          {highlight}
        </li>
      ))}
    </ul>
  </div>
);

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 pb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center w-full text-left"
      >
        <h4 className="font-medium text-gray-900">{question}</h4>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>
      {isOpen && (
        <p className="mt-2 text-gray-600 text-sm">{answer}</p>
      )}
    </div>
  );
};

const UpgradePlan = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentPlan, setCurrentPlan] = useState("Freemium");
  const [upgradeForUser, setUpgradeForUser] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [showAnnualPricing, setShowAnnualPricing] = useState(false);
  const [expandedPlan, setExpandedPlan] = useState(null);

  useEffect(() => {
    if (location.state?.upgradeForUser) {
      setUpgradeForUser(true);
      setUserInfo({
        email: location.state.userEmail,
        name: location.state.userName,
        currentPlan: location.state.currentPlan
      });
      setCurrentPlan(location.state.currentPlan);
    } else {
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

    // Animation for cards
    const cards = document.querySelectorAll(".price-card");
    cards.forEach((card, index) => {
      card.style.opacity = "0";
      card.style.transform = "translateY(20px)";
      setTimeout(() => {
        card.style.opacity = "1";
        card.style.transform = "translateY(0)";
      }, 150 * (index + 1));
    });
  }, [location.state]);

  const handleCardClick = (planName) => {
    if (planName !== currentPlan) {
      if (upgradeForUser) {
        navigate("/payment-portal", { 
          state: { 
            plan: planName,
            upgradeForUser: true,
            userEmail: userInfo.email,
            userName: userInfo.name,
            annualBilling: showAnnualPricing
          } 
        });
      } else {
        navigate("/payment-portal", { 
          state: { 
            plan: planName,
            annualBilling: showAnnualPricing
          } 
        });
      }
    }
  };

  const togglePlanDetails = (planName) => {
    setExpandedPlan(expandedPlan === planName ? null : planName);
  };

  const getAnnualPrice = (monthlyPrice) => {
    const price = parseInt(monthlyPrice);
    return Math.floor(price * 12 * 0.85); // 15% discount
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 sm:py-16 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Back button and header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-primary font-medium hover:text-primary/80 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
        </div>

        {/* Main header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {upgradeForUser ? `Upgrade Plan for ${userInfo?.name}` : "Choose Your Security Plan"}
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Select the perfect plan for your security needs. All plans include our 30-day satisfaction guarantee.
          </p>
          
          {upgradeForUser && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200 inline-flex items-center gap-4">
              <div>
                <p className="text-blue-800 font-medium">
                  Upgrading plan for: <span className="font-semibold">{userInfo?.name}</span>
                </p>
                <p className="text-blue-700 text-sm">
                  Current Plan: <span className="font-medium">{userInfo?.currentPlan}</span> | Email: {userInfo?.email}
                </p>
              </div>
              <BadgeCheck className="w-6 h-6 text-blue-500" />
            </div>
          )}
        </div>

        {/* Billing toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-white p-1 rounded-lg shadow-sm border border-gray-200 inline-flex">
            <button
              onClick={() => setShowAnnualPricing(false)}
              className={`px-4 py-2 rounded-md text-sm font-medium ${!showAnnualPricing ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setShowAnnualPricing(true)}
              className={`px-4 py-2 rounded-md text-sm font-medium ${showAnnualPricing ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              Annual Billing (15% off)
            </button>
          </div>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`price-card relative border rounded-xl p-6 transition-all duration-300 ease-in-out 
                ${plan.popular ? "border-2 border-primary shadow-xl" : "border-gray-200 shadow-md"} 
                hover:shadow-lg hover:-translate-y-1 bg-white flex flex-col h-full`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                  MOST POPULAR
                </div>
              )}

              <div className="mb-6 flex-grow">
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
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-bold text-gray-900">
                      ${showAnnualPricing ? getAnnualPrice(plan.price) : plan.price}
                    </span>
                    <span className="text-gray-500 text-lg">
                      /{showAnnualPricing ? 'year' : 'mo'}
                    </span>
                  </div>
                  {showAnnualPricing && plan.price !== "0" && (
                    <p className="text-gray-500 text-sm mt-1">
                      <span className="line-through">${plan.price * 12}</span> (Save ${plan.price * 12 - getAnnualPrice(plan.price)})
                    </p>
                  )}
                </div>

                <div className="mb-6 space-y-3">
                  <FeatureIcon icon={<Users className="w-4 h-4" />} label={plan.users} />
                  <FeatureIcon icon={<Clock className="w-4 h-4" />} label={plan.scanFrequency} />
                  <FeatureIcon icon={<LifeBuoy className="w-4 h-4" />} label={plan.bestFor} />
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.slice(0, 5).map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${plan.popular ? "text-primary" : "text-gray-400"}`} />
                      <span className="text-sm text-gray-700 leading-snug">{feature}</span>
                    </li>
                  ))}
                </ul>

                {expandedPlan === plan.name && (
                  <ul className="space-y-3 mb-6">
                    {plan.features.slice(5).map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${plan.popular ? "text-primary" : "text-gray-400"}`} />
                        <span className="text-sm text-gray-700 leading-snug">{feature}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {plan.highlights && <PlanHighlights highlights={plan.highlights} />}
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => handleCardClick(plan.name)}
                  className={`w-full py-3 rounded-lg transition-all duration-300 font-medium ${
                    plan.name === currentPlan 
                      ? "bg-gray-200 text-gray-600 cursor-not-allowed" 
                      : "bg-gradient-to-r from-[#800080] to-[#a242a2] text-white hover:bg-primary/90 hover:shadow-md"
                  }`}
                  disabled={plan.name === currentPlan}
                >
                  {plan.name === currentPlan ? "Current Plan" : upgradeForUser ? "Upgrade User" : "Get Started"}
                </button>

                <button
                  onClick={() => togglePlanDetails(plan.name)}
                  className="w-full text-sm text-primary font-medium hover:underline flex items-center justify-center gap-1"
                >
                  {expandedPlan === plan.name ? "Show less" : "Show all features"}
                  {expandedPlan === plan.name ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Guarantee and support */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-3 bg-gray-100 px-5 py-3 rounded-full">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium">30-day money back guarantee</span>
            </div>
            <div className="h-5 w-px bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-medium">24/7 customer support</span>
            </div>
          </div>
          <p className="mt-4 text-gray-600">
            Need help choosing? <a href="#" className="text-primary hover:underline font-medium">Contact our sales team</a>
          </p>
        </div>

        {/* FAQ section */}
        <div className="mt-16 bg-white p-8 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <FAQItem 
              question="Can I upgrade or downgrade anytime?" 
              answer="Yes, you can change your plan at any time. Your billing will be prorated based on your usage." 
            />
            <FAQItem 
              question="Is there a contract or long-term commitment?" 
              answer="No, all plans are month-to-month with no long-term contracts. Cancel anytime." 
            />
            <FAQItem 
              question="Do you offer discounts for annual billing?" 
              answer="Yes, we offer 15% discount for annual payments. Enterprise customers may qualify for additional discounts." 
            />
            <FAQItem 
              question="How does the free trial work?" 
              answer="All paid plans come with a 14-day free trial. No credit card required to start." 
            />
            <FAQItem 
              question="What payment methods do you accept?" 
              answer="We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and bank transfers for enterprise customers." 
            />
            <FAQItem 
              question="Can I cancel my subscription anytime?" 
              answer="Absolutely. You can cancel anytime and continue using the service until the end of your billing period." 
            />
          </div>
        </div>

        {/* Enterprise CTA */}
        {!upgradeForUser && (
          <div className="mt-16 bg-gradient-to-r from-[#800080] to-[#ee8cee] rounded-xl p-8 text-center text-white">
            <h3 className="text-2xl font-bold mb-4">Need enterprise-grade security?</h3>
            <p className="text-lg mb-6 max-w-2xl mx-auto">
              Our Moksha plan offers custom solutions for large organizations with complex security needs.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button 
                onClick={() => handleCardClick("Moksha")}
                className="bg-white text-primary px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition"
              >
                Explore Enterprise Plan
              </button>
              <button className="bg-transparent border border-white px-6 py-3 rounded-lg font-medium hover:bg-white/10 transition">
                Contact Sales
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpgradePlan;