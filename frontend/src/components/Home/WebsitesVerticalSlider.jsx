import React, { useState, useEffect, useCallback } from "react";

import { useUser } from "../../context/UserContext";
import FramerMarqueeSection from "./sliderVariants/FramerMarqueeSection";
import FramerSpringSection from "./sliderVariants/FramerSpringSection";
import styles from "./WebsitesVerticalSlider.module.css";

// 10 Fallback websites strictly matching backend schema if backend API is offline
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
  const [activeTab, setActiveTab] = useState("framer-spring"); // Default to Style 1 (User Favorite)

  // Fetch Websites dynamically from backend API (live data, keep exactly 10)
  const fetchWebsites = useCallback(async () => {
    try {
      const userId = user?.id || user?._id || "";
      const response = await fetch(
        `${url}/api/admin/get-websites${userId ? `?userId=${userId}` : ""}`,
      );
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setWebsites(data.slice(0, 10));
        }
      }
    } catch (err) {
      console.warn("WebsitesVerticalSlider: using fallback data", err);
    }
  }, [url, user?.id, user?._id]);

  useEffect(() => {
    fetchWebsites();
  }, [fetchWebsites]);

  return (
    <section
      className={styles.section}
      aria-label="Top 10 Live Exchange Websites Showcase"
    >
      <div className={styles.wrapper}>
        {/* Section Header */}
        <div className={styles.header}>
          <div className={styles.tagLine}>
            <span className={styles.livePill}>
              <span className={styles.liveDot} />
              LIVE EXCHANGE
            </span>
          </div>
        </div>

        {/* Selected Animation Section */}
        <div className={styles.sectionsContainer}>
          {/* Style 1: Framer Motion Spring Slider (User Favorite) */}
          {activeTab === "framer-spring" && (
            <FramerSpringSection websites={websites} baseUrl={url} />
          )}

          {/* Style 3: Framer Motion Continuous Marquee */}
          {activeTab === "framer-marquee" && (
            <FramerMarqueeSection websites={websites} baseUrl={url} />
          )}
        </div>
      </div>
    </section>
  );
};

export default WebsitesVerticalSlider;
