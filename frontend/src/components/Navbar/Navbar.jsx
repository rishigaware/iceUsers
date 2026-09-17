import React, { useState, useEffect, useCallback, useMemo } from "react";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import DashboardIcon from '@mui/icons-material/Dashboard';
import MapsHomeWorkIcon from '@mui/icons-material/MapsHomeWork';
import RecentActorsIcon from '@mui/icons-material/RecentActors';
import PaymentsTwoToneIcon from '@mui/icons-material/PaymentsTwoTone';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { Link, useLocation } from 'react-router-dom';
import styles from "./Navbar.module.css";

// Memoized route mapping to prevent recreation on every render
const ROUTE_MAP = {
  "/dashboard": "dashboard",
  "/": "recents",
  "/id": "favorites", 
  "/transactions": "nearby",
  "/profile": "folder"
};

// Memoized navigation items to prevent recreation
const NAV_ITEMS = [
  {
    label: "Home",
    value: "recents",
    icon: <MapsHomeWorkIcon />,
    to: "/"
  },
  {
    label: "ID", 
    value: "favorites",
    icon: <RecentActorsIcon />,
    to: "/id"
  },
  {
    label: "Transactions",
    value: "nearby", 
    icon: <PaymentsTwoToneIcon />,
    to: "/transactions"
  },
  {
    label: "Profile",
    value: "folder",
    icon: <AccountCircleIcon />,
    to: "/profile"
  }
];

export default function Navbar() {
  const location = useLocation();
  
  // Memoized function to get route value
  const getRouteValue = useCallback((pathname) => {
    return ROUTE_MAP[pathname] || "recents";
  }, []);

  // Initialize state with current route
  const [value, setValue] = useState(() => getRouteValue(location.pathname));

  // Memoized change handler
  const handleChange = useCallback((event, newValue) => {
    setValue(newValue);
  }, []);

  // Update value only when pathname changes (not the entire location object)
  useEffect(() => {
    const newValue = getRouteValue(location.pathname);
    setValue(prevValue => prevValue !== newValue ? newValue : prevValue);
  }, [location.pathname, getRouteValue]);

  // Memoized navigation actions to prevent unnecessary re-renders
  const navigationActions = useMemo(() => 
    NAV_ITEMS.map((item) => (
      <BottomNavigationAction
        key={item.value}
        label={item.label}
        value={item.value}
        icon={item.icon}
        component={Link}
        to={item.to}
        sx={{
          minWidth: 0,
          flex: '1 1 0',
          padding: { xs: '3px 1px', sm: '5px 2px', md: '8px 4px' }
        }}
      />
    )), []
  );

  return (
    <BottomNavigation
      className={`${styles.navbar} ${styles.navbarBlack}`}
      value={value}
      onChange={handleChange}
      showLabels
      sx={{
        width: '100%',
        minHeight: { xs: '52px', sm: '58px', md: '64px' },
        height: 'auto',
        padding: { xs: '4px 0 calc(4px + env(safe-area-inset-bottom, 0px)) 0', sm: '6px 0 calc(6px + env(safe-area-inset-bottom, 0px)) 0' },
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        boxSizing: 'border-box',
        overflow: 'hidden',
        '& .MuiBottomNavigationAction-root': {
          minWidth: 0,
          maxWidth: 'none',
          flex: '1 1 0',
          padding: { xs: '3px 1px', sm: '5px 2px', md: '8px 4px' },
          color: 'var(--primary-color)',
          transition: 'all 0.2s ease',
          '&.Mui-selected': {
            color: 'var(--primary-color)',
            fontWeight: 700,
            transform: { xs: 'scale(1.04)', sm: 'scale(1.08)' },
            transition: 'all 0.2s ease'
          }
        },
        '& .MuiBottomNavigationAction-label': {
          fontSize: { xs: '0.62rem', sm: '0.72rem', md: '0.85rem' },
          fontWeight: 600,
          color: 'rgba(255, 255, 255, 0.8)',
          marginTop: '3px',
          display: 'block !important',
          opacity: 1,
          visibility: 'visible',
          lineHeight: 1.15,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          transition: 'all 0.2s ease'
        },
        '& .Mui-selected .MuiBottomNavigationAction-label': {
          color: 'var(--primary-color)',
          fontWeight: 700,
          opacity: 1,
          visibility: 'visible',
          fontSize: { xs: '0.66rem', sm: '0.76rem', md: '0.9rem' },
        },
        '& .MuiBottomNavigationAction-icon, & .MuiSvgIcon-root': {
          color: 'var(--primary-color) !important',
          fontSize: { xs: '1.35rem', sm: '1.55rem', md: '1.75rem' },
          transition: 'all 0.2s ease',
          marginBottom: '1px'
        },
        '& .Mui-selected .MuiBottomNavigationAction-icon, & .Mui-selected .MuiSvgIcon-root': {
          color: 'var(--primary-color) !important',
          fontSize: { xs: '1.45rem', sm: '1.65rem', md: '1.85rem' },
          filter: 'drop-shadow(0 2px 8px rgba(var(--primary-color-rgb), 0.6))'
        }
      }}
    >
      {navigationActions}
    </BottomNavigation>
  );
}
