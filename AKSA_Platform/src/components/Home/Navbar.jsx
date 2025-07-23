import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const scrollToSection = (sectionId) => {
    setIsMenuOpen(false);
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

  const sections = ["about", "how-it-works", "services", "pricing", "contact"];

  return (
    <nav className="bg-[#fdf4ff] fixed w-full z-50 shadow-sm">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center">
          {/* Logo */}
          <div className="w-1/4">
            <button onClick={() => scrollToSection("#home")} className="flex items-center">
              <span className="text-3xl md:text-4xl font-bold text-black">AKSA</span>
              <span className="text-sm ml-2 mt-auto mb-1 flex items-center">
                By
                <img src="/logo.png" alt="logo" className="h-4 w-4 mx-1" />
                <span className="text-primary">iSecurify</span>
              </span>
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="w-2/4 hidden md:flex justify-center space-x-10">
            {sections.map((id) => (
              <button
                key={id}
                onClick={() => scrollToSection(`#${id}`)}
                className="text-gray-600 hover:text-primary transition-all duration-300 transform hover:scale-105"
              >
                {id.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
              </button>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="w-1/4 hidden md:flex items-center justify-end space-x-4">
            <button
              onClick={() => navigate("/login")}
              className="px-6 py-2 text-primary hover:text-primary/80 transition-colors font-semibold hover:bg-primary/10 rounded-lg"
            >
              Log In
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-semibold"
            >
              Sign Up
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-600 hover:text-primary transition-colors ml-auto"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden mt-4 pb-4 px-6">
          <div className="flex flex-col space-y-2">
            {sections.map((id) => (
              <button
                key={id}
                onClick={() => scrollToSection(`#${id}`)}
                className="text-gray-600 hover:text-primary transition-colors text-left px-4 py-2"
              >
                {id.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
              </button>
            ))}
            <div className="border-t border-gray-200 pt-4 mt-2">
              <button
                onClick={() => navigate("/login")}
                className="block text-primary hover:text-primary/80 transition-colors px-4 py-2 w-full text-left font-semibold hover:bg-primary/10 rounded-lg"
              >
                Log In
              </button>
              <button
                onClick={() => navigate("/signup")}
                className="block bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors px-4 py-2 mt-2 text-center"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
