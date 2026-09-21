import React, { useState, useEffect, useCallback, useMemo } from "react";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import DashboardIcon from "@mui/icons-material/Dashboard";
import MapsHomeWorkIcon from "@mui/icons-material/MapsHomeWork";
import RecentActorsIcon from "@mui/icons-material/RecentActors";
import PaymentsTwoToneIcon from "@mui/icons-material/PaymentsTwoTone";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LanguageIcon from "@mui/icons-material/Language";
import RequestPageIcon from "@mui/icons-material/RequestPage";
import { Link, useLocation } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import styles from "./Navbar.module.css";
import { checkIsAdmin } from "../../utils/roles";

// Memoized route mappings
const USER_ROUTE_MAP = {
  "/dashboard": "dashboard",
  "/": "recents",
  "/id": "favorites",
  "/transactions": "nearby",
  "/profile": "folder",
};

const ADMIN_ROUTE_MAP = {
  "/admin/dashboard": "dashboard",
  "/dashboard": "dashboard",
  "/admin/home": "recents",
  "/admin/subadmins": "subadmins",
  "/admin/users": "users",
  "/admin/all-ids": "all-ids",
  "/admin/id": "all-ids",
  "/admin/websites": "websites",
  "/admin/id-requests": "requests",
  "/admin/transactions": "nearby",
  "/admin/profile": "folder",
};

// User bottom navigation items
const USER_NAV_ITEMS = [
  {
    label: "Home",
    value: "recents",
    icon: <MapsHomeWorkIcon />,
    to: "/",
  },
  {
    label: "ID",
    value: "favorites",
    icon: <RecentActorsIcon />,
    to: "/id",
  },
  {
    label: "Transactions",
    value: "nearby",
    icon: <PaymentsTwoToneIcon />,
    to: "/transactions",
  },
  {
    label: "Profile",
    value: "folder",
    icon: <AccountCircleIcon />,
    to: "/profile",
  },
];

// Admin & Superadmin bottom navigation items
const ADMIN_NAV_ITEMS = [
  {
    label: "Home",
    value: "recents",
    icon: <MapsHomeWorkIcon />,
    to: "/admin/home",
  },
  {
    label: "All IDs",
    value: "all-ids",
    icon: <RecentActorsIcon />,
    to: "/admin/all-ids",
  },
  {
    label: "Websites",
    value: "websites",
    icon: <LanguageIcon />,
    to: "/admin/websites",
  },
  {
    label: "Requests",
    value: "requests",
    icon: <RequestPageIcon />,
    to: "/admin/id-requests",
  },
  {
    label: "Transactions",
    value: "nearby",
    icon: <PaymentsTwoToneIcon />,
    to: "/admin/transactions",
  },
  {
    label: "Profile",
    value: "folder",
    icon: <AccountCircleIcon />,
    to: "/admin/profile",
  },
];

export default function Navbar() {
  const location = useLocation();
  const { user } = useUser();
  const isAdmin = checkIsAdmin(user);

  // Memoized function to get route value based on role
  const getRouteValue = useCallback(
    (pathname) => {
      if (isAdmin) {
        return ADMIN_ROUTE_MAP[pathname] || "recents";
      }
      return USER_ROUTE_MAP[pathname] || "recents";
    },
    [isAdmin]
  );

  // Initialize state with current route
  const [value, setValue] = useState(() => getRouteValue(location.pathname));

  // Memoized change handler
  const handleChange = useCallback((event, newValue) => {
    setValue(newValue);
  }, []);

  // Update value when pathname or role changes
  useEffect(() => {
    const newValue = getRouteValue(location.pathname);
    setValue((prevValue) => (prevValue !== newValue ? newValue : prevValue));
  }, [location.pathname, getRouteValue]);

  // Memoized navigation actions based on role
  const navigationActions = useMemo(() => {
    const items = isAdmin ? ADMIN_NAV_ITEMS : USER_NAV_ITEMS;
    return items.map((item) => (
      <BottomNavigationAction
        key={item.value}
        label={item.label}
        value={item.value}
        icon={item.icon}
        component={Link}
        to={item.to}
        sx={{
          minWidth: 0,
          flex: "1 1 0",
          padding: isAdmin
            ? { xs: "2px 0", sm: "4px 1px", md: "6px 2px" }
            : { xs: "3px 1px", sm: "5px 2px", md: "8px 4px" },
        }}
      />
    ));
  }, [isAdmin]);

  return (
    <BottomNavigation
      className={`${styles.navbar} ${styles.navbarBlack}`}
      value={value}
      onChange={handleChange}
      showLabels
      sx={{
        width: "100%",
        minHeight: { xs: "52px", sm: "58px", md: "64px" },
        height: "auto",
        padding: {
          xs: "3px 0 calc(4px + env(safe-area-inset-bottom, 0px)) 0",
          sm: "5px 0 calc(5px + env(safe-area-inset-bottom, 0px)) 0",
        },
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        boxSizing: "border-box",
        overflow: "hidden",
        "& .MuiBottomNavigationAction-root": {
          minWidth: 0,
          maxWidth: "none",
          flex: "1 1 0",
          padding: isAdmin
            ? { xs: "2px 0px", sm: "3px 1px", md: "5px 2px" }
            : { xs: "3px 1px", sm: "5px 2px", md: "8px 4px" },
          color: "rgba(255, 255, 255, 0.65)",
          transition: "all 0.2s ease",
          "&.Mui-selected": {
            color: "var(--primary-color)",
            fontWeight: 700,
            transform: { xs: "scale(1.03)", sm: "scale(1.06)" },
            transition: "all 0.2s ease",
          },
        },
        "& .MuiBottomNavigationAction-label": {
          fontSize: isAdmin
            ? { xs: "0.50rem", sm: "0.62rem", md: "0.72rem" }
            : { xs: "0.62rem", sm: "0.72rem", md: "0.85rem" },
          fontWeight: 600,
          color: "rgba(255, 255, 255, 0.75)",
          marginTop: "2px",
          display: "block !important",
          opacity: "1 !important",
          visibility: "visible !important",
          textShadow: "0 1px 2px rgba(0, 0, 0, 0.3)",
          lineHeight: 1.15,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          letterSpacing: "-0.3px",
          transition: "all 0.2s ease",
        },
        "& .Mui-selected .MuiBottomNavigationAction-label": {
          color: "var(--primary-color) !important",
          fontWeight: 700,
          opacity: "1 !important",
          visibility: "visible !important",
          textShadow: "0 2px 4px rgba(0, 0, 0, 0.4)",
          fontSize: isAdmin
            ? { xs: "0.54rem", sm: "0.66rem", md: "0.76rem" }
            : { xs: "0.66rem", sm: "0.76rem", md: "0.9rem" },
        },
        "& .MuiBottomNavigationAction-icon, & .MuiSvgIcon-root": {
          color: "var(--primary-color) !important",
          fontSize: isAdmin
            ? { xs: "1.20rem", sm: "1.40rem", md: "1.60rem" }
            : { xs: "1.35rem", sm: "1.55rem", md: "1.75rem" },
          transition: "all 0.2s ease",
          marginBottom: "1px",
        },
        "& .Mui-selected .MuiBottomNavigationAction-icon, & .Mui-selected .MuiSvgIcon-root": {
          color: "var(--primary-color) !important",
          fontSize: isAdmin
            ? { xs: "1.30rem", sm: "1.50rem", md: "1.70rem" }
            : { xs: "1.45rem", sm: "1.65rem", md: "1.85rem" },
          filter: "drop-shadow(0 2px 8px rgba(var(--primary-color-rgb), 0.6))",
        },
      }}
    >
      {navigationActions}
    </BottomNavigation>
  );
}
