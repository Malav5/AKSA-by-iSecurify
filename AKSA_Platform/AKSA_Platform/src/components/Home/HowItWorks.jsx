import { Search, Shield, BarChart, CheckCircle } from "lucide-react";
import { useEffect } from "react";

const steps = [
  {
    icon: Search,
    title: "1. Start Scanning",
    description:
      "Begin with a comprehensive scan of your digital assets. Our advanced algorithms analyze your security posture.",
    color: "bg-primary/10",
  },
  {
    icon: Shield,
    title: "2. Detect Threats",
    description:
      "Our AI-powered system identifies potential vulnerabilities and security risks in real-time.",
    color: "bg-primary/20",
  },
  {
    icon: BarChart,
    title: "3. Get Insights",
    description:
      "Receive detailed reports and actionable insights about your security status and potential improvements.",
    color: "bg-primary/30",
  },
  {
    icon: CheckCircle,
    title: "4. Stay Protected",
    description:
      "Implement recommended security measures and maintain continuous monitoring for ongoing protection.",
    color: "bg-primary/40",
  },
];

const HowItWorks = () => {
  useEffect(() => {
    const cards = document.querySelectorAll(".step-card");
    cards.forEach((card, index) => {
      card.style.opacity = "0";
      card.style.transform = "translateY(20px)";
      setTimeout(() => {
        card.style.opacity = "1";
        card.style.transform = "translateY(0)";
      }, 200 * (index + 1));
    });
  }, []);

  return (
    <div className="py-16 bg-secondary" id="how-it-works">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-primary mb-4">How It Works</h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Secure your digital assets in four simple steps with our
            comprehensive security scanning platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative group step-card"
              style={{ transition: "all 0.5s ease-in-out" }}
            >
              <div
                className={`${step.color} rounded-lg p-8 transition-all duration-500 ease-in-out transform group-hover:scale-105 group-hover:-translate-y-2 group-hover:shadow-lg border-2 border-primary h-full bg-white`}
              >
                <div className="mb-6 transform transition-transform duration-500 group-hover:rotate-12">
                  <step.icon className="w-12 h-12 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-primary mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600">{step.description}</p>
              </div>

              
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <button className="bg-primary text-white px-8 py-3 rounded-full font-semibold hover:bg-primary/90 transition-all duration-300 hover:scale-105 transform inline-flex items-center gap-2">
            Get Started Now
            <span className="text-lg">→</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
