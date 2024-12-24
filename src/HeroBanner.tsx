import React, { useState, useEffect, useRef } from 'react';

const images: string[] = [
  'https://placecats.com/800/300',
  'https://placecats.com/801/300',
  'https://placecats.com/802/300',
];

const HeroBanner: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [scrollX, setScrollX] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const delay = 5000; // 5 seconds

  const nextSlide = (): void => {
    setCurrentIndex((prevIndex: number): number =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = (): void => {
    setCurrentIndex((prevIndex: number): number =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  useEffect(() => {
    // Auto-rotate
    startAutoRotate();
    return pauseAutoRotate;
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setScrollX((prevX) => Math.max(0, prevX - 50));
      } else if (e.key === 'ArrowRight') {
        setScrollX((prevX) => Math.min(800, prevX + 50));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const startAutoRotate = (): void => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(nextSlide, delay);
  };

  const pauseAutoRotate = (): void => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '800px',
        height: '300px',
        overflow: 'hidden',
        margin: '0 auto',
        scrollBehavior: 'smooth',
      }}
      onMouseEnter={(): void => pauseAutoRotate()}
      onMouseLeave={(): void => startAutoRotate()}
    >
      <img
        src={images[currentIndex]}
        alt="Cat Banner"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: scrollX === 0 ? 'none' : `translateX(-${scrollX}px)`,
        }}
      />
      <button
        onClick={(): void => prevSlide()}
        style={{
          position: 'absolute',
          top: '50%',
          left: '10px',
          transform: 'translateY(-50%)',
        }}
      >
        ‹
      </button>
      <button
        onClick={(): void => nextSlide()}
        style={{
          position: 'absolute',
          top: '50%',
          right: '10px',
          transform: 'translateY(-50%)',
        }}
      >
        ›
      </button>
    </div>
  );
};

export default HeroBanner;
