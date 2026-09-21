import {
  FaBalanceScale,
  FaCrown,
  FaGlobe,
  FaBolt,
  FaBullhorn,
  FaTools,
  FaHeadset,
  FaStar,
  FaChartLine,
  FaUsers,
  FaCoins,
  FaWhatsapp,
  FaTelegramPlane,
  FaCreditCard,
  FaSimCard,
  FaAd,
  FaLaptop,
  FaBriefcase,
  FaBell,
  FaPlus,
  FaArrowRight,
  FaEdit,
  FaSave,
  FaTimes,
  FaBars,
} from "react-icons/fa";
import { useEffect, useState } from "react";
import { BiMoneyWithdraw } from "react-icons/bi";
import { PiHandDepositDuotone } from "react-icons/pi";
import { useNavigate } from "react-router-dom";

import rg1 from "../../assets/images/responsibleGaming/PHOTO-2026-02-15-10-30-06.jpg";
import rg2 from "../../assets/images/responsibleGaming/PHOTO-2026-02-15-10-30-37.jpg";
import rg3 from "../../assets/images/responsibleGaming/PHOTO-2026-02-15-10-32-08.jpg";
import rg4 from "../../assets/images/responsibleGaming/PHOTO-2026-02-15-10-32-54.jpg";
import certRng from "../../assets/certification_rng_verified.png";
import certSsl from "../../assets/certification_ssl_secure.png";
import resp18 from "../../assets/responsible_gaming_18_plus.png";
import respPlaySafe from "../../assets/responsible_gaming_play_safe.png";
import newlogo from "../../assets/logo.png";
import { useUser } from "../../context/UserContext";
import { checkIsAdmin } from "../../utils/roles";
import { ROUTES } from "../../utils/routes";
import LoginPopup from "../Login/LoginPopup";
import DepositPopup from "../Navbar/DepositPopup";
import styles from "./HomeHeading.module.css";
import WalletWithdrawalPopup from "./WalletWithdrawalPopup";
import { formatCurrency } from "../../utils/currency";
import HomeBannerCarousel from "./HomeBannerCarousel";
import SquareBannerCarousel from "./SquareBannerCarousel";
import WebsitesVerticalSlider from "./WebsitesVerticalSlider";
import Sidebar from "../Sidebar/Sidebar";

const HomeHeading = () => {
  const navigate = useNavigate();
  const { user, setUser, refreshUserBalance, logoPath } = useUser();
  const isAdmin = checkIsAdmin(user);

  const [showDepositPopup, setShowDepositPopup] = useState(false);
  const [showWithdrawalPopup, setShowWithdrawalPopup] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Sliding Text State with Admin Inline Editing
  const [slidingText, setSlidingText] = useState(
    "#INDIA'S FIRST SELF ADMIN &  MASTER PANEL'S CREATE WEBSITE ( NO FRAUD / NO🎢RISK / NO MIDDLEMAN ) 🏁START IT'S MIN AVAILABLE 🏪24/7🧑‍💻TEAM IceUsers.info🪩",
  );
  const [isEditingText, setIsEditingText] = useState(false);
  const [tempText, setTempText] = useState("");

  const handleEditText = () => {
    setTempText(slidingText);
    setIsEditingText(true);
  };

  const handleSaveText = () => {
    if (tempText.trim()) {
      setSlidingText(tempText.trim());
    }
    setIsEditingText(false);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleLogin = () => {
    navigate(ROUTES.LOGIN);
  };

  const handleClick = () => {
    if (isAdmin) {
      navigate(ROUTES.ADMIN_ALL_IDS);
    } else {
      navigate(ROUTES.ID);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  const handleDepositClick = () => {
    if (isAdmin) {
      navigate(ROUTES.ADMIN_USERS);
      return;
    }
    if (!user) {
      navigate(ROUTES.LOGIN);
      return;
    }
    setShowDepositPopup(true);
  };

  const closeDepositPopup = () => {
    setShowDepositPopup(false);
  };

  const handleWithdrawalClick = () => {
    if (isAdmin) {
      navigate(ROUTES.ADMIN_USERS);
      return;
    }
    if (!user) {
      navigate(ROUTES.LOGIN);
      return;
    }
    setShowWithdrawalPopup(true);
  };

  const closeWithdrawalPopup = () => {
    setShowWithdrawalPopup(false);
  };

  // Fetch balance on component mount and whenever the user changes
  useEffect(() => {
    if (user?.id) {
      refreshUserBalance();
    }
  }, [user?.id, refreshUserBalance]);

  return (
    <div className={styles.mainContainer}>
      <div className={styles.navbar}>
        <div className={styles.logoGroup}>
          {user && (
            <button
              className={styles.hamburgerBtn}
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Open sidebar navigation"
            >
              <FaBars />
            </button>
          )}
          <img
            src={logoPath}
            alt="Logo"
            className={styles.navbarLogo}
          />
        </div>
        <div className={styles.navbarActions}>
          {user ? (
            <button className={styles.buttonlogout} onClick={handleLogout}>
              Logout
            </button>
          ) : (
            <button className={styles.buttonlogin} onClick={handleLogin}>
              Login
            </button>
          )}
        </div>
      </div>

      {/* Sidebar Component */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className={styles.top}>
        <div className={styles.topSquare}>
          <div
            className={styles.first}
            onClick={handleDepositClick}
            style={{ cursor: "pointer" }}
          >
            <PiHandDepositDuotone />
            <h3 className={styles.deposit}>Deposit</h3>
          </div>

          <div className={styles.second}>
            <div className={styles.logo}>
              <img
                src={logoPath}
                alt="Logo"
                className={styles.centerLogo}
              />
            </div>

            {!isAdmin && (
              <>
                <div className={styles.balanceContainer}>
                  <FaBalanceScale size={20} />
                  <p className={styles.balanceAmount}>{formatCurrency(user?.balance)}</p>
                </div>
                <h3 className={styles.balance}>Wallet Balance</h3>
              </>
            )}
          </div>

          <div
            className={styles.third}
            onClick={handleWithdrawalClick}
            style={{ cursor: "pointer" }}
          >
            <h3 className={styles.withdraw}>Withdraw</h3>
            <BiMoneyWithdraw />
          </div>
        </div>
      </div>
      {/* Sliding Text Section */}
      <div
        className={styles.slidingTextSection}
        style={{ display: "flex", alignItems: "center" }}
      >
        <FaBell
          style={{
            fontSize: "24px",
            color: "var(--secondary-color, #111)", // Theme secondary color
            marginRight: "10px",
            backgroundColor: "var(--primary-color)", // Theme primary background
            borderRadius: "50%",
            padding: "6px",
            display: "inline-block",
            animation: "bellZoom 1.1s ease-in-out infinite",
            boxShadow: "0 0 12px rgba(var(--primary-color-rgb), 0.9)",
          }}
        />

        <style>
          {`
@keyframes bellZoom {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 rgba(255,59,48,0.7);
  }
  50% {
    transform: scale(1.35);
    box-shadow: 0 0 20px rgba(255,59,48,1);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 rgba(255,59,48,0.7);
  }
}
`}
        </style>
        <div
          className={styles.slidingTextContainer}
          style={{ flex: 1, overflow: "hidden" }}
        >
          {isEditingText ? (
            <div className={styles.tickerEditWrapper}>
              <input
                type="text"
                value={tempText}
                onChange={(e) => setTempText(e.target.value)}
                className={styles.tickerEditInput}
                autoFocus
              />
              <button
                onClick={handleSaveText}
                className={styles.tickerActionBtn}
                title="Save announcement"
              >
                <FaSave size={18} />
              </button>
              <button
                onClick={() => setIsEditingText(false)}
                className={styles.tickerActionBtn}
                title="Cancel"
              >
                <FaTimes size={18} />
              </button>
            </div>
          ) : (
            <>
              <div className={styles.slidingText}>
                <span>
                  {slidingText}{" "}
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                </span>
                <span>
                  {slidingText}{" "}
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                </span>
              </div>
              {isAdmin && (
                <button
                  onClick={handleEditText}
                  className={styles.tickerEditBtn}
                  title="Edit sliding announcement"
                >
                  <span style={{ fontSize: "10px", marginRight: "4px" }}>Edit</span>
                  <FaEdit />
                </button>
              )}
            </>
          )}
        </div>
      </div>
      {/* Create Admin Panel Section */}
      <div
        className={styles.createId}
        onClick={handleClick}
        style={{ cursor: "pointer" }}
      >
        <div className={styles.leftSide}>
          <span className={styles.createIdEmoji}>🚀</span>
          <FaPlus size={18} className={styles.createIdIcon} />
          <span className={styles.createIdText}>
            CREATE SELF ADMIN PANEL&apos;S
          </span>
          <span className={styles.createIdEmoji}>⚡</span>
        </div>
        <div className={styles.rightSide}>
          <span className={styles.createIdEmoji}>🎯</span>
          <FaArrowRight
            size={18}
            className={`${styles.createIdArrow} ${styles.arrow}`}
          />
        </div>
      </div>

      {/* Home Banner Carousel - before Our Premium Services */}
      <HomeBannerCarousel canManage={isAdmin} />

      {/* Top 10 Live Exchange Websites Vertical Upper-Scroll Showcase */}
      <WebsitesVerticalSlider isAdmin={isAdmin} />


      {/* Animated Features Section */}
      <div className={styles.featuresSection}>
        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <FaCrown className={styles.featureIcon} />
            <h4>Premium Exchange Solutions</h4>
            <p>All Premium Exchange, Admin & White Label services available.</p>
          </div>
          <div className={styles.featureCard}>
            <FaGlobe className={styles.featureIcon} />
            <h4>International Virtual SIM & Bank</h4>
            <p>Global virtual SIM cards and international banking support.</p>
          </div>
          <div className={styles.featureCard}>
            <FaBolt className={styles.featureIcon} />
            <h4>Instant Panel Refill</h4>
            <p>Quick and seamless instant panel refill anytime.</p>
          </div>
          <div className={styles.featureCard}>
            <FaBullhorn className={styles.featureIcon} />
            <h4>Digital Marketing Posters</h4>
            <p>Professional match posters and marketing creatives.</p>
          </div>
          <div className={styles.featureCard}>
            <FaTools className={styles.featureIcon} />
            <h4>Advanced Technical Services</h4>
            <p>Complete technical solutions for smooth platform operation.</p>
          </div>
          <div className={styles.featureCard}>
            <FaHeadset className={styles.featureIcon} />
            <h4>24/7 Technical Support</h4>
            <p>
              Round-the-clock support from our expert technical team and account
              managers.
            </p>
          </div>
        </div>
      </div>

       {/* Square Banner Carousel - before How It Works */}
      <SquareBannerCarousel canManage={isAdmin} />


      {/* Animated Stats Section */}
      <div className={styles.statsSection}>
        <div className={styles.statsContainer}>
          <div className={styles.statItem}>
            <FaUsers className={styles.statIcon} />
            <div className={styles.statNumber}>2K+</div>
            <div className={styles.statLabel}>Active Users</div>
          </div>
          <div className={styles.statItem}>
            <FaChartLine className={styles.statIcon} />
            <div className={styles.statNumber}>99.9%</div>
            <div className={styles.statLabel}>Uptime</div>
          </div>
          <div className={styles.statItem}>
            <FaStar className={styles.statIcon} />
            <div className={styles.statNumber}>4.9/5</div>
            <div className={styles.statLabel}>User Rating</div>
          </div>
        </div>
      </div>

      
      {/* Services Section */}
      <div className={styles.gamingPlatformsSection}>
        <h2 className={styles.sectionTitle}>🚀 Our Premium Services</h2>
        <div className={styles.platformsGrid}>
          <div className={styles.platformCard}>
            <div className={styles.platformIcon} style={{ color: "var(--whatsapp-color)" }}>
              <FaWhatsapp size={40} />
            </div>
            <h3>APIs</h3>
            <p>
              WhatsApp API <br /> Telegram Bot
            </p>
            <div className={styles.platformBadge}>Best</div>
          </div>
          <div className={styles.platformCard}>
            <div className={styles.platformIcon} style={{ color: "var(--primary-color)" }}>
              <FaCreditCard size={40} />
            </div>
            <h3>Payments</h3>
            <p>
              Payment Gateway <br /> Rental Account
            </p>
            <div className={styles.platformBadge}>Secure</div>
          </div>
          <div className={styles.platformCard}>
            <div className={styles.platformIcon} style={{ color: "var(--telegram-color)" }}>
              <FaSimCard size={40} />
            </div>
            <h3>SIM Services</h3>
            <p>
              Indian Virtual SIM <br /> International Virtual SIM
            </p>
            <div className={styles.platformBadge}>New</div>
          </div>
          <div className={styles.platformCard}>
            <div className={styles.platformIcon} style={{ color: "var(--instagram-color)" }}>
              <FaLaptop size={40} />
            </div>
            <h3>Digital Marketing</h3>
            <p>
              Google & Meta Ads <br /> Telegram & Instagram Ads
            </p>
            <div className={styles.platformBadge}>Trending</div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className={styles.testimonialsSection}>
        <h2 className={styles.sectionTitle}>💬 What Our Users Say</h2>
        <div className={styles.testimonialsContainer}>
          <div className={styles.testimonialCard}>
            <div className={styles.testimonialContent}>
              <div className={styles.quoteIcon}>&ldquo;</div>
              <p>
                &ldquo;Amazing platform! Fast withdrawals and great customer
                support. I&apos;ve been using it for 2 years now.&rdquo;
              </p>
              <div className={styles.testimonialAuthor}>
                <div className={styles.authorAvatar}>R</div>
                <div className={styles.authorInfo}>
                  <h4>Rajesh Kumar</h4>
                  <span>Verified User</span>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.testimonialCard}>
            <div className={styles.testimonialContent}>
              <div className={styles.quoteIcon}>&ldquo;</div>
              <p>
                &ldquo;24/7 support is amazing. They helped me resolve my issue
                within minutes. Great service!&rdquo;
              </p>
              <div className={styles.testimonialAuthor}>
                <div className={styles.authorAvatar}>A</div>
                <div className={styles.authorInfo}>
                  <h4>Amit Patel</h4>
                  <span>Premium User</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

     
      {/* How It Works Section */}
      <div className={styles.howItWorksSection}>
        <h2 className={styles.sectionTitle}>🚀 How It Works</h2>
        <div className={styles.stepsContainer}>
          <div className={styles.stepItem}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <h3>Open Google</h3>
              <p>
                Search "the best panel provider" using link <b>IceUsers.info</b>
              </p>
            </div>
            <div className={styles.stepIcon}>🔍</div>
          </div>
          <div className={styles.stepArrow}>→</div>

          <div className={styles.stepItem}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <h3>Register</h3>
              <p>Register yourself with your mobile number and Gmail</p>
            </div>
            <div className={styles.stepIcon}>📱</div>
          </div>
          <div className={styles.stepArrow}>→</div>

          <div className={styles.stepItem}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <h3>Create Panel</h3>
              <p>Click on Panels {">"} Create self any Panel</p>
            </div>
            <div className={styles.stepIcon}>💻</div>
          </div>
          <div className={styles.stepArrow}>→</div>

          <div className={styles.stepItem}>
            <div className={styles.stepNumber}>4</div>
            <div className={styles.stepContent}>
              <h3>Select Panel</h3>
              <p>Select the panel that you want & Click on Create</p>
            </div>
            <div className={styles.stepIcon}>👆</div>
          </div>
          <div className={styles.stepArrow}>→</div>

          <div className={styles.stepItem}>
            <div className={styles.stepNumber}>5</div>
            <div className={styles.stepContent}>
              <h3>Fill Details</h3>
              <p>Fill required details then select coins and rate</p>
            </div>
            <div className={styles.stepIcon}>📝</div>
          </div>
          <div className={styles.stepArrow}>→</div>

          <div className={styles.stepItem}>
            <div className={styles.stepNumber}>6</div>
            <div className={styles.stepContent}>
              <h3>Buy Now</h3>
              <p>Click on Buy now (You will get the Payment option)</p>
            </div>
            <div className={styles.stepIcon}>🛒</div>
          </div>
          <div className={styles.stepArrow}>→</div>

          <div className={styles.stepItem}>
            <div className={styles.stepNumber}>7</div>
            <div className={styles.stepContent}>
              <h3>Payment & Submit</h3>
              <p>
                Make payment, Upload Screenshot and Click on Submit. You will
                get your Panel detail on iceusers.info home page
              </p>
            </div>
            <div className={styles.stepIcon}>✅</div>
          </div>
        </div>
      </div>

      {/* Copyright Section */}
      <div className={styles.copyrightSection}>
        <p>© 2024 iceusers.info. All rights reserved.</p>
      </div>

      {/* Certifications Section */}
      <div className={styles.logosSection}>
        <div className={styles.sectionHeader}>
          <h3>Certifications</h3>
        </div>
        <div className={styles.logosContainer}>
          <div className={styles.logosSlide}>
            <img
              src={certRng}
              alt="RNG Verified"
              className={styles.logoImage}
            />
            <img src={certSsl} alt="SSL Secure" className={styles.logoImage} />
            <img
              src={certRng}
              alt="RNG Verified"
              className={styles.logoImage}
            />
            <img src={certSsl} alt="SSL Secure" className={styles.logoImage} />
            <img
              src={certRng}
              alt="RNG Verified"
              className={styles.logoImage}
            />
            <img src={certSsl} alt="SSL Secure" className={styles.logoImage} />
            <img
              src={certRng}
              alt="RNG Verified"
              className={styles.logoImage}
            />
            <img src={certSsl} alt="SSL Secure" className={styles.logoImage} />
            <img
              src={certRng}
              alt="RNG Verified"
              className={styles.logoImage}
            />
            <img src={certSsl} alt="SSL Secure" className={styles.logoImage} />
            <img
              src={certRng}
              alt="RNG Verified"
              className={styles.logoImage}
            />
            <img src={certSsl} alt="SSL Secure" className={styles.logoImage} />
            <img
              src={certRng}
              alt="RNG Verified"
              className={styles.logoImage}
            />
            <img src={certSsl} alt="SSL Secure" className={styles.logoImage} />
            <img
              src={certRng}
              alt="RNG Verified"
              className={styles.logoImage}
            />
            <img src={certSsl} alt="SSL Secure" className={styles.logoImage} />
          </div>
        </div>
      </div>

      {/* Responsible Gaming Section */}
      <div className={styles.logosSection}>
        <div
          className={`${styles.sectionHeader} ${styles.responsibleGamingHeader}`}
        >
          <h3>Responsible Gaming</h3>
        </div>
        <div
          className={`${styles.logosContainer} ${styles.responsibleGamingContainer}`}
        >
          <div className={styles.logosSlide}>
            <img
              src={rg1}
              alt="Responsible Gaming"
              className={styles.logoImage}
            />
            <img
              src={rg2}
              alt="Responsible Gaming"
              className={styles.logoImage}
            />
            <img
              src={rg3}
              alt="Responsible Gaming"
              className={styles.logoImage}
            />
            <img
              src={rg4}
              alt="Responsible Gaming"
              className={styles.logoImage}
            />
            <img
              src={rg1}
              alt="Responsible Gaming"
              className={styles.logoImage}
            />
            <img
              src={rg2}
              alt="Responsible Gaming"
              className={styles.logoImage}
            />
            <img
              src={rg3}
              alt="Responsible Gaming"
              className={styles.logoImage}
            />
            <img
              src={rg4}
              alt="Responsible Gaming"
              className={styles.logoImage}
            />
            <img
              src={rg1}
              alt="Responsible Gaming"
              className={styles.logoImage}
            />
            <img
              src={rg2}
              alt="Responsible Gaming"
              className={styles.logoImage}
            />
            <img
              src={rg3}
              alt="Responsible Gaming"
              className={styles.logoImage}
            />
            <img
              src={rg4}
              alt="Responsible Gaming"
              className={styles.logoImage}
            />
            <img
              src={rg1}
              alt="Responsible Gaming"
              className={styles.logoImage}
            />
            <img
              src={rg2}
              alt="Responsible Gaming"
              className={styles.logoImage}
            />
            <img
              src={rg3}
              alt="Responsible Gaming"
              className={styles.logoImage}
            />
            <img
              src={rg4}
              alt="Responsible Gaming"
              className={styles.logoImage}
            />
          </div>
        </div>
      </div>

      {/* Login Popup */}
      {isModalOpen && <LoginPopup isOpen={isModalOpen} isClose={closeModal} />}

      {/* Deposit Popup */}
      {showDepositPopup && <DepositPopup onClose={closeDepositPopup} />}

      {/* Withdrawal Popup */}
      {showWithdrawalPopup && (
        <WalletWithdrawalPopup onClose={closeWithdrawalPopup} />
      )}
    </div>
  );
};

export default HomeHeading;
