import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ExchangeCard from './ExchangeCard';
import styles from './VariantSections.module.css';

const FramerSpringSection = ({ websites = [], baseUrl = '' }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = up (next), -1 = down (prev)
  const [isHovered, setIsHovered] = useState(false);
  const total = websites.length || 10;

  const lastWheelTime = useRef(0);
  const touchStartY = useRef(0);

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Auto-scroll every 3.2s (skip pause if device doesn't support true hover)
  useEffect(() => {
    if (isHovered || total <= 1) return;
    const timer = setInterval(nextSlide, 3200);
    return () => clearInterval(timer);
  }, [isHovered, nextSlide, total]);

  // Mouse wheel vertical navigation
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

  // Touch swipe gestures for mobile
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

  const prevIndex = (currentIndex - 1 + total) % total;
  const nextIndex = (currentIndex + 1) % total;
  const currentSite = websites[currentIndex] || websites[0];
  const prevSite = websites[prevIndex];
  const nextSite = websites[nextIndex];

  const variants = {
    enter: (dir) => ({
      y: dir > 0 ? 80 : -80,
      opacity: 0,
      scale: 0.96,
    }),
    center: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        y: { type: 'spring', stiffness: 220, damping: 24 },
        opacity: { duration: 0.28 },
      },
    },
    exit: (dir) => ({
      y: dir > 0 ? -80 : 80,
      opacity: 0,
      scale: 0.96,
      transition: {
        y: { type: 'spring', stiffness: 220, damping: 24 },
        opacity: { duration: 0.24 },
      },
    }),
  };

  const handleMouseEnter = () => {
    if (window.matchMedia && window.matchMedia('(hover: hover)').matches) {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

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
        <span className={styles.libBadge}>1. Framer Spring</span>
        <span className={styles.countBadge}>
          #{String(currentIndex + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </span>
      </div>

      <div className={styles.framerViewport}>
        <div className={styles.fadeMaskTop} />
        <div className={styles.fadeMaskBottom} />

        <div className={styles.springStackStage}>
          {/* Top Card Peek (Tap to go previous) */}
          {prevSite && (
            <div
              className={styles.springCardTop}
              onClick={prevSlide}
              title="Click to view previous exchange"
            >
              <ExchangeCard
                site={prevSite}
                index={prevIndex}
                isActive={false}
                baseUrl={baseUrl}
              />
            </div>
          )}

          {/* Center Animated Hero Card */}
          <div className={styles.springCardCenter}>
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={currentSite?.id || currentSite?._id || currentIndex}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                className={styles.motionCardWrapper}
              >
                <ExchangeCard
                  site={currentSite}
                  index={currentIndex}
                  isActive={true}
                  baseUrl={baseUrl}
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bottom Card Peek (Tap to go next) */}
          {nextSite && (
            <div
              className={styles.springCardBottom}
              onClick={nextSlide}
              title="Click to view next exchange"
            >
              <ExchangeCard
                site={nextSite}
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

export default FramerSpringSection;
