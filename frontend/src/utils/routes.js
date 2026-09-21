/**
 * Centralized Application Route Paths
 * Single source of truth for all client-side routing and navigation targets.
 */
export const ROUTES = {
  // Public & User Routes
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  DASHBOARD: "/dashboard",
  PROFILE: "/profile",
  TRANSACTIONS: "/transactions",
  ID: "/id",

  // Admin Routes
  ADMIN_HOME: "/admin/home",
  ADMIN_DASHBOARD: "/admin/dashboard",
  ADMIN_SUBADMINS: "/admin/subadmins",
  ADMIN_ACCOUNTS_DETAILS: "/admin/accounts-details",
  ADMIN_PROFILE: "/admin/profile",
  ADMIN_TRANSACTIONS: "/admin/transactions",
  ADMIN_ID: "/admin/id",
  ADMIN_ALL_IDS: "/admin/all-ids",
  ADMIN_WEBSITES: "/admin/websites",
  ADMIN_USERS: "/admin/users",
  ADMIN_ID_REQUESTS: "/admin/id-requests",
};

/**
 * Returns the primary home route based on admin privilege
 * @param {boolean} isAdmin
 * @returns {string}
 */
export const getHomeRoute = (isAdmin) =>
  isAdmin ? ROUTES.ADMIN_HOME : ROUTES.HOME;

export default ROUTES;
