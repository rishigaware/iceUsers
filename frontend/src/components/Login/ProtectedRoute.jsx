import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useUser();

  // Allow guests to access all user routes
  if (!user && allowedRoles?.includes('user')) {
    return children;
  }

  // Redirect guests trying to access admin routes
  if (!user && (allowedRoles?.includes('admin') || allowedRoles?.includes('master') || allowedRoles?.includes('superadmin'))) {
    return <Navigate to="/login" replace />;
  }

  // Restrict access if the user's role is not in allowedRoles (superadmin & master can access admin routes)
  const isAuthorized = allowedRoles && (
    allowedRoles.includes(user?.role) ||
    ((user?.role === 'superadmin' || user?.role === 'master') && (allowedRoles.includes('admin') || allowedRoles.includes('subadmin')))
  );

  if (allowedRoles && !isAuthorized) {
    return <Navigate to="/" replace />;
  }

  return children; // Render the children if all checks pass
};

export default ProtectedRoute;
