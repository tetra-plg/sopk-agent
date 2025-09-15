/**
 * 📱 Swipe Container
 *
 * Conteneur avec navigation par swipe pour mobile
 */

import React, { useState, useRef, useEffect, memo, useCallback } from 'react';

interface SwipeContainerProps {
  children: React.ReactNode[];
  showDots?: boolean;
  className?: string;
}

const SwipeContainer = ({ children, showDots = true, className = '' }: SwipeContainerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const currentX = useRef(0);
  const translate = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    startX.current = e.touches[0].clientX;
    currentX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;

    currentX.current = e.touches[0].clientX;
    const diff = currentX.current - startX.current;
    translate.current = diff;

    if (containerRef.current) {
      const currentTranslate = -currentIndex * 100 + (diff / containerRef.current.offsetWidth) * 100;
      containerRef.current.style.transform = `translateX(${currentTranslate}%)`;
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const diff = currentX.current - startX.current;
    const threshold = 50; // Seuil minimum pour déclencher un swipe

    if (Math.abs(diff) > threshold) {
      if (diff > 0 && currentIndex > 0) {
        // Swipe vers la droite - page précédente
        setCurrentIndex(currentIndex - 1);
      } else if (diff < 0 && currentIndex < children.length - 1) {
        // Swipe vers la gauche - page suivante
        setCurrentIndex(currentIndex + 1);
      }
    }

    // Remettre à la position correcte
    if (containerRef.current) {
      containerRef.current.style.transform = `translateX(-${currentIndex * 100}%)`;
    }

    translate.current = 0;
  };

  const handleMouseStart = (e: React.MouseEvent) => {
    setIsDragging(true);
    startX.current = e.clientX;
    currentX.current = e.clientX;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    currentX.current = e.clientX;
    const diff = currentX.current - startX.current;
    translate.current = diff;

    if (containerRef.current) {
      const currentTranslate = -currentIndex * 100 + (diff / containerRef.current.offsetWidth) * 100;
      containerRef.current.style.transform = `translateX(${currentTranslate}%)`;
    }
  };

  const handleMouseEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const diff = currentX.current - startX.current;
    const threshold = 50;

    if (Math.abs(diff) > threshold) {
      if (diff > 0 && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      } else if (diff < 0 && currentIndex < children.length - 1) {
        setCurrentIndex(currentIndex + 1);
      }
    }

    if (containerRef.current) {
      containerRef.current.style.transform = `translateX(-${currentIndex * 100}%)`;
    }

    translate.current = 0;
  };

  useEffect(() => {
    if (containerRef.current && !isDragging) {
      containerRef.current.style.transform = `translateX(-${currentIndex * 100}%)`;
    }
  }, [currentIndex, isDragging]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Container principal avec swipe */}
      <div
        ref={containerRef}
        className="flex transition-transform duration-300 ease-out cursor-grab active:cursor-grabbing"
        style={{
          transform: `translateX(-${currentIndex * 100}%)`
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseStart}
        onMouseMove={isDragging ? handleMouseMove : undefined}
        onMouseUp={handleMouseEnd}
        onMouseLeave={handleMouseEnd}
      >
        {children.map((child, index) => (
          <div
            key={index}
            className="w-full flex-shrink-0 px-2"
            style={{ minWidth: '100%' }}
          >
            {child}
          </div>
        ))}
      </div>

      {/* Navigation dots */}
      {showDots && children.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {children.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                index === currentIndex
                  ? 'bg-purple-500'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Aller à la page ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Navigation arrows (optionnel pour desktop) */}
      {children.length > 1 && (
        <>
          {currentIndex > 0 && (
            <button
              onClick={() => goToSlide(currentIndex - 1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white bg-opacity-80 rounded-full shadow-md flex items-center justify-center text-gray-600 hover:bg-opacity-100 transition-all lg:block hidden"
            >
              ←
            </button>
          )}

          {currentIndex < children.length - 1 && (
            <button
              onClick={() => goToSlide(currentIndex + 1)}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white bg-opacity-80 rounded-full shadow-md flex items-center justify-center text-gray-600 hover:bg-opacity-100 transition-all lg:block hidden"
            >
              →
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default memo(SwipeContainer);