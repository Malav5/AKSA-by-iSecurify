import { Shield, Globe, Lock, AlertCircle } from "lucide-react";
import { useEffect } from "react";

const services = [
  {
    icon: Shield,
    title: "Personal Security",
    description:
      "Comprehensive personal security scanning to protect your digital identity",
  },
  {
    icon: Globe,
    title: "DNS Check",
    description: "Advanced DNS security checks to prevent domain-based attacks",
  },
  {
    icon: Lock,
    title: "Quttera Scan",
    description:
      "Deep malware scanning and threat detection for your web assets",
  },
  {
    icon: AlertCircle,
    title: "Vulnerability Assessment",
    description:
      "Thorough analysis of potential security vulnerabilities in your system",
  },
];

const Services = () => {
  useEffect(() => {
    const cards = document.querySelectorAll(".service-card");
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
    <div className="py-12 sm:py-16 lg:py-20 bg-white" id="services">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-8 sm:mb-12 text-primary">
          Our Services
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="service-card bg-white p-4 sm:p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-500 ease-in-out transform hover:scale-105 hover:-translate-y-2"
              style={{ transition: "all 0.5s ease-in-out" }}
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3 sm:mb-4 transform transition-transform duration-500 hover:rotate-12">
                <service.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-primary">
                {service.title}
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Services;
