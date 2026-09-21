/**
 * Global Role Definitions & Utilities
 * Centralized source of truth matching backend schemas:
 * - models/User.js ('user')
 * - models/Admin.js ('admin', 'superadmin')
 * - controller/adminController.js ('master')
 */

export const ROLES = Object.freeze({
  USER: 'user',
  ADMIN: 'admin',
  SUPERADMIN: 'superadmin',
  MASTER: 'master',
});

// Admin tier roles (admin masters, sub-admins, super-admins)
export const ADMIN_ROLES = Object.freeze([
  ROLES.ADMIN,
  ROLES.SUPERADMIN,
  ROLES.MASTER,
]);

// Superadmin and Master roles (top-level administrative tier)
export const SUPER_ROLES = Object.freeze([
  ROLES.SUPERADMIN,
  ROLES.MASTER,
]);

// All valid authenticated roles
export const ALL_AUTHENTICATED_ROLES = Object.freeze([
  ROLES.USER,
  ROLES.ADMIN,
  ROLES.SUPERADMIN,
  ROLES.MASTER,
]);

/**
 * Checks if a user object or role string belongs to an admin tier (admin, superadmin, master)
 * @param {object|string|null|undefined} userOrRole - User object or role string
 * @returns {boolean}
 */
export const checkIsAdmin = (userOrRole) => {
  if (!userOrRole) return false;
  const role = typeof userOrRole === 'string'
    ? userOrRole.toLowerCase()
    : userOrRole?.role?.toLowerCase();
  return ADMIN_ROLES.includes(role);
};

/**
 * Checks if a user object or role string is specifically superadmin
 * @param {object|string|null|undefined} userOrRole
 * @returns {boolean}
 */
export const checkIsSuperAdmin = (userOrRole) => {
  if (!userOrRole) return false;
  const role = typeof userOrRole === 'string'
    ? userOrRole.toLowerCase()
    : userOrRole?.role?.toLowerCase();
  return role === ROLES.SUPERADMIN;
};

/**
 * Checks if a user object or role string is superadmin or master
 * @param {object|string|null|undefined} userOrRole
 * @returns {boolean}
 */
export const checkIsSuperOrMaster = (userOrRole) => {
  if (!userOrRole) return false;
  const role = typeof userOrRole === 'string'
    ? userOrRole.toLowerCase()
    : userOrRole?.role?.toLowerCase();
  return SUPER_ROLES.includes(role);
};

/**
 * Checks if a user object or role string is specifically a regular user
 * @param {object|string|null|undefined} userOrRole
 * @returns {boolean}
 */
export const checkIsUser = (userOrRole) => {
  if (!userOrRole) return true; // Guest is treated as user
  const role = typeof userOrRole === 'string'
    ? userOrRole.toLowerCase()
    : userOrRole?.role?.toLowerCase();
  return !role || role === ROLES.USER;
};

/**
 * Checks if a collection of allowed roles contains any admin role
 * Useful for checking route guard permissions e.g. in ProtectedRoute
 * @param {Array<string>|null|undefined} allowedRoles
 * @returns {boolean}
 */
export const hasAdminRole = (allowedRoles) => {
  if (!Array.isArray(allowedRoles)) return false;
  return allowedRoles.some((r) => ADMIN_ROLES.includes(r?.toLowerCase()));
};
