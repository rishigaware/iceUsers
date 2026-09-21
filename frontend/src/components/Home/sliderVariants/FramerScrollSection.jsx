import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ExchangeCard from './ExchangeCard';
import styles from './VariantSections.module.css';

const FramerScrollSection = ({ websites = [], baseUrl = '' }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const containerRef = useRef(null);
  const lastWheelTime = useRef(0);
  const touchStartY = useRef(0);
  const total = websites.length || 10;

  // Smooth scroll to next section on the Home page
  const scrollToNextSection = useCallback(() => {
    const sectionEl = containerRef.current?.closest('section');
    let nextEl = sectionEl?.nextElementSibling;

    while (nextEl && (nextEl.offsetHeight === 0 || nextEl.tagName === 'SCRIPT')) {
      nextEl = nextEl.nextElementSibling;
    }

    if (nextEl && typeof nextEl.scrollIntoView === 'function') {
      nextEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollBy({ top: window.innerHeight * 0.85, behavior: 'smooth' });
    }
  }, []);

  // Smooth scroll to previous section on the Home page
  const scrollToPrevSection = useCallback(() => {
    const sectionEl = containerRef.current?.closest('section');
    let prevEl = sectionEl?.previousElementSibling;

    while (prevEl && (prevEl.offsetHeight === 0 || prevEl.tagName === 'SCRIPT')) {
      prevEl = prevEl.previousElementSibling;
    }

    if (prevEl && typeof prevEl.scrollIntoView === 'function') {
      prevEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollBy({ top: -window.innerHeight * 0.85, behavior: 'smooth' });
    }
  }, []);

  // Advance to next card, or if at #10, scroll to next section on home page
  const handleScrollDown = useCallback(() => {
    setCurrentIndex((prev) => {
      if (prev < total - 1) {
        setDirection(1);
        return prev + 1;
      } else {
        // All 10 have appeared! Scroll to next section in home
        scrollToNextSection();
        return prev;
      }
    });
  }, [total, scrollToNextSection]);

  // Go to previous card, or if at #1, scroll up to previous section
  const handleScrollUp = useCallback(() => {
    setCurrentIndex((prev) => {
      if (prev > 0) {
        setDirection(-1);
        return prev - 1;
      } else {
        // At first card: scroll up to previous section in home
        scrollToPrevSection();
        return prev;
      }
    });
  }, [scrollToPrevSection]);

  // Mouse wheel scroll handler (desktop & trackpad)
  const handleWheel = (e) => {
    const now = Date.now();
    if (now - lastWheelTime.current < 260) return;

    if (e.deltaY > 8) {
      lastWheelTime.current = now;
      handleScrollDown();
    } else if (e.deltaY < -8) {
      lastWheelTime.current = now;
      handleScrollUp();
    }
  };

  // Mobile Touch Gestures (swipe up to scroll down, swipe down to scroll up)
  const handleTouchStart = (e) => {
    if (e.touches && e.touches[0]) {
      touchStartY.current = e.touches[0].clientY;
    }
  };

  const handleTouchEnd = (e) => {
    if (!touchStartY.current || !e.changedTouches || !e.changedTouches[0]) return;
    const diff = touchStartY.current - e.changedTouches[0].clientY;

    if (Math.abs(diff) > 20) {
      if (diff > 0) {
        // Swiped UP -> user wants to scroll DOWN
        handleScrollDown();
      } else {
        // Swiped DOWN -> user wants to scroll UP
        handleScrollUp();
      }
    }
    touchStartY.current = 0;
  };

  const prevIndex = currentIndex > 0 ? currentIndex - 1 : null;
  const nextIndex = currentIndex < total - 1 ? currentIndex + 1 : null;
  const currentSite = websites[currentIndex] || websites[0];
  const prevSite = prevIndex !== null ? websites[prevIndex] : null;
  const nextSite = nextIndex !== null ? websites[nextIndex] : null;

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
        y: { type: 'spring', stiffness: 240, damping: 26 },
        opacity: { duration: 0.26 },
      },
    },
    exit: (dir) => ({
      y: dir > 0 ? -80 : 80,
      opacity: 0,
      scale: 0.96,
      transition: {
        y: { type: 'spring', stiffness: 240, damping: 26 },
        opacity: { duration: 0.22 },
      },
    }),
  };

  const isLast = currentIndex === total - 1;

  return (
    <div
      ref={containerRef}
      className={styles.variantContainer}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className={styles.variantBadgeRow}>
        <span className={styles.libBadge}>5. Scroll-Driven Spring</span>
        <span className={styles.countBadge}>
          {isLast ? (
            <span className={styles.scrollHintHighlight}>
              #{total} / {total} (Scroll down for next section ↓)
            </span>
          ) : (
            `#${String(currentIndex + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')} (Scroll to change)`
          )}
        </span>
      </div>

      <div className={styles.framerViewport}>
        <div className={styles.fadeMaskTop} />
        <div className={styles.fadeMaskBottom} />

        <div className={styles.springStackStage}>
          {/* Top Card Peek (Tap to go previous) */}
          {prevSite ? (
            <div
              className={styles.springCardTop}
              onClick={handleScrollUp}
              title="Click or scroll up for previous exchange"
            >
              <ExchangeCard
                site={prevSite}
                index={prevIndex}
                isActive={false}
                baseUrl={baseUrl}
              />
            </div>
          ) : (
            <div style={{ height: '24px' }} />
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

          {/* Bottom Card Peek (Tap to go next or scroll to next section) */}
          {nextSite ? (
            <div
              className={styles.springCardBottom}
              onClick={handleScrollDown}
              title="Click or scroll down for next exchange"
            >
              <ExchangeCard
                site={nextSite}
                index={nextIndex}
                isActive={false}
                baseUrl={baseUrl}
              />
            </div>
          ) : (
            <div
              className={styles.springCardBottom}
              onClick={scrollToNextSection}
              style={{ cursor: 'pointer', textAlign: 'center' }}
              title="Click to scroll to next section on Home page"
            >
              <div
                style={{
                  background: 'rgba(219, 39, 119, 0.15)',
                  border: '1px dashed #db2777',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  color: '#f472b6',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                }}
              >
                ↓ All 10 Viewed • Click or scroll down to continue to Next Section
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar Showing Position from 1 to 10 */}
      <div className={styles.scrollProgressBar}>
        <div
          className={styles.scrollProgressFill}
          style={{ width: `${((currentIndex + 1) / total) * 100}%` }}
        />
      </div>

      {/* Dynamic Status Text */}
      <div className={styles.scrollHintText}>
        {isLast ? (
          <span className={styles.scrollHintHighlight}>
            ✓ All 10 exchanges viewed! Scroll down to continue to next section ↓
          </span>
        ) : (
          <span>
            Scroll mouse or swipe up to advance ({currentIndex + 1}/{total}) • Reaches next section at #{total}
          </span>
        )}
      </div>
    </div>
  );
};

export default FramerScrollSection;
