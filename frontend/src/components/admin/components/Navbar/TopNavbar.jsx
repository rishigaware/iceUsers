

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./TopNavbar.module.css";
import DepositPopup from "./DepositPopup"; // Import the DepositPopup component
// import logo from '../../../../assets/logo.png'
import newlogo from '../../../../assets/logo.png'

export default function TopNavbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [walletBalance, setWalletBalance] = useState(100000);
  const [showDepositPopup, setShowDepositPopup] = useState(false); // State to toggle popup
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate("/login");
  };

  const handleSignupClick = () => {
    navigate("/signup");
  };

  const handleLogoutClick = () => {
    setIsLoggedIn(false);
    navigate("/");
  };

  const handleDepositClick = () => {
    // setShowDepositPopup(true); // Show deposit popup
    navigate("/admin/users");
  };

  const closeDepositPopup = () => {
    setShowDepositPopup(false); // Close deposit popup
  };

  return (
    <div className={styles.navbar}>
      {/* Logo Section */}
      <div className={styles.logo}>
        <img
          src="/logo.png"
          alt="Logo"
          className={styles.logoImage}
          />
      </div>

      {/* Buttons Section */}
      <div className={styles.navLinks}>
          <div className={styles.walletContainer}>
            <span className={styles.walletBalance}>Wallet : </span>
            <span className={styles.balanceAmount}>₹{walletBalance}</span>
        </div>

        <button className={styles.navButton} onClick={handleDepositClick}>
          Deposit
        </button>
      </div>

      {/* Deposit Popup */}
      {showDepositPopup && (
        <DepositPopup onClose={closeDepositPopup} setWalletBalance={setWalletBalance} />
      )}
    </div>
  );
}
