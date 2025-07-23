import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const textVariant = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.3,
      duration: 0.6,
      ease: "easeOut",
    },
  }),
};

const Hero = () => {
  return (
    <div className="bg-gradient-to-r from-primary/90 to-primary text-white py-12 sm:py-16 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          <motion.h1
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 leading-tight"
            initial="hidden"
            animate="visible"
            custom={0}
            variants={textVariant}
          >
            <span className="bg-white text-primary px-2 py-1 rounded inline-block">
              Secure Your Digital Assets with AKSA
            </span>
          </motion.h1>

          <motion.p
            className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 max-w-2xl text-white leading-relaxed"
            initial="hidden"
            animate="visible"
            custom={1}
            variants={textVariant}
          >
            <span className="bg-white text-primary px-2 py-1 rounded inline-block">
              Comprehensive security scanning platform that protects your
              business from cyber threats. Get real-time insights and protection
              against vulnerabilities.
            </span>
          </motion.p>

          <motion.button
            className="bg-white text-primary px-6 sm:px-8 py-3 rounded-full font-semibold flex items-center gap-2 hover:bg-gray-100 transition-all duration-300 hover:scale-105 text-sm sm:text-base"
            initial="hidden"
            animate="visible"
            custom={2}
            variants={textVariant}
          >
            Get Started Now <ArrowRight size={18} className="sm:w-5 sm:h-5" />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default Hero;
