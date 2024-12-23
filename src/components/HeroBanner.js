import React, { useState, useEffect, useCallback, useRef } from 'react';
import './HeroBanner.css';

const HeroBanner = ({ images, interval = 5000 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const timerRef = useRef(null);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  }, [images.length]);

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(nextSlide, interval);
  }, [interval, nextSlide]);

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    startTimer();
    return () => stopTimer();
  }, [startTimer]);

  return (
    <div 
      className="hero-banner"
      onMouseEnter={stopTimer}
      onMouseLeave={startTimer}
    >
      <img
        src={images[currentIndex]}
        alt={`Slide ${currentIndex + 1}`}
      />
      <div className="hero-banner-controls">
        <button 
          className="hero-banner-button"
          onClick={prevSlide}
        >
          &#8249;
        </button>
        <button 
          className="hero-banner-button"
          onClick={nextSlide}
        >
          &#8250;
        </button>
      </div>
    </div>
  );
};

export default HeroBanner;