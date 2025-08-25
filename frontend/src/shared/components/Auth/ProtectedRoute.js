import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import AuthContext from '../../../app/providers/contexts/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    // You can replace this with a proper loading spinner
    return <div>Loading...</div>;
  }

  if (!user) {
    // User is not logged in, redirect to login page
    // Pass the current location so we can redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // User is logged in but does not have the required role
    // Redirect to a "not authorized" page or the dashboard
    return <Navigate to="/" replace />;
  }

  // User is authenticated and has the required role, render the component
  return children;
};

export default ProtectedRoute;
