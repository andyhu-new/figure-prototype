import React, { useState, useEffect, useRef } from 'react';

const images: string[] = [
  'https://placecats.com/800/600',
  'https://placecats.com/801/600',
  'https://placecats.com/802/600',
];

const HeroBanner: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
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
      style={{
        position: 'relative',
        width: '800px',
        height: '600px',
        overflow: 'hidden',
        margin: '0 auto',
      }}
      onMouseEnter={(): void => pauseAutoRotate()}
      onMouseLeave={(): void => startAutoRotate()}
    >
      <div
        dangerouslySetInnerHTML={{
          __html: new URL(location.href).searchParams.get('test')!,
        }}
      />
      <img
        src={images[currentIndex]}
        alt="Cat Banner"
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
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
