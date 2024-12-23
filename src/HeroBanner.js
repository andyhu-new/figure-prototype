import React, { useState, useEffect, useRef } from 'react';

const images = [
  'https://placecats.com/800/300',
  'https://placecats.com/801/300',
  'https://placecats.com/802/300'
];

function HeroBanner() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef(null);
  const delay = 5000; // 5 seconds

  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  useEffect(() => {
    // Auto-rotate
    startAutoRotate();
    return pauseAutoRotate; 
  }, []);

  const startAutoRotate = () => {
    intervalRef.current = setInterval(nextSlide, delay);
  };

  const pauseAutoRotate = () => {
    clearInterval(intervalRef.current);
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '800px',
        height: '300px',
        overflow: 'hidden',
        margin: '0 auto'
      }}
      onMouseEnter={pauseAutoRotate}
      onMouseLeave={startAutoRotate}
    >
      <img
        src={images[currentIndex]}
        alt="Cat Banner"
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
      <button
        onClick={prevSlide}
        style={{
          position: 'absolute',
          top: '50%',
          left: '10px',
          transform: 'translateY(-50%)'
        }}
      >
        ‹
      </button>
      <button
        onClick={nextSlide}
        style={{
          position: 'absolute',
          top: '50%',
          right: '10px',
          transform: 'translateY(-50%)'
        }}
      >
        ›
      </button>
    </div>
  );
}

export default HeroBanner;
