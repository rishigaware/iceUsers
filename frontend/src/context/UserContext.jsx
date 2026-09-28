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
  //     : "https://iceusers.onrender.com";
  const defaultUrl = "https://iceusers.onrender.com";

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

  const refreshUserData = useCallback(async () => {
    if (!user) return;
    try {
      const identifier = user.id || user._id || user.username;
      if (checkIsAdmin(user)) {
        const response = await fetch(`${url}/api/admin/me`, {
          headers: { 'x-admin-id': identifier }
        });
        if (response.ok) {
          const freshData = await response.json();
          setUser((prev) => ({
            ...prev,
            ...freshData,
            permissions: freshData.permissions || prev?.permissions || {},
          }));
        }
      } else {
        if (user.id || user._id) {
          await refreshUserBalance();
        }
      }
    } catch (e) {
      console.warn("Could not sync user/admin data:", e);
    }
  }, [user?.id, user?._id, user?.username, user?.role, url, refreshUserBalance]);

  useEffect(() => {
    if (user?.id || user?._id || user?.username) {
      refreshUserData();
    }
  }, [url]);

  useEffect(() => {
    const handleFocus = () => {
      if (user?.id || user?._id || user?.username) {
        refreshUserData();
      }
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refreshUserData, user?.id, user?._id, user?.username]);

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
      refreshUserData,
    }),
    [
      user?.id,
      user?.name,
      user?.email,
      user?.phoneNumber,
      user?.balance,
      user?.role,
      user?.permissions,
      isAdmin,
      isSuperAdmin,
      isSuperOrMaster,
      isRegularUser,
      url,
      fetchUserBalance,
      refreshUserBalance,
      refreshUserData,
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
