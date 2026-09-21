import React, { useState, useRef, useEffect } from 'react';
import ExchangeCard from './ExchangeCard';
import styles from './VariantSections.module.css';

const FullFeedSection = ({ websites = [], baseUrl = '' }) => {
  const [activeItem, setActiveItem] = useState(0);
  const containerRef = useRef(null);
  const total = websites.length || 10;

  // Track active card based on scroll position
  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, clientHeight } = containerRef.current;
    const itemHeight = 140; // approx card height + gap
    const index = Math.min(
      Math.max(0, Math.round(scrollTop / itemHeight)),
      total - 1
    );
    setActiveItem(index);
  };

  return (
    <div className={styles.variantContainer}>
      <div className={styles.variantBadgeRow}>
        <span className={styles.libBadge}>5. Full Feed</span>
        <span className={styles.countBadge}>
          #{String(activeItem + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </span>
      </div>

      <div
        ref={containerRef}
        className={styles.fullFeedViewport}
        onScroll={handleScroll}
      >
        <div className={styles.fadeMaskTop} />
        <div className={styles.fadeMaskBottom} />

        <div className={styles.fullFeedList}>
          {websites.map((site, index) => (
            <div
              key={site.id || site._id || index}
              className={styles.fullFeedItem}
            >
              <ExchangeCard
                site={site}
                index={index}
                isActive={index === activeItem}
                baseUrl={baseUrl}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FullFeedSection;
