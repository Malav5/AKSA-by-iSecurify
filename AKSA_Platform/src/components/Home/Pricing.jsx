import { Check } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const plans = [
  {
    name: "Freemium",
    price: "0",
    features: [
      "1 Domain Scan per month",
      "Basic DNS Check",
      "Limited Personal Security Scan",
      "Email Support",
    ],
  },
  {
    name: "Aditya",
    price: "29",
    features: [
      "5 Domain Scans per month",
      "Advanced DNS Check",
      "Full Personal Security Scan",
      "Priority Email Support",
      "Quttera Scan Integration",
    ],
  },
  {
    name: "Ayush",
    price: "79",
    features: [
      "15 Domain Scans per month",
      "Premium DNS Check",
      "Advanced Security Features",
      "24/7 Priority Support",
      "Full API Access",
      "Custom Scan Intervals",
    ],
  },
  {
    name: "Moksha",
    price: "199",
    features: [
      "Unlimited Domain Scans",
      "Enterprise DNS Security",
      "Custom Security Solutions",
      "Dedicated Support Team",
      "White Label Reports",
      "Custom Integration Options",
    ],
  },
];

const Pricing = () => {
  const navigate = useNavigate();

  useEffect(() => {
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
    if (planName === "Freemium") {
      navigate("/signup");
    } else {
      navigate("/payment-portal", { state: { plan: planName } });
    }
  };

  return (
    <div className="py-12 sm:py-16 lg:py-20 bg-white" id="pricing">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-8 sm:mb-12 text-primary">
          Pricing
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className="price-card border border-gray-200 rounded-lg p-4 sm:p-6 lg:p-8 transition-all duration-500 ease-in-out transform hover:scale-105 hover:-translate-y-2 hover:shadow-lg bg-white flex flex-col justify-between h-full cursor-pointer"
              onClick={() => handleCardClick(plan.name)}
            >
              <div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-primary">
                  {plan.name}
                </h3>
                <div className="mb-4 sm:mb-6 transform transition-all duration-500">
                  <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary">
                    ${plan.price}
                  </span>
                  <span className="text-sm sm:text-base text-gray-600">/month</span>
                </div>
                <ul className="space-y-2 sm:space-y-4 mb-6 sm:mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 group">
                      <Check className="w-4 h-4 sm:w-5 sm:h-5 text-primary transition-transform duration-300 group-hover:scale-110 flex-shrink-0 mt-0.5" />
                      <span className="text-xs sm:text-sm text-gray-600 leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Pricing;
