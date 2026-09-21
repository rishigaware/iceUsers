import React, { useState } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import ExchangeCard from './ExchangeCard';
import styles from './VariantSections.module.css';

const ReactSlickSection = ({ websites = [], baseUrl = '' }) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const total = websites.length || 10;

  const settings = {
    dots: false,
    arrows: false,
    infinite: true,
    speed: 550,
    slidesToShow: 3,
    slidesToScroll: 1,
    vertical: true,
    verticalSwiping: true,
    swipeToSlide: true,
    touchMove: true,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    beforeChange: (_, next) => setActiveSlide(next),
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          vertical: true,
          verticalSwiping: true,
          swipeToSlide: true,
          touchMove: true,
        },
      },
      {
        breakpoint: 400,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          vertical: true,
          verticalSwiping: true,
          swipeToSlide: true,
          touchMove: true,
        },
      },
    ],
  };

  return (
    <div className={styles.variantContainer}>
      <div className={styles.variantBadgeRow}>
        <span className={styles.libBadge}>2. React Slick</span>
        <span className={styles.countBadge}>
          #{String(activeSlide + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </span>
      </div>

      <div className={styles.slickWrapper}>
        <Slider {...settings}>
          {websites.map((site, index) => {
            // In 3-slide view, highlight the middle or current active item
            const isCenterOrActive =
              index === activeSlide ||
              index === (activeSlide + 1) % total;

            return (
              <div key={site.id || site._id || index} className={styles.slickSlideInner}>
                <ExchangeCard
                  site={site}
                  index={index}
                  isActive={isCenterOrActive}
                  baseUrl={baseUrl}
                />
              </div>
            );
          })}
        </Slider>
      </div>
    </div>
  );
};

export default ReactSlickSection;
