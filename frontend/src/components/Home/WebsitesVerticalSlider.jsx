import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  FaCoins,
  FaLock,
  FaExternalLinkAlt,
  FaCheckCircle,
  FaMouse,
  FaShieldAlt,
} from 'react-icons/fa';
import { useUser } from '../../context/UserContext';
import { getImageUrl } from '../../utils/imageUrl';
import styles from './WebsitesVerticalSlider.module.css';

// 10 Static websites strictly matching backend Website schema
export const STATIC_WEBSITES = [
  {
    id: "69c24ad2bbdca9b3f8d20751",
    _id: "69c24ad2bbdca9b3f8d20751",
    website: "iceasia9",
    url: "https://iceasia9.com/sport/game/cricket",
    adminUrl: "https://iceasia9.com/sport/game/cwricket/admin",
    category: "NON REFUNDABLE COIN'S",
    logo: "https://res.cloudinary.com/dix9vpwvr/image/upload/v1774340816/the247panel/logos/hllvjz0nj3skyinz5tdz.jpg",
    coinRate: 0.06,
    minimumCoins: 100000,
    isActive: true,
  },
  {
    id: "69c24b6abbdca9b3f8d2075b",
    _id: "69c24b6abbdca9b3f8d2075b",
    website: "ICEBOOK7",
    url: "https://www.icebook7.com/",
    adminUrl: "",
    category: "NON REFUNDABLE COIN'S",
    logo: "https://res.cloudinary.com/dix9vpwvr/image/upload/v1774340969/the247panel/logos/puazr47ecn4phbtykm0h.jpg",
    coinRate: 0.1,
    minimumCoins: 150000,
    isActive: true,
  },
  {
    id: "69c24bc6bbdca9b3f8d20763",
    _id: "69c24bc6bbdca9b3f8d20763",
    website: "ICE247",
    url: "https://ice247.co/",
    adminUrl: "",
    category: "NON REFUNDABLE COIN'S",
    logo: "https://res.cloudinary.com/dix9vpwvr/image/upload/v1774341061/the247panel/logos/bypdfewhopwtdeobfw6r.jpg",
    coinRate: 0.16,
    minimumCoins: 150000,
    isActive: true,
  },
  {
    id: "69c24c24bbdca9b3f8d2076b",
    _id: "69c24c24bbdca9b3f8d2076b",
    website: "ICEBOOK9",
    url: "https://icebook9.com/",
    adminUrl: "",
    category: "ICE EXCHANGE",
    logo: "https://res.cloudinary.com/dix9vpwvr/image/upload/v1778416132/the247panel/logos/jxn53m4qrjhw2wjsqncs.jpg",
    coinRate: 0.16,
    minimumCoins: 10000,
    isActive: true,
  },
  {
    id: "69c24c73bbdca9b3f8d20772",
    _id: "69c24c73bbdca9b3f8d20772",
    website: "ICEBOOK777",
    url: "https://icebook777.com/",
    adminUrl: "",
    category: "ICE EXCHANGE",
    logo: "https://res.cloudinary.com/dix9vpwvr/image/upload/v1774341234/the247panel/logos/iprktut9kcdkguzemv0o.jpg",
    coinRate: 0.18,
    minimumCoins: 10000,
    isActive: true,
  },
  {
    id: "69c24cb8bbdca9b3f8d2077c",
    _id: "69c24cb8bbdca9b3f8d2077c",
    website: "ICEBOOK365",
    url: "https://icebook365.com/",
    adminUrl: "",
    category: "SKYEXCH",
    logo: "https://res.cloudinary.com/dix9vpwvr/image/upload/v1774341303/the247panel/logos/k69ipsuxamkyd11yksvu.jpg",
    coinRate: 0.19,
    minimumCoins: 10000,
    isActive: true,
  },
  {
    id: "69c24d1cbbdca9b3f8d20784",
    _id: "69c24d1cbbdca9b3f8d20784",
    website: "ICEBOOK247",
    url: "https://www.icebook247.com/index.html",
    adminUrl: "",
    category: "ICE EXCHANGE",
    logo: "https://res.cloudinary.com/dix9vpwvr/image/upload/v1774341404/the247panel/logos/ljayk9um6wqs9jwyue7s.jpg",
    coinRate: 0.16,
    minimumCoins: 10000,
    isActive: true,
  },
  {
    id: "69c24d6fbbdca9b3f8d2078c",
    _id: "69c24d6fbbdca9b3f8d2078c",
    website: "ICETURBO24 7",
    url: "https://iceturbo247.com/",
    adminUrl: "",
    category: "ICE EXCHANGE",
    logo: "https://res.cloudinary.com/dix9vpwvr/image/upload/v1774341487/the247panel/logos/c7v39lljrfv3mbgyrqru.jpg",
    coinRate: 0.16,
    minimumCoins: 10000,
    isActive: true,
  },
  {
    id: "69c24db2bbdca9b3f8d20793",
    _id: "69c24db2bbdca9b3f8d20793",
    website: "ICE777",
    url: "https://ice777.com/",
    adminUrl: "",
    category: "ICE-OFFER'S(365)",
    logo: "https://res.cloudinary.com/dix9vpwvr/image/upload/v1774341554/the247panel/logos/pbdcxjnhmcqih29tyibi.jpg",
    coinRate: 0.18,
    minimumCoins: 10000,
    isActive: true,
  },
  {
    id: "69c24e2fbbdca9b3f8d2079c",
    _id: "69c24e2fbbdca9b3f8d2079c",
    website: "ICE777 WORLD",
    url: "https://ice777.world/",
    adminUrl: "",
    category: "GLOBAL",
    logo: "https://res.cloudinary.com/dix9vpwvr/image/upload/v1774341678/the247panel/logos/hkgaxnu1he4tmxsyd7nf.jpg",
    coinRate: 0.08,
    minimumCoins: 10000,
    isActive: true,
  },
];

const WebsitesVerticalSlider = () => {
  const { user, url } = useUser();

  const [websites, setWebsites] = useState(STATIC_WEBSITES);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const timerRef = useRef(null);
  const lastWheelTime = useRef(0);
  const touchStartY = useRef(0);
  const touchStartX = useRef(0);
  const touchHandled = useRef(false);

  // Responsive breakpoint tracker
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch Websites from backend API (sliced to 10)
  const fetchWebsites = useCallback(async () => {
    try {
      const userId = user?.id || user?._id || '';
      const response = await fetch(`${url}/api/admin/get-websites${userId ? `?userId=${userId}` : ''}`);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setWebsites(data.slice(0, 10));
        }
      }
    } catch (err) {
      console.warn('WebsitesVerticalSlider: using fallback static data', err);
    }
  }, [url, user?.id, user?._id]);

  useEffect(() => {
    fetchWebsites();
  }, [fetchWebsites]);

  const total = websites.length || 10;

  // Slide navigation
  const nextSlide = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Auto-scroll upper animation (every 3.2 seconds)
  // IMPORTANT: Ensure isHovered is only checked on devices that actually support hover (mouse), not touch!
  useEffect(() => {
    if (isHovered || total <= 1) return;

    timerRef.current = setInterval(() => {
      nextSlide();
    }, 3200);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isHovered, nextSlide, total]);

  // Mouse hover handlers that only activate for desktop mouse pointers
  const handleMouseEnter = () => {
    if (window.matchMedia && window.matchMedia('(hover: hover)').matches) {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    if (window.matchMedia && window.matchMedia('(hover: hover)').matches) {
      setIsHovered(false);
    }
  };

  // Mouse wheel scroll (throttled)
  const handleWheel = (e) => {
    const now = Date.now();
    if (now - lastWheelTime.current < 260) return;

    if (e.deltaY < -10) {
      lastWheelTime.current = now;
      prevSlide();
    } else if (e.deltaY > 10) {
      lastWheelTime.current = now;
      nextSlide();
    }
  };

  // Mobile Touch Swipe Up / Down (Immediate response on touchmove and touchend)
  const handleTouchStart = (e) => {
    if (e.touches && e.touches[0]) {
      touchStartY.current = e.touches[0].clientY;
      touchStartX.current = e.touches[0].clientX;
      touchHandled.current = false;
    }
  };

  const handleTouchMove = (e) => {
    if (touchHandled.current || !e.touches || !e.touches[0]) return;
    const diffY = touchStartY.current - e.touches[0].clientY;
    const diffX = touchStartX.current - e.touches[0].clientX;

    // Detect intentional vertical swipe (diff > 25px and predominantly vertical)
    if (Math.abs(diffY) > 25 && Math.abs(diffY) > Math.abs(diffX) * 1.1) {
      if (diffY > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
      touchHandled.current = true;
    }
  };

  const handleTouchEnd = (e) => {
    if (!touchHandled.current && e.changedTouches && e.changedTouches[0]) {
      const diffY = touchStartY.current - e.changedTouches[0].clientY;
      const diffX = touchStartX.current - e.changedTouches[0].clientX;
      if (Math.abs(diffY) > 25 && Math.abs(diffY) > Math.abs(diffX)) {
        if (diffY > 0) {
          nextSlide();
        } else {
          prevSlide();
        }
      }
    }
    touchHandled.current = false;
  };

  const handleCardClick = (site) => {
    if (site.url) {
      window.open(site.url, '_blank', 'noopener,noreferrer');
    }
  };

  // Exact integer pixel calculations for desktop and mobile
  // Desktop: Card 140px, Gap 16px -> Step 156px. Viewport 330px -> Center offset: (330 - 140) / 2 = 95px
  // Mobile: Card 146px, Gap 14px -> Step 160px. Viewport 340px -> Center offset: (340 - 146) / 2 = 97px
  const CARD_HEIGHT = isMobile ? 146 : 140;
  const CARD_GAP = isMobile ? 14 : 16;
  const CARD_STEP = CARD_HEIGHT + CARD_GAP;
  const VIEWPORT_HEIGHT = isMobile ? 340 : 330;
  const CENTER_OFFSET = isMobile ? 97 : 95;
  const trackTranslateY = CENTER_OFFSET - activeIndex * CARD_STEP;

  return (
    <section
      className={styles.section}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={() => { touchHandled.current = false; }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-label="Top 10 Live Exchange Websites Showcase"
    >
      <div className={styles.wrapper}>
        {/* Section Header */}
        <div className={styles.header}>
          <div className={styles.tagLine}>
            <span className={styles.livePill}>
              <span className={styles.liveDot} />
              LIVE EXCHANGE FEED
            </span>
            <span className={styles.indexCounter}>
              #{String(activeIndex + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
            </span>
          </div>

          <h2 className={styles.title}>
            Top <span className={styles.primaryAccent}>10 Verified</span> Exchange Panels
          </h2>

          <p className={styles.subtitle}>
            Continuous live feed of premier exchange platforms • Real-time coin rates & minimums
          </p>

          <div className={styles.scrollBadge}>
            <FaMouse className={styles.mouseIcon} />
            <span>Swipe up/down or scroll mouse to browse</span>
          </div>
        </div>

        {/* Sharp Vertical Viewport */}
        <div className={styles.viewport} style={{ height: `${VIEWPORT_HEIGHT}px` }}>
          {/* Top & Bottom Crisp Gradient Fade Masks */}
          <div className={styles.fadeMaskTop} />
          <div className={styles.fadeMaskBottom} />

          {/* Smooth Vertical Reel Track */}
          <div
            className={styles.reelTrack}
            style={{
              transform: `translate3d(0, ${trackTranslateY}px, 0)`,
            }}
          >
            {websites.map((site, index) => {
              const isActive = index === activeIndex;

              return (
                <div
                  key={site.id || site._id || index}
                  className={`${styles.card} ${isActive ? styles.cardActive : styles.cardInactive}`}
                  style={{ height: `${CARD_HEIGHT}px` }}
                  onClick={() => handleCardClick(site)}
                  title={`Open ${site.name || site.website}`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleCardClick(site)}
                >
                  {/* Left: Rank & Logo */}
                  <div className={styles.cardLeft}>
                    <div className={styles.rankBadge}>
                      #{String(index + 1).padStart(2, '0')}
                    </div>

                    <div className={styles.logoBox}>
                      {site.logo ? (
                        <img
                          src={getImageUrl(site.logo, url)}
                          alt={site.website || 'Logo'}
                          className={styles.logoImg}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div
                        className={styles.logoFallback}
                        style={{ display: site.logo ? 'none' : 'flex' }}
                      >
                        {(site.website || 'EX').substring(0, 2).toUpperCase()}
                      </div>
                    </div>
                  </div>

                  {/* Center: Details & Official Link */}
                  <div className={styles.cardCenter}>
                    <div className={styles.titleRow}>
                      <h3 className={styles.websiteTitle}>
                        {site.name || site.website || 'Premium Exchange'}
                      </h3>
                      <FaCheckCircle className={styles.verifiedIcon} title="Verified Exchange" />
                      <span className={styles.categoryBadge}>
                        {site.category || 'EXCHANGE'}
                      </span>
                    </div>

                    {site.url && (
                      <div className={styles.linkLine}>
                        <span className={styles.linkText}>
                          {site.url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                        </span>
                        <FaExternalLinkAlt className={styles.linkIcon} />
                      </div>
                    )}
                  </div>

                  {/* Right: Coin Rate, Min Coins & Verified Status */}
                  <div className={styles.cardRight}>
                    <div className={styles.coinStat}>
                      <FaCoins className={styles.coinIcon} />
                      <div className={styles.statDetail}>
                        <span className={styles.statLabel}>Coin Rate</span>
                        <span className={styles.coinValue}>1 = ₹{site.coinRate ?? '1'}</span>
                      </div>
                    </div>

                    <div className={styles.minStat}>
                      <FaLock className={styles.lockIcon} />
                      <div className={styles.statDetail}>
                        <span className={styles.statLabel}>Min Coins</span>
                        <span className={styles.minValue}>
                          {Number(site.minimumCoins || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className={styles.statusPill}>
                      <FaShieldAlt className={styles.shieldIcon} />
                      <span>Verified</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Crisp Linear Progress Bar Indicator */}
        <div className={styles.progressBarWrapper}>
          <div
            className={styles.progressBarFill}
            style={{ width: `${((activeIndex + 1) / total) * 100}%` }}
          />
        </div>
      </div>
    </section>
  );
};

export default WebsitesVerticalSlider;
