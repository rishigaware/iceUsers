import React, { useEffect, useRef } from 'react';
import { useUser } from '../../context/UserContext';

/**
 * BalanceProvider component that automatically refreshes user balance
 * at regular intervals to ensure real-time balance updates
 */
const BalanceProvider = ({ children, refreshInterval = 30000 }) => { // Default 30 seconds
  const { user, refreshUserBalance } = useUser();
  const intervalRef = useRef(null);

  useEffect(() => {
    // Only start auto-refresh if user is logged in
    if (user?.id) {
      // Initial balance fetch
      refreshUserBalance();

      // Set up interval for automatic balance refresh
      intervalRef.current = setInterval(() => {
        refreshUserBalance();
      }, refreshInterval);

      // Cleanup interval on unmount or user change
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    } else {
      // Clear interval if user is not logged in
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  }, [user?.id, refreshUserBalance, refreshInterval]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return <>{children}</>;
};

export default BalanceProvider;
