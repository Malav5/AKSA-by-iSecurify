import React from "react";
import Navbar from "../components/Home/Navbar";
import Hero from "../components/Home/Hero";
import Services from "../components/Home/Services";
import About from "../components/Home/About";
import HowItWorks from "../components/Home/HowItWorks";
import Pricing from "../components/Home/Pricing";
import Footer from "../components/Home/Footer";
import AnimatedBackground from "../components/Home/AnimatedBackground";
import Slider from "../components/Home/Slider";
import PhotoSlider from "../components/Home/PhotoSlider";
const Home = () => {
  return (
    <div className="min-h-screen">
      <AnimatedBackground />
      <Navbar />
      <div className="pt-16">
         {/* Photo Slider - positioned right below hero */}
         <section className="relative">
          <PhotoSlider />
        </section>
        {/* <section id="home" className="bg-gradient-to-r from-primary/90 to-primary">
          <Hero />
        </section>
        */}
        <section id="about" className="bg-gradient-to-br from-primary/5 via-white to-primary/10">
          <About />
        </section>
        <section id="how-it-works" className="bg-gradient-to-tl from-primary/5 via-gray-50 to-primary/10">
          <HowItWorks />
        </section>
        <section id="services" className="bg-gradient-to-bl from-primary/10 via-white to-primary/5">
          <Services />
        </section>
        {/* Add the slider here - you can move it to any position you prefer */}
        <section id="testimonials" className="bg-gradient-to-r from-gray-50 to-white">
          <Slider />
        </section>

        <section id="pricing" className="bg-gradient-to-tr from-primary/10 via-gray-50 to-primary/5">
          <Pricing />
        </section>
        <section id="contact" className="bg-gradient-to-r from-primary/90 to-primary">
          <Footer />
        </section>
      </div>
    </div>
  );
};

export default Home; 
