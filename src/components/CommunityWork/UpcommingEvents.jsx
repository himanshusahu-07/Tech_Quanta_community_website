import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';

export default function SliderShowcase() {
  const [slides, setSlides] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animate, setAnimate] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const timeoutRef = useRef(null);
  const delay = 7000;

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const response = await axios.get(import.meta.env.VITE_GOOGLE_MACRO_API);

        if (response.data && Array.isArray(response.data.events)) {
          const mappedSlides = response.data.events.map(event => ({
            image: event.post_link || '',
            title: event.event_heading || '',
            description: event.event_description || '',
            link: event.event_registration_link || ''
          }));

          setSlides(mappedSlides);
          sessionStorage.setItem('slides', JSON.stringify(mappedSlides));
        } else {
          console.error('Unexpected data format:', response.data);
        }
      } catch (error) {
        console.error('Failed to fetch slide data:', error);
      }
    };

    fetchSlides();
  }, []);

  const nextSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setAnimate(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
      setAnimate(true);
      setIsAnimating(false);
    }, 300);
  };

  const prevSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setAnimate(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
      setAnimate(true);
      setIsAnimating(false);
    }, 300);
  };

  useEffect(() => {
    if (slides.length === 0) return;
    setAnimate(true);
    timeoutRef.current = setTimeout(nextSlide, delay);
    return () => clearTimeout(timeoutRef.current);
  }, [currentIndex, slides]);

  if (slides.length === 0) {
    return <div className="text-white p-10">Events...</div>;
  }

  const current = slides[currentIndex];

  return (
    <div
      className="relative w-screen xl:w-full min-h-[60vh] font-space-grotesk overflow-hidden"
      aria-label="Image slider"
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-[2000ms] ease-in-out scale-110 will-change-transform"
        style={{ backgroundImage: `url(${current.image})`, zIndex: 0 }}
        aria-hidden="true"
      >
        {/* Gradient overlay adapts to dark mode */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent dark:from-gray-900 dark:via-gray-900/80 dark:to-transparent" />
      </div>

      {/* Content box */}
      <div className="relative z-10 flex items-center justify-start h-full px-6 sm:px-10 lg:px-20 py-24">
        <div
          className={`rounded-xl p-8 max-w-2xl transition-all duration-1000 ease-in-out
            bg-white/10 backdrop-blur-md
            dark:bg-gray-900/70 dark:backdrop-blur-lg
            ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        >
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white drop-shadow-md leading-tight">
            {current.title}
          </h1>
          <p className="mt-6 text-md text-gray-200 dark:text-gray-300 leading-relaxed drop-shadow">
            {current.description}
          </p>
          {current.link && (
            <a
              href={current.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-6 px-6 py-3
                bg-[#2ECC71] hover:bg-[#00BFFF]
                text-white rounded-md shadow-lg transition
                dark:bg-[#27ae60] dark:hover:bg-[#009acd]"
            >
              Register Now
            </a>
          )}
        </div>
      </div>

      {/* Prev/Next buttons */}
      <button
        onClick={prevSlide}
        disabled={isAnimating}
        aria-label="Previous Slide"
        className={`absolute left-4 top-1/2 -translate-y-1/2 z-20 text-white text-4xl
          bg-white/10 hover:bg-cyan-500/50
          p-2 rounded-full shadow-md backdrop-blur-md transition-opacity
          dark:bg-gray-800 dark:hover:bg-cyan-600
          ${isAnimating ? 'opacity-50 cursor-not-allowed' : 'opacity-100'}`}
      >
        ‹
      </button>
      <button
        onClick={nextSlide}
        disabled={isAnimating}
        aria-label="Next Slide"
        className={`absolute right-4 top-1/2 -translate-y-1/2 z-20 text-white text-4xl
          bg-white/10 hover:bg-cyan-500/50
          p-2 rounded-full shadow-md backdrop-blur-md transition-opacity
          dark:bg-gray-800 dark:hover:bg-cyan-600
          ${isAnimating ? 'opacity-50 cursor-not-allowed' : 'opacity-100'}`}
      >
        ›
      </button>

      {/* Dots navigation */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-20">
        {slides.map((_, index) => (
          <div
            key={index}
            onClick={() => {
              if (isAnimating) return;
              setCurrentIndex(index);
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if ((e.key === 'Enter' || e.key === ' ') && !isAnimating) {
                setCurrentIndex(index);
              }
            }}
            aria-label={`Go to slide ${index + 1}`}
            className={`w-4 h-4 rounded-full cursor-pointer transition duration-300
              ${currentIndex === index ? 'bg-cyan-400 scale-125' : 'bg-white/30'}
              dark:${currentIndex === index ? 'bg-cyan-500' : 'bg-gray-400/50'}`}
          />
        ))}
      </div>
    </div>
  );
}
