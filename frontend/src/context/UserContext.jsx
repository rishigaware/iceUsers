import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";

// Create the context
const UserContext = createContext();

import { checkIsAdmin, checkIsSuperAdmin, checkIsSuperOrMaster, checkIsUser } from "../utils/roles";

// Global Logo Asset Constant
export const LOGO_PATH = "/logo.png";

// UserProvider component to wrap the app and provide user data
export const UserProvider = ({ children }) => {
  //   const defaultUrl = (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
  //     ? "http://localhost:3000"
  //     : "https://betting-accounts-manager.onrender.com";
  const defaultUrl = "https://betting-accounts-manager.onrender.com";

  const [url, setUrl] = useState(defaultUrl);
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    try {
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Error parsing user from localStorage:", error);
      return null;
    }
  });

  const fetchUserBalance = useCallback(
    async (userId) => {
      if (!userId) return null;
      try {
        const response = await fetch(`${url}/api/user/get-balance/${userId}`);
        if (response.ok) {
          const data = await response.json();
          return data.balance;
        }
        return null;
      } catch (error) {
        console.error("Error fetching user balance:", error);
        return null;
      }
    },
    [url],
  );

  const refreshUserBalance = useCallback(async () => {
    if (user?.id) {
      const balance = await fetchUserBalance(user.id);
      if (balance !== null) {
        setUser((prev) => ({ ...prev, balance }));
      }
    }
  }, [user?.id, fetchUserBalance]);

  // Sync user state with localStorage
  useEffect(() => {
    if (user) {
      // Store user object in localStorage whenever it changes
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      // If user is null, remove from localStorage
      localStorage.removeItem("user");
    }
  }, [user]);

  const isAdmin = useMemo(() => checkIsAdmin(user), [user?.role]);
  const isSuperAdmin = useMemo(() => checkIsSuperAdmin(user), [user?.role]);
  const isSuperOrMaster = useMemo(() => checkIsSuperOrMaster(user), [user?.role]);
  const isRegularUser = useMemo(() => checkIsUser(user), [user?.role]);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      user,
      setUser,
      isAdmin,
      isSuperAdmin,
      isSuperOrMaster,
      isRegularUser,
      url,
      setUrl,
      logoPath: LOGO_PATH,
      fetchUserBalance,
      refreshUserBalance,
    }),
    [
      user?.id,
      user?.name,
      user?.email,
      user?.phoneNumber,
      user?.balance,
      user?.role,
      isAdmin,
      isSuperAdmin,
      isSuperOrMaster,
      isRegularUser,
      url,
      fetchUserBalance,
      refreshUserBalance,
    ],
  );

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};

// Custom hook to access user data in any component
export const useUser = () => {
  return useContext(UserContext);
};

export default UserContext;
