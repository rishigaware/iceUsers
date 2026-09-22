import {
  FaCoins,
  FaLock,
  FaExternalLinkAlt,
  FaCheckCircle,
  FaGlobe,
} from "react-icons/fa";
import React from "react";

import { getImageUrl } from "../../../utils/imageUrl";
import styles from "./ExchangeCard.module.css";

const ExchangeCard = ({ site, index, isActive = true, baseUrl = "" }) => {
  const handleCardClick = (e) => {
    if (site.url) {
      window.open(site.url, "_blank", "noopener,noreferrer");
    }
  };

  const displayName = site.name || site.website || "Premium Exchange";
  const displayUrl = site.url
    ? site.url.replace(/^https?:\/\//, "").replace(/\/$/, "")
    : "";

  return (
    <div
      className={`${styles.card} ${isActive ? styles.cardActive : styles.cardInactive}`}
      onClick={handleCardClick}
      title={`Open ${displayName}`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) =>
        (e.key === "Enter" || e.key === " ") && handleCardClick(e)
      }
    >
      {/* Row 1: Identity Header - Rank, Logo, Full Title (Never Wrapped) & Category Badge */}
      <div className={styles.headerRow}>
        <div className={styles.identityGroup}>
          <span className={styles.rankBadge}>
            {String(index + 1).padStart(2, "0")}
          </span>

          <div className={styles.logoFrame}>
            {site.logo ? (
              <img
                src={getImageUrl(site.logo, baseUrl)}
                alt={displayName}
                className={styles.logoImg}
                onError={(e) => {
                  e.target.style.display = "none";
                  if (e.target.nextSibling) {
                    e.target.nextSibling.style.display = "flex";
                  }
                }}
              />
            ) : null}
            <div
              className={styles.logoFallback}
              style={{ display: site.logo ? "none" : "flex" }}
            >
              {displayName.substring(0, 2).toUpperCase()}
            </div>
          </div>

          {/* Name & Subtitle Info Block */}
          <div className={styles.nameBlock}>
            <div className={styles.titleLine}>
              <h3 className={styles.websiteTitle}>{displayName}</h3>
              <FaCheckCircle
                className={styles.verifiedIcon}
                title="Verified Exchange"
              />
            </div>

            {site.category && (
              <span className={styles.categoryBadge}>{site.category}</span>
            )}
          </div>
        </div>
      </div>

      {/* Row 2: Official Website Link */}
      {displayUrl && (
        <div className={styles.linkRow}>
          <a
            href={site.url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.websiteLink}
            onClick={(e) => e.stopPropagation()}
            title={`Visit ${site.url}`}
          >
            <FaGlobe className={styles.globeIcon} />
            <span className={styles.linkText}>{displayUrl}</span>
            <FaExternalLinkAlt className={styles.extIcon} />
          </a>
        </div>
      )}

      {/* Row 3: Description */}
      {site.description && (
        <div className={styles.descriptionRow}>
          <p className={styles.descriptionText}>{site.description}</p>
        </div>
      )}

      {/* Row 4: Live Coin Rates & Minimum Coins */}
      <div className={styles.statsRow}>
        <div className={styles.coinChip}>
          <FaCoins className={styles.coinIcon} />
          <div className={styles.chipText}>
            <span className={styles.chipLabel}>COIN RATE</span>
            <span className={styles.coinValue}>
              1 = ₹1
            </span>
          </div>
        </div>

        <div className={styles.minChip}>
          <FaLock className={styles.lockIcon} />
          <div className={styles.chipText}>
            <span className={styles.chipLabel}>MIN COINS</span>
            <span className={styles.minValue}>
              {Number(site.minimumCoins || 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExchangeCard;
