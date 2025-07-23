import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';

const Slider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Sample slider data - you can replace with your own content
  const slides = [
    {
      id: 1,
      type: 'testimonial',
      content: {
        text: "This service completely transformed our business operations. The results exceeded our expectations in every way.",
        author: "Sarah Johnson",
        position: "CEO, TechCorp",
        rating: 5,
        image: "/user3.jpg"
      }
    },
    {
      id: 2,
      type: 'feature',
      content: {
        title: "Advanced Analytics",
        subtitle: "Data-Driven Insights",
        description: "Get comprehensive analytics and reporting to make informed business decisions.",
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&h=300&fit=crop"
      }
    },
    {
      id: 3,
      type: 'testimonial',
      content: {
        text: "Outstanding support and incredible results. I couldn't be happier with the service quality.",
        author: "Michael Chen",
        position: "Founder, StartupXYZ",
        rating: 5,
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
      }
    },
    {
      id: 4,
      type: 'feature',
      content: {
        title: "24/7 Support",
        subtitle: "Always Here for You",
        description: "Round-the-clock support to ensure your business never misses a beat.",
        image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&h=300&fit=crop"
      }
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const renderTestimonial = (slide) => (
    <div className="flex flex-col items-center text-center space-y-6">
      <Quote className="w-12 h-12 text-primary/30" />
      <blockquote className="text-xl md:text-2xl font-medium text-gray-700 max-w-4xl leading-relaxed">
        "{slide.content.text}"
      </blockquote>
      <div className="flex items-center space-x-4">
        <img
          src={slide.content.image}
          alt={slide.content.author}
          className="w-16 h-16 rounded-full object-cover border-4 border-primary/20"
        />
        <div className="text-left">
          <h4 className="font-semibold text-gray-800">{slide.content.author}</h4>
          <p className="text-gray-600 text-sm">{slide.content.position}</p>
          <div className="flex space-x-1 mt-1">
            {renderStars(slide.content.rating)}
          </div>
        </div>
      </div>
    </div>
  );

  const renderFeature = (slide) => (
    <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
      <div className="flex-1 text-center md:text-left">
        <h3 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
          {slide.content.title}
        </h3>
        <p className="text-xl text-primary font-semibold mb-4">
          {slide.content.subtitle}
        </p>
        <p className="text-lg text-gray-600 leading-relaxed max-w-xl">
          {slide.content.description}
        </p>
      </div>
      <div className="flex-1 max-w-md">
        <img
          src={slide.content.image}
          alt={slide.content.title}
          className="w-full h-64 object-cover rounded-xl shadow-lg"
        />
      </div>
    </div>
  );

  return (
    <div className="relative bg-secondary to-primary/5 py-16 md:pt-24 ">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            What Our Clients Say
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover how we've helped businesses transform and achieve their goals
          </p>
        </div>

        {/* Slider Container */}
        <div 
          className="relative overflow-hidden rounded-2xl bg-white shadow-xl min-h-[400px] flex items-center"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          {/* Slides */}
          <div 
            className="flex transition-transform duration-700 ease-in-out w-full h-full"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {slides.map((slide, index) => (
              <div key={slide.id} className="w-full flex-shrink-0 p-8 md:p-12 flex items-center justify-center">
                {slide.type === 'testimonial' ? renderTestimonial(slide) : renderFeature(slide)}
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110 z-10"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110 z-10"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center mt-8 space-x-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'bg-primary scale-125' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Progress Bar */}
        {/* <div className="mt-6 max-w-md mx-auto">
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div 
              className="bg-primary h-1 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
            />
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default Slider;