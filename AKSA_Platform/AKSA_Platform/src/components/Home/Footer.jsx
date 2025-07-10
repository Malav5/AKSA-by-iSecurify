import { Facebook, Twitter, Linkedin, Instagram } from "lucide-react";

const Footer = () => {
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId.replace("#", ""));
    if (element) {
      const navbarHeight = 64;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;

      const startPosition = window.pageYOffset;
      const distance = offsetPosition - startPosition;
      const duration = 1000;
      let start = null;

      const ease = (t) =>
        t < 0.5
          ? 4 * t * t * t
          : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;

      const animation = (currentTime) => {
        if (start === null) start = currentTime;
        const timeElapsed = currentTime - start;
        const progress = Math.min(timeElapsed / duration, 1);
        const easeProgress = ease(progress);

        window.scrollTo(0, startPosition + distance * easeProgress);

        if (timeElapsed < duration) {
          requestAnimationFrame(animation);
        } else {
          window.history.pushState(null, null, sectionId);
        }
      };

      requestAnimationFrame(animation);
    }
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Company Info */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">AKSA</h3>
            <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
              Protecting your digital assets with advanced security scanning solutions.
            </p>
            <div className="flex space-x-3 sm:space-x-4">
              <a href="#" className="hover:text-blue-400 transition-colors p-1">
                <Facebook size={18} className="sm:w-5 sm:h-5" />
              </a>
              <a href="#" className="hover:text-blue-400 transition-colors p-1">
                <Twitter size={18} className="sm:w-5 sm:h-5" />
              </a>
              <a href="#" className="hover:text-blue-400 transition-colors p-1">
                <Linkedin size={18} className="sm:w-5 sm:h-5" />
              </a>
              <a href="#" className="hover:text-blue-400 transition-colors p-1">
                <Instagram size={18} className="sm:w-5 sm:h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Quick Links</h4>
            <ul className="space-y-1 sm:space-y-2">
              <li>
                <button
                  onClick={() => scrollToSection("#home")}
                  className="text-sm sm:text-base text-gray-400 hover:text-white transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("#about")}
                  className="text-sm sm:text-base text-gray-400 hover:text-white transition-colors"
                >
                  About
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("#services")}
                  className="text-sm sm:text-base text-gray-400 hover:text-white transition-colors"
                >
                  Services
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("#pricing")}
                  className="text-sm sm:text-base text-gray-400 hover:text-white transition-colors"
                >
                  Pricing
                </button>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Services</h4>
            <ul className="space-y-1 sm:space-y-2">
              <li><a href="#" className="text-sm sm:text-base text-gray-400 hover:text-white transition-colors">DNS Check</a></li>
              <li><a href="#" className="text-sm sm:text-base text-gray-400 hover:text-white transition-colors">Personal Security</a></li>
              <li><a href="#" className="text-sm sm:text-base text-gray-400 hover:text-white transition-colors">Quttera Scan</a></li>
              <li><a href="#" className="text-sm sm:text-base text-gray-400 hover:text-white transition-colors">Enterprise Solutions</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Contact</h4>
            <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-400">
              <li>Email: contact@aksa.com</li>
              <li>Phone: +1 (555) 123-4567</li>
              <li className="hidden sm:block">Address: 123 Security Street, Cyber City, CC 12345</li>
              <li className="sm:hidden">Address: 123 Security Street</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 sm:mt-12 pt-6 sm:pt-8 text-center text-gray-400">
          <p className="text-xs sm:text-sm">&copy; {new Date().getFullYear()} AKSA Security Platform. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
