import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ExchangeCard from './ExchangeCard';
import styles from './VariantSections.module.css';

const FramerMarqueeSection = ({ websites = [], baseUrl = '' }) => {
  const [isPaused, setIsPaused] = useState(false);
  const total = websites.length || 10;

  // Duplicate websites array for seamless infinite vertical loop
  const duplicatedWebsites = [...websites, ...websites];

  const handleMouseEnter = () => {
    if (window.matchMedia && window.matchMedia('(hover: hover)').matches) {
      setIsPaused(true);
    }
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  return (
    <div
      className={styles.variantContainer}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setTimeout(() => setIsPaused(false), 800)}
    >
      <div className={styles.variantBadgeRow}>
        <span className={styles.libBadge}>3. Framer Marquee</span>
        <span className={styles.countBadge}>
          {isPaused ? '⏸ Paused' : '▶ Continuous Stream'}
        </span>
      </div>

      <div className={styles.marqueeViewport}>
        <div className={styles.fadeMaskTop} />
        <div className={styles.fadeMaskBottom} />

        <motion.div
          className={styles.marqueeTrack}
          animate={isPaused ? {} : { y: ['0%', '-50%'] }}
          transition={{
            y: {
              repeat: Infinity,
              repeatType: 'loop',
              duration: 32,
              ease: 'linear',
            },
          }}
        >
          {duplicatedWebsites.map((site, index) => {
            const actualIndex = index % total;
            return (
              <div key={`${site.id || site._id || index}-${index}`} className={styles.marqueeItem}>
                <ExchangeCard
                  site={site}
                  index={actualIndex}
                  isActive={true}
                  baseUrl={baseUrl}
                />
              </div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
};

export default FramerMarqueeSection;
