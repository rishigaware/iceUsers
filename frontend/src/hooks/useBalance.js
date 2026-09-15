import { useState, useEffect, useCallback } from 'react';
import { useUser } from '../context/UserContext';

/**
 * Custom hook for managing user balance
 * Provides centralized balance fetching and refresh functionality
 */
export const useBalance = () => {
  const { user, url, refreshUserBalance } = useUser();
  const [balance, setBalance] = useState(user?.balance || 0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Update local balance when user balance changes
  useEffect(() => {
    setBalance(user?.balance || 0);
  }, [user?.balance]);

  // Function to refresh balance with loading state
  const refreshBalance = useCallback(async () => {
    if (!user?.id) return null;

    setIsLoading(true);
    setError(null);

    try {
      const newBalance = await refreshUserBalance();
      return newBalance;
    } catch (err) {
      setError(err.message);
      console.error('Error refreshing balance:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, refreshUserBalance]);

  // Function to get current balance
  const getCurrentBalance = useCallback(() => {
    return user?.balance || 0;
  }, [user?.balance]);

  // Function to format balance for display
  const formatBalance = useCallback((amount = null) => {
    const balanceAmount = amount !== null ? amount : balance;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(balanceAmount);
  }, [balance]);

  return {
    balance,
    isLoading,
    error,
    refreshBalance,
    getCurrentBalance,
    formatBalance,
  };
};

export default useBalance;
