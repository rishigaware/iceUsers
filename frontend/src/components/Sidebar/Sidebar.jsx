import {
  FaTimes,
  FaHome,
  FaTachometerAlt,
  FaIdCard,
  FaExchangeAlt,
  FaUserCircle,
  FaUserShield,
  FaCog,
  FaBell,
  FaHeadset,
  FaFileContract,
  FaSignOutAlt,
  FaSignInAlt,
  FaWallet,
  FaChevronLeft,
  FaChevronRight,
  FaGlobe,
} from "react-icons/fa";
import React from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";

import { useUser } from "../../context/UserContext";
import { checkIsUser, ROLES } from "../../utils/roles";
import { ROUTES } from "../../utils/routes";
import { formatCurrency } from "../../utils/currency";
import styles from "./Sidebar.module.css";

export default function Sidebar({ isOpen, onClose }) {
  const { user, setUser, logoPath } = useUser();
  const [isCollapsed, setIsCollapsed] = React.useState(() => {
    return localStorage.getItem("sidebar_collapsed") === "true";
  });
  const navigate = useNavigate();
  const sidebarRef = React.useRef(null);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("sidebar_collapsed", String(next));
      return next;
    });
  };

  // Click outside listener for mobile
  React.useEffect(() => {
    function handleClickOutside(event) {
      if (
        isOpen &&
        window.innerWidth < 1024 &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target)
      ) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle body scroll locking on mobile & body padding on desktop/tablet
  React.useEffect(() => {
    const updateDesktopBodyClass = () => {
      if (window.innerWidth >= 1024) {
        document.body.classList.add("has-desktop-sidebar");
        if (isCollapsed) {
          document.body.classList.add("sidebar-collapsed");
          document.body.classList.remove("sidebar-expanded");
        } else {
          document.body.classList.add("sidebar-expanded");
          document.body.classList.remove("sidebar-collapsed");
        }
        document.body.style.overflow = "";
        document.body.style.touchAction = "";
      } else {
        document.body.classList.remove(
          "has-desktop-sidebar",
          "sidebar-collapsed",
          "sidebar-expanded",
        );
        if (isOpen) {
          document.body.style.overflow = "hidden";
          document.body.style.touchAction = "none";
        } else {
          document.body.style.overflow = "";
          document.body.style.touchAction = "";
        }
      }
    };

    updateDesktopBodyClass();
    window.addEventListener("resize", updateDesktopBodyClass);

    return () => {
      window.removeEventListener("resize", updateDesktopBodyClass);
      document.body.classList.remove(
        "has-desktop-sidebar",
        "sidebar-collapsed",
        "sidebar-expanded",
      );
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    };
  }, [isOpen, isCollapsed]);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
    onClose();
    navigate(ROUTES.LOGIN);
  };

  const roleLabel = user?.role ? user.role.toUpperCase() : "USER";
  const userRole = (user?.role || "").toLowerCase();
  const isRegularUser = checkIsUser(user);
  const isAdmin = userRole === ROLES.ADMIN;
  const isMaster = userRole === ROLES.MASTER;
  const isSuperAdmin = userRole === ROLES.SUPERADMIN;
  const balance = formatCurrency(user?.balance);

  const sidebarContent = (
    <>
      {/* Backdrop overlay for mobile drawer */}
      <div
        className={`${styles.backdrop} ${isOpen ? styles.backdropOpen : ""}`}
        onClick={onClose}
      />

      {/* Left Sidebar Drawer / Desktop Panel */}
      <aside
        ref={sidebarRef}
        className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ""} ${isCollapsed ? styles.collapsed : ""}`}
      >
        {/* Sidebar Header */}
        <div className={styles.sidebarHeader}>
          <div className={styles.logoSection}>
            {!isCollapsed && (
              <img src={logoPath} alt="Logo" className={styles.logoImage} />
            )}
          </div>

          <div className={styles.headerControls}>
            {/* Desktop Collapse/Expand Toggle Button */}
            <button
              className={styles.collapseToggleBtn}
              onClick={toggleCollapse}
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              aria-label="Toggle sidebar collapse state"
            >
              {isCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
            </button>

            {/* Mobile Close Button */}
            <button
              className={styles.closeBtn}
              onClick={onClose}
              aria-label="Close menu"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        {/* User Card snippet */}
        <div className={styles.userSection}>
          <div className={styles.userAvatar}>
            {(user?.name || user?.username || "U").charAt(0).toUpperCase()}
          </div>
          <div className={styles.userInfo}>
            <div className={styles.userName}>
              {user?.name || user?.username || "Guest User"}
            </div>
            <span className={styles.roleBadge}>{roleLabel}</span>
          </div>
        </div>

        {/* Quick Wallet Bar - only for regular users, hidden for admin & superadmin */}
        {isRegularUser && user && (
          <div className={styles.walletBar}>
            <div className={styles.walletLeft}>
              <FaWallet className={styles.walletIcon} />
              <div>
                <span className={styles.walletLabel}>Wallet Balance</span>
                <div className={styles.walletValue}>{balance}</div>
              </div>
            </div>
          </div>
        )}

        {/* Menu Navigation Items (Bottom Navbar Sequence First, Then Rest Menu Below) */}
        <nav className={styles.navMenu}>
          <div className={styles.menuGroupTitle}>{roleLabel} NAVIGATION</div>

          {/* USER MENU SEQUENCE */}
          {isRegularUser && (
            <>
              {/* Bottom Navbar Sequence */}
              <Link
                to={ROUTES.HOME}
                className={styles.navItem}
                onClick={onClose}
                title="Home"
              >
                <FaHome className={styles.itemIcon} />
                <span>Home</span>
              </Link>
              <Link
                to={ROUTES.ID}
                className={styles.navItem}
                onClick={onClose}
                title="ID"
              >
                <FaIdCard className={styles.itemIcon} />
                <span>ID / Betting Accounts</span>
              </Link>
              <Link
                to={ROUTES.TRANSACTIONS}
                className={styles.navItem}
                onClick={onClose}
                title="Transactions"
              >
                <FaExchangeAlt className={styles.itemIcon} />
                <span>Transactions</span>
              </Link>
              <Link
                to={ROUTES.PROFILE}
                className={styles.navItem}
                onClick={onClose}
                title="Profile"
              >
                <FaUserCircle className={styles.itemIcon} />
                <span>My Profile</span>
              </Link>

              {/* Rest Menu Below */}
              <div className={styles.menuGroupTitle}>MANAGEMENT & SERVICES</div>
              <Link
                to={ROUTES.DASHBOARD}
                className={styles.navItem}
                onClick={onClose}
                title="Dashboard"
              >
                <FaTachometerAlt className={styles.itemIcon} />
                <span>User Dashboard</span>
              </Link>
            </>
          )}

          {/* ADMIN MENU SEQUENCE */}
          {isAdmin && (
            <>
              {/* Bottom Navbar Sequence */}
              <Link
                to={ROUTES.ADMIN_HOME}
                className={styles.navItem}
                onClick={onClose}
                title="Home"
              >
                <FaHome className={styles.itemIcon} />
                <span>Home</span>
              </Link>
              <Link
                to={ROUTES.ADMIN_ALL_IDS}
                className={styles.navItem}
                onClick={onClose}
                title="All IDs"
              >
                <FaIdCard className={styles.itemIcon} />
                <span>All IDs</span>
              </Link>
              <Link
                to={ROUTES.ADMIN_WEBSITES}
                className={styles.navItem}
                onClick={onClose}
                title="Websites"
              >
                <FaGlobe className={styles.itemIcon} />
                <span>Websites</span>
              </Link>
              <Link
                to={ROUTES.ADMIN_ID_REQUESTS}
                className={styles.navItem}
                onClick={onClose}
                title="Requests"
              >
                <FaIdCard className={styles.itemIcon} />
                <span>Requests</span>
              </Link>
              <Link
                to={ROUTES.ADMIN_TRANSACTIONS}
                className={styles.navItem}
                onClick={onClose}
                title="Transactions"
              >
                <FaExchangeAlt className={styles.itemIcon} />
                <span>Transactions</span>
              </Link>
              <Link
                to={ROUTES.ADMIN_PROFILE}
                className={styles.navItem}
                onClick={onClose}
                title="Profile"
              >
                <FaUserCircle className={styles.itemIcon} />
                <span>Profile</span>
              </Link>

              {/* Rest Menu Below */}
              <div className={styles.menuGroupTitle}>MANAGEMENT & CONTROL</div>
              <Link
                to={ROUTES.ADMIN_DASHBOARD}
                className={styles.navItem}
                onClick={onClose}
                title="Dashboard"
              >
                <FaTachometerAlt className={styles.itemIcon} />
                <span>Admin Dashboard</span>
              </Link>
              <Link
                to={ROUTES.ADMIN_USERS}
                className={styles.navItem}
                onClick={onClose}
                title="Users"
              >
                <FaUserShield className={styles.itemIcon} />
                <span>Users Management</span>
              </Link>
            </>
          )}

          {/* MASTER MENU SEQUENCE */}
          {isMaster && (
            <>
              {/* Bottom Navbar Sequence */}
              <Link
                to={ROUTES.ADMIN_HOME}
                className={styles.navItem}
                onClick={onClose}
                title="Home"
              >
                <FaHome className={styles.itemIcon} />
                <span>Home</span>
              </Link>
              <Link
                to={ROUTES.ADMIN_ALL_IDS}
                className={styles.navItem}
                onClick={onClose}
                title="All IDs"
              >
                <FaIdCard className={styles.itemIcon} />
                <span>All IDs</span>
              </Link>
              <Link
                to={ROUTES.ADMIN_WEBSITES}
                className={styles.navItem}
                onClick={onClose}
                title="Websites"
              >
                <FaGlobe className={styles.itemIcon} />
                <span>Websites</span>
              </Link>
              <Link
                to={ROUTES.ADMIN_ID_REQUESTS}
                className={styles.navItem}
                onClick={onClose}
                title="Requests"
              >
                <FaIdCard className={styles.itemIcon} />
                <span>Requests</span>
              </Link>
              <Link
                to={ROUTES.ADMIN_TRANSACTIONS}
                className={styles.navItem}
                onClick={onClose}
                title="Transactions"
              >
                <FaExchangeAlt className={styles.itemIcon} />
                <span>Transactions</span>
              </Link>
              <Link
                to={ROUTES.ADMIN_PROFILE}
                className={styles.navItem}
                onClick={onClose}
                title="Profile"
              >
                <FaUserCircle className={styles.itemIcon} />
                <span>Profile</span>
              </Link>

              {/* Rest Menu Below */}
              <div className={styles.menuGroupTitle}>MANAGEMENT & CONTROL</div>
              <Link
                to={ROUTES.ADMIN_DASHBOARD}
                className={styles.navItem}
                onClick={onClose}
                title="Dashboard"
              >
                <FaTachometerAlt className={styles.itemIcon} />
                <span>Admin Master Dashboard</span>
              </Link>
              <Link
                to={ROUTES.ADMIN_SUBADMINS}
                className={styles.navItem}
                onClick={onClose}
                title="Sub-Admins"
              >
                <FaUserShield className={styles.itemIcon} />
                <span>Sub-Admin Masters</span>
              </Link>
              <Link
                to={ROUTES.ADMIN_ACCOUNTS_DETAILS}
                className={styles.navItem}
                onClick={onClose}
                title="Master Accounts"
              >
                <FaUserShield className={styles.itemIcon} />
                <span>Admin Masters Details</span>
              </Link>
              <Link
                to={ROUTES.ADMIN_USERS}
                className={styles.navItem}
                onClick={onClose}
                title="Users"
              >
                <FaUserShield className={styles.itemIcon} />
                <span>Network Users List</span>
              </Link>
            </>
          )}

          {/* SUPERADMIN MENU SEQUENCE */}
          {isSuperAdmin && (
            <>
              {/* Bottom Navbar Sequence */}
              <Link
                to={ROUTES.ADMIN_HOME}
                className={styles.navItem}
                onClick={onClose}
                title="Home"
              >
                <FaHome className={styles.itemIcon} />
                <span>Home</span>
              </Link>
              <Link
                to={ROUTES.ADMIN_SUBADMINS}
                className={styles.navItem}
                onClick={onClose}
                title="Admin Master"
              >
                <FaUserShield className={styles.itemIcon} />
                <span>Admin Master</span>
              </Link>
              <Link
                to={ROUTES.ADMIN_USERS}
                className={styles.navItem}
                onClick={onClose}
                title="User Accounts"
              >
                <FaUserShield className={styles.itemIcon} />
                <span>User Accounts</span>
              </Link>
              <Link
                to={ROUTES.ADMIN_ALL_IDS}
                className={styles.navItem}
                onClick={onClose}
                title="All IDs"
              >
                <FaIdCard className={styles.itemIcon} />
                <span>All IDs</span>
              </Link>
              <Link
                to={ROUTES.ADMIN_WEBSITES}
                className={styles.navItem}
                onClick={onClose}
                title="Websites"
              >
                <FaGlobe className={styles.itemIcon} />
                <span>Websites</span>
              </Link>
              <Link
                to={ROUTES.ADMIN_ID_REQUESTS}
                className={styles.navItem}
                onClick={onClose}
                title="Requests"
              >
                <FaIdCard className={styles.itemIcon} />
                <span>Requests</span>
              </Link>
              <Link
                to={ROUTES.ADMIN_TRANSACTIONS}
                className={styles.navItem}
                onClick={onClose}
                title="Transactions"
              >
                <FaExchangeAlt className={styles.itemIcon} />
                <span>Transactions</span>
              </Link>
              <Link
                to={ROUTES.ADMIN_PROFILE}
                className={styles.navItem}
                onClick={onClose}
                title="Profile"
              >
                <FaUserCircle className={styles.itemIcon} />
                <span>Profile</span>
              </Link>

              {/* Rest Menu Below */}
              <div className={styles.menuGroupTitle}>SUPER ADMIN CONTROL</div>
              <Link
                to={ROUTES.ADMIN_DASHBOARD}
                className={styles.navItem}
                onClick={onClose}
                title="Dashboard"
              >
                <FaTachometerAlt className={styles.itemIcon} />
                <span>Super Admin Dashboard</span>
              </Link>
              <Link
                to={ROUTES.ADMIN_ACCOUNTS_DETAILS}
                className={styles.navItem}
                onClick={onClose}
                title="Master Accounts"
              >
                <FaUserShield className={styles.itemIcon} />
                <span>Admin Masters Accounts</span>
              </Link>
            </>
          )}
        </nav>

        {/* Sidebar Footer */}
        <div className={styles.sidebarFooter}>
          {user ? (
            <button className={styles.logoutBtn} onClick={handleLogout} title="Sign Out">
              <FaSignOutAlt /> <span>Sign Out</span>
            </button>
          ) : (
            <Link to={ROUTES.LOGIN} className={styles.loginLinkBtn} onClick={onClose} title="Login / Sign Up">
              <FaSignInAlt /> <span>Login / Sign Up</span>
            </Link>
          )}
          <div className={styles.versionTag}>ICE Users Mobile Panel v2.4.0</div>
        </div>
      </aside>
    </>
  );

  return typeof document !== "undefined"
    ? createPortal(sidebarContent, document.body)
    : sidebarContent;
}
