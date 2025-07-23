import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

const PhotoSlider = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    const photos = [
        {
            id: 1,
            src: "/Slider/slide1.jpg",
            alt: "Cybersecurity shield",
            heroContent: {
                badge: "🛡️ Advanced Threat Protection",
                title: "Defend Your",
                titleAccent: "Digital Future",
                subtitle: "Advanced threat detection, real-time monitoring, and comprehensive vulnerability management in one powerful platform",
                stats: [
                    { icon: "green", text: "99.9% Threat Detection" },
                    { icon: "blue", text: "24/7 Monitoring" },
                    { icon: "purple", text: "Zero-Day Protection" }
                ],
                primaryCTA: "Get Started Now",
                secondaryCTA: "Schedule Demo"
            }
        },
        {
            id: 2,
            src: "/Slider/slide2.jpg",
            alt: "Digital security network",
            heroContent: {
                badge: "🔍 Real-Time Intelligence",
                title: "Monitor Every",
                titleAccent: "Digital Asset",
                subtitle: "Comprehensive network surveillance with AI-powered analytics to detect and respond to threats before they impact your business",
                stats: [
                    { icon: "green", text: "Real-Time Alerts" },
                    { icon: "blue", text: "AI-Powered Analysis" },
                    { icon: "purple", text: "Automated Response" }
                ],
                primaryCTA: "See Live Demo",
                secondaryCTA: "Learn More"
            }
        },
        {
            id: 3,
            src: "/Slider/slide3.jpg",
            alt: "Data analytics dashboard",
            heroContent: {
                badge: "📊 Smart Analytics",
                title: "Transform Data",
                titleAccent: "Into Insights",
                subtitle: "Powerful dashboards and reporting tools that turn complex security data into actionable intelligence for your team",
                stats: [
                    { icon: "green", text: "Custom Dashboards" },
                    { icon: "blue", text: "Predictive Analytics" },
                    { icon: "purple", text: "Risk Scoring" }
                ],
                primaryCTA: "View Dashboard",
                secondaryCTA: "Get Report"
            }
        }
    ];

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % photos.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + photos.length) % photos.length);
    };

    const goToSlide = (index) => {
        setCurrentSlide(index);
    };

    // Preload images
    useEffect(() => {
        const imagePromises = photos.map((photo) => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = resolve;
                img.onerror = reject;
                img.src = photo.src;
            });
        });

        Promise.all(imagePromises)
            .then(() => setIsLoading(false))
            .catch(() => setIsLoading(false));
    }, []);

    if (isLoading) {
        return (
            <div className="relative h-96 md:h-[600px] bg-gradient-to-r from-primary/10 to-primary/5 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="relative h-96 md:h-[600px] overflow-hidden bg-black">
            {/* Image Slider */}
            <div
                className="flex transition-transform duration-700 ease-in-out h-full"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
                {photos.map((photo) => (
                    <div key={photo.id} className="w-full flex-shrink-0 relative h-full">
                        <img
                            src={photo.src}
                            alt={photo.alt}
                            className="w-full h-full object-cover"
                        />

                        {/* Custom Overlay */}
                        <div
                            className="absolute inset-0 bg-[#800080]/60 mix-blend-multiply"
                        />


                        {/* Hero Content */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="container mx-auto px-6">
                                <div className="flex flex-col items-center text-center space-y-6">
                                    <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
                                        {photo.heroContent.title}
                                        <span className="block bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                                            {photo.heroContent.titleAccent}
                                        </span>
                                    </h1>

                                    <p className="text-xl md:text-2xl text-white/90 max-w-4xl leading-relaxed">
                                        {photo.heroContent.subtitle}
                                    </p>

                                    <div className="flex flex-wrap justify-center gap-8 text-white/80 text-sm md:text-base">
                                        {photo.heroContent.stats.map((stat, idx) => (
                                            <div key={idx} className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${stat.icon === 'green' ? 'bg-green-400' :
                                                        stat.icon === 'blue' ? 'bg-blue-400' : 'bg-purple-400'
                                                    }`} />
                                                <span>{stat.text}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                        <button className="bg-white text-primary px-8 py-4 rounded-full font-semibold flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105 transform shadow-xl hover:shadow-2xl group">
                                            {photo.heroContent.primaryCTA}
                                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                        </button>
                                        <button className="bg-white/20 backdrop-blur-sm text-white border-2 border-white/30 px-8 py-4 rounded-full font-semibold transition-all duration-300 hover:bg-white/30 hover:scale-105 transform">
                                            {photo.heroContent.secondaryCTA}
                                        </button>
                                    </div>

                                    <div className="pt-8 text-white/70 text-sm">
                                        <p className="mb-2">Trusted by 500+ enterprises worldwide</p>
                                        <div className="flex justify-center items-center gap-6 opacity-60">
                                            <span className="text-xs">ISO 27001</span>
                                            <span className="text-xs">•</span>
                                            <span className="text-xs">SOC 2</span>
                                            <span className="text-xs">•</span>
                                            <span className="text-xs">GDPR Compliant</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Navigation Arrows */}
            <button
                onClick={prevSlide}
                className="absolute left-4 md:left-6 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-200 hover:scale-110 z-10"
                aria-label="Previous photo"
            >
                <ChevronLeft className="w-6 h-6" />
            </button>

            <button
                onClick={nextSlide}
                className="absolute right-4 md:right-6 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-200 hover:scale-110 z-10"
                aria-label="Next photo"
            >
                <ChevronRight className="w-6 h-6" />
            </button>

            {/* Dots Indicator */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3 z-10">
                {photos.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentSlide
                                ? 'bg-white scale-125 shadow-lg'
                                : 'bg-white/50 hover:bg-white/75'
                            }`}
                        aria-label={`Go to photo ${index + 1}`}
                    />
                ))}
            </div>

            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
                <div
                    className="bg-white h-full transition-all duration-700 ease-out"
                    style={{ width: `${((currentSlide + 1) / photos.length) * 100}%` }}
                />
            </div>
        </div>
    );
};

export default PhotoSlider;
