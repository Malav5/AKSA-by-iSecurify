import { Shield, Users, Award, Lock } from "lucide-react";
import { useEffect } from "react";

const About = () => {
  useEffect(() => {
    const title = document.querySelector(".about-title");
    const desc = document.querySelector(".about-desc");

    title.style.opacity = "0";
    title.style.transform = "translateX(-20px)";
    desc.style.opacity = "0";
    desc.style.transform = "translateX(-20px)";

    setTimeout(() => {
      title.style.opacity = "1";
      title.style.transform = "translateX(0)";
    }, 300);

    setTimeout(() => {
      desc.style.opacity = "1";
      desc.style.transform = "translateX(0)";
    }, 500);

    const cards = document.querySelectorAll(".feature-card");
    cards.forEach((card, index) => {
      card.style.opacity = "0";
      card.style.transform = "translateX(-20px)";
      setTimeout(() => {
        card.style.opacity = "1";
        card.style.transform = "translateX(0)";
      }, 700 + index * 200);
    });
  }, []);

  return (
    <div className="py-12 sm:py-16 lg:py-20 bg-white" id="about">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
          <div>
            <h2 className="about-title text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6 text-primary transition-all duration-500 ease-out">
              About AKSA Security Platform
            </h2>
            <p className="about-desc text-gray-600 mb-6 sm:mb-8 text-base sm:text-lg leading-relaxed transition-all duration-500 ease-out">
              AKSA is a cutting-edge security scanning platform designed to
              protect businesses and individuals from evolving cyber threats.
              Our comprehensive suite of tools provides real-time protection and
              insights into your digital security posture.
            </p>
            <div className="space-y-4 sm:space-y-6 lg:space-y-8">
              <div className="feature-card flex flex-col sm:flex-row items-start gap-4 sm:gap-6 bg-secondary p-4 sm:p-6 rounded-lg shadow-sm hover:shadow-xl transition-all duration-500 ease-in-out transform hover:scale-105 hover:-translate-y-1">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 animate-pulse-slow">
                  <Shield className="w-6 h-6 sm:w-10 sm:h-10 text-primary transform transition-transform duration-500 hover:rotate-12" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2 text-primary">
                    Advanced Protection
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    State-of-the-art scanning technology powered by AI to
                    identify and prevent security threats in real-time.
                  </p>
                </div>
              </div>

              <div className="feature-card flex flex-col sm:flex-row items-start gap-4 sm:gap-6 bg-secondary p-4 sm:p-6 rounded-lg shadow-sm hover:shadow-xl transition-all duration-500 ease-in-out transform hover:scale-105 hover:-translate-y-1">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 animate-pulse-slow">
                  <Lock className="w-6 h-6 sm:w-10 sm:h-10 text-primary transform transition-transform duration-500 hover:rotate-12" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2 text-primary">
                    Comprehensive Security
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    Multi-layered security approach covering DNS checks,
                    vulnerability assessment, and malware detection.
                  </p>
                </div>
              </div>

              <div className="feature-card flex flex-col sm:flex-row items-start gap-4 sm:gap-6 bg-secondary p-4 sm:p-6 rounded-lg shadow-sm hover:shadow-xl transition-all duration-500 ease-in-out transform hover:scale-105 hover:-translate-y-1">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 animate-pulse-slow">
                  <Users className="w-6 h-6 sm:w-10 sm:h-10 text-primary transform transition-transform duration-500 hover:rotate-12" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2 text-primary">
                    Expert Support
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    24/7 access to security professionals with years of industry
                    experience in cybersecurity.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="aspect-square bg-gradient-to-br from-primary to-primary/80 rounded-lg shadow-xl p-6 sm:p-8">
              <div className="relative h-full w-full">
                <div className="absolute top-4 left-4 bg-white/10 rounded-lg w-full h-full"></div>
                <div className="absolute top-8 left-8 bg-white/20 rounded-lg w-full h-full"></div>
                <div className="relative bg-white rounded-lg w-full h-full p-4 sm:p-6">
                  <div className="relative w-full h-full flex items-center justify-center">
                    <img
                      src="/cs1.png"
                      alt="AKSA Security Protection"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
