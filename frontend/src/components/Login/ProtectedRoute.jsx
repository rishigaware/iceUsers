import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';

import { ROLES, checkIsAdmin, hasAdminRole } from '../../utils/roles';
import { ROUTES } from '../../utils/routes';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useUser();

  const userRole = user?.role?.toLowerCase();
  const normalizedAllowedRoles = allowedRoles?.map((r) => r.toLowerCase());

  // Allow guests to access all user routes
  if (!user && normalizedAllowedRoles?.includes(ROLES.USER)) {
    return children;
  }

  // Redirect guests trying to access admin routes
  if (!user && hasAdminRole(normalizedAllowedRoles)) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // Restrict access if the user's role is not in allowedRoles (superadmin & master can access admin routes)
  const isAuthorized =
    normalizedAllowedRoles &&
    (normalizedAllowedRoles.includes(userRole) ||
      (checkIsAdmin(userRole) &&
        (normalizedAllowedRoles.includes(ROLES.ADMIN) ||
          normalizedAllowedRoles.includes('subadmin'))));

  if (normalizedAllowedRoles && !isAuthorized) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return children; // Render the children if all checks pass
};

export default ProtectedRoute;
