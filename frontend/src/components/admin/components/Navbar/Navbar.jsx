import React, { useState, useEffect, useCallback, useMemo } from "react";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import MapsHomeWorkIcon from '@mui/icons-material/MapsHomeWork';
import RecentActorsIcon from '@mui/icons-material/RecentActors';
import GroupsIcon from '@mui/icons-material/Groups';
import RequestPageIcon from '@mui/icons-material/RequestPage';
import PaymentsTwoToneIcon from '@mui/icons-material/PaymentsTwoTone';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import { Link, useLocation } from 'react-router-dom';
import { useUser } from '../../../../context/UserContext';
import styles from "./Navbar.module.css";

// Memoized route mapping to prevent recreation on every render
const ADMIN_ROUTE_MAP = {
  "/admin/home": "recents",
  "/admin/subadmins": "subadmins",
  "/admin/users": "users",
  "/admin/id": "favorites", 
  "/admin/id-requests": "requests",
  "/admin/transactions": "nearby",
  "/admin/profile": "folder"
};

export default function Navbar() {
  const location = useLocation();
  const { user } = useUser();
  
  // Memoized function to get route value
  const getRouteValue = useCallback((pathname) => {
    return ADMIN_ROUTE_MAP[pathname] || "recents";
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

  // Memoized navigation actions based on user role
  const navigationActions = useMemo(() => {
    const items = [
      {
        label: "Home",
        value: "recents",
        icon: <MapsHomeWorkIcon />,
        to: "/admin/home"
      }
    ];

    if (user?.role === 'superadmin') {
      items.push({
        label: "Admin Master",
        value: "subadmins",
        icon: <SupervisorAccountIcon />,
        to: "/admin/subadmins"
      });
    }

    items.push(
      {
        label: "Users",
        value: "users",
        icon: <GroupsIcon />,
        to: "/admin/users"
      },
      {
        label: "Agents",
        value: "favorites", 
        icon: <RecentActorsIcon />,
        to: "/admin/id"
      },
      {
        label: "Requests",
        value: "requests",
        icon: <RequestPageIcon />,
        to: "/admin/id-requests"
      },
      {
        label: "Transactions",
        value: "nearby",
        icon: <PaymentsTwoToneIcon />,
        to: "/admin/transactions"
      },
      {
        label: "Profile",
        value: "folder",
        icon: <AccountCircleIcon />,
        to: "/admin/profile"
      }
    );

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
          flex: '1 1 0',
          padding: { xs: '2px 0', sm: '4px 1px', md: '6px 2px' },
        }}
      />
    ));
  }, [user?.role]);

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
        padding: { xs: '3px 0 calc(4px + env(safe-area-inset-bottom, 0px)) 0', sm: '5px 0 calc(5px + env(safe-area-inset-bottom, 0px)) 0' },
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        boxSizing: 'border-box',
        overflow: 'hidden',
        '& .MuiBottomNavigationAction-root': {
          minWidth: 0,
          maxWidth: 'none',
          flex: '1 1 0',
          padding: { xs: '2px 0px', sm: '3px 1px', md: '5px 2px' },
          color: 'rgba(255, 255, 255, 0.65)',
          transition: 'all 0.2s ease',
          '&.Mui-selected': {
            color: 'var(--primary-color)',
            fontWeight: 700,
            transform: { xs: 'scale(1.03)', sm: 'scale(1.06)' },
            transition: 'all 0.2s ease'
          }
        },
        '& .MuiBottomNavigationAction-label': {
          fontSize: { xs: '0.54rem', sm: '0.64rem', md: '0.74rem' },
          fontWeight: 600,
          color: 'rgba(255, 255, 255, 0.65)',
          marginTop: '2px',
          display: 'block !important',
          opacity: '1 !important',
          visibility: 'visible !important',
          textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
          lineHeight: 1.15,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          letterSpacing: '-0.3px',
          transition: 'all 0.2s ease'
        },
        '& .Mui-selected .MuiBottomNavigationAction-label': {
          color: 'var(--primary-color) !important',
          fontWeight: 700,
          opacity: '1 !important',
          visibility: 'visible !important',
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.4)',
          fontSize: { xs: '0.58rem', sm: '0.68rem', md: '0.78rem' },
        },
        '& .MuiSvgIcon-root': {
          fontSize: { xs: '1.25rem', sm: '1.45rem', md: '1.65rem' },
          transition: 'all 0.2s ease',
          marginBottom: '1px'
        },
        '& .Mui-selected .MuiSvgIcon-root': {
          fontSize: { xs: '1.35rem', sm: '1.55rem', md: '1.75rem' },
        }
      }}
    >
      {navigationActions}
    </BottomNavigation>
  );
}
