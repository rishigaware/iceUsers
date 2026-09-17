

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./TopNavbar.module.css";
import DepositPopup from "./DepositPopup"; // Import the DepositPopup component
import { useUser } from "../../context/UserContext";
import { FaBars } from "react-icons/fa";
import Sidebar from "../Sidebar/Sidebar";

export default function TopNavbar() {
  const { user, setUser, url, refreshUserBalance, logoPath } = useUser();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [walletBalance, setWalletBalance] = useState(100000);
  const [showDepositPopup, setShowDepositPopup] = useState(false); // State to toggle popup
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Sidebar drawer state
  const navigate = useNavigate();

  // Fetch balance on component mount and whenever the user changes
  useEffect(() => {
    if (user?.id) {
      refreshUserBalance();
    }
  }, [user?.id, refreshUserBalance]); // Refetch balance whenever the user changes

  const handleDepositClick = () => {
    setShowDepositPopup(true); // Show deposit popup
  };

  const closeDepositPopup = () => {
    setShowDepositPopup(false); // Close deposit popup
  };

  return (
    <div className={styles.navbar}>
      {/* Sidebar Icon & Logo Section */}
      <div className={styles.logoGroup}>
        <button
          className={styles.hamburgerBtn}
          onClick={() => setIsSidebarOpen(true)}
          aria-label="Open left navigation menu"
        >
          <FaBars />
        </button>
        <div className={styles.logo} onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
          <img
            src={logoPath}
            alt="Logo"
            className={styles.logoImage}
          />
        </div>
      </div>

      {/* Buttons Section */}
      <div className={styles.navLinks}>
        <div className={styles.walletContainer}>
          <span className={styles.walletBalance}>Wallet : </span>
          <span className={styles.balanceAmount}>₹{(parseFloat(user?.balance) || 0).toFixed(2)}</span>
        </div>

        <button className={styles.navButton} onClick={handleDepositClick}>
          Deposit
        </button>
      </div>

      {/* Sidebar Drawer Component */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Deposit Popup */}
      {showDepositPopup && (
        <DepositPopup onClose={closeDepositPopup} setWalletBalance={setWalletBalance} />
      )}
    </div>
  );
}
