

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./TopNavbar.module.css";
import DepositPopup from "./DepositPopup"; // Import the DepositPopup component
import { FaBars } from "react-icons/fa";
import Sidebar from "../../../Sidebar/Sidebar";
import { useUser } from "../../../../context/UserContext";

export default function TopNavbar() {
  const { logoPath } = useUser();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [walletBalance, setWalletBalance] = useState(100000);
  const [showDepositPopup, setShowDepositPopup] = useState(false); // State to toggle popup
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Sidebar drawer state
  const navigate = useNavigate();

  const handleDepositClick = () => {
    navigate("/admin/users");
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
        <div className={styles.logo} onClick={() => navigate("/dashboard")} style={{ cursor: "pointer" }}>
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
          <span className={styles.balanceAmount}>₹{walletBalance}</span>
        </div>

        <button className={styles.navButton} onClick={handleDepositClick}>
          Users
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
