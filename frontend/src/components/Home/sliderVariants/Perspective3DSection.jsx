import React, { useState, useEffect, useRef, useCallback } from 'react';
import ExchangeCard from './ExchangeCard';
import styles from './VariantSections.module.css';

const Perspective3DSection = ({ websites = [], baseUrl = '' }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const total = websites.length || 10;

  const lastWheelTime = useRef(0);
  const touchStartY = useRef(0);

  const nextSlide = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Auto-slide every 3.2s
  useEffect(() => {
    if (isHovered || total <= 1) return;
    const timer = setInterval(nextSlide, 3200);
    return () => clearInterval(timer);
  }, [isHovered, nextSlide, total]);

  const handleWheel = (e) => {
    const now = Date.now();
    if (now - lastWheelTime.current < 260) return;
    if (e.deltaY > 10) {
      lastWheelTime.current = now;
      nextSlide();
    } else if (e.deltaY < -10) {
      lastWheelTime.current = now;
      prevSlide();
    }
  };

  const handleTouchStart = (e) => {
    if (e.touches && e.touches[0]) {
      touchStartY.current = e.touches[0].clientY;
    }
  };

  const handleTouchEnd = (e) => {
    if (!touchStartY.current || !e.changedTouches || !e.changedTouches[0]) return;
    const diff = touchStartY.current - e.changedTouches[0].clientY;
    if (Math.abs(diff) > 25) {
      if (diff > 0) nextSlide();
      else prevSlide();
    }
    touchStartY.current = 0;
  };

  const handleMouseEnter = () => {
    if (window.matchMedia && window.matchMedia('(hover: hover)').matches) {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const prevIndex = (activeIndex - 1 + total) % total;
  const nextIndex = (activeIndex + 1) % total;

  return (
    <div
      className={styles.variantContainer}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={styles.variantBadgeRow}>
        <span className={styles.libBadge}>4. 3D Perspective</span>
        <span className={styles.countBadge}>
          #{String(activeIndex + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </span>
      </div>

      <div className={styles.perspectiveViewport}>
        <div className={styles.fadeMaskTop} />
        <div className={styles.fadeMaskBottom} />

        <div className={styles.perspectiveStage}>
          {/* Top Card tilted up & back */}
          {websites[prevIndex] && (
            <div
              className={styles.cardSlotTop}
              onClick={prevSlide}
              title="Click to view previous exchange"
            >
              <ExchangeCard
                site={websites[prevIndex]}
                index={prevIndex}
                isActive={false}
                baseUrl={baseUrl}
              />
            </div>
          )}

          {/* Center Spotlight Card */}
          {websites[activeIndex] && (
            <div className={styles.cardSlotCenter}>
              <ExchangeCard
                site={websites[activeIndex]}
                index={activeIndex}
                isActive={true}
                baseUrl={baseUrl}
              />
            </div>
          )}

          {/* Bottom Card tilted down & back */}
          {websites[nextIndex] && (
            <div
              className={styles.cardSlotBottom}
              onClick={nextSlide}
              title="Click to view next exchange"
            >
              <ExchangeCard
                site={websites[nextIndex]}
                index={nextIndex}
                isActive={false}
                baseUrl={baseUrl}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Perspective3DSection;
