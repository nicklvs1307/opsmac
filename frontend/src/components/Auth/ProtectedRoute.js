import React from 'react';
import { Navigate } from 'react-router-dom';
import usePermissions from '@/hooks/usePermissions';
import { useAuth } from '@/app/providers/contexts/AuthContext';

const ProtectedRoute = ({ children, featureKey, actionKey }) => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { can, loading: permissionsLoading, error: permissionsError } = usePermissions();

  // If authentication is still loading, show nothing or a loader
  if (authLoading || permissionsLoading) {
    return <div>Loading...</div>; // Or a proper spinner component
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If there's an error fetching permissions, or no snapshot, deny access
  if (permissionsError || !can) {
    // This might indicate a serious issue or misconfiguration
    console.error("Permissions system error or no 'can' function available.", permissionsError);
    return <Navigate to="/unauthorized" replace />; // Redirect to a generic error page
  }

  // Check if the user has the required permission
  if (can(featureKey, actionKey)) {
    return children;
  }

  // If permission is denied, redirect to an unauthorized page
  // Note: The backend's 402 (Payment Required) is handled by axios interceptor
  // and should ideally trigger a toast/modal, not a redirect here.
  // This redirect is for a hard 403 (Forbidden).
  return <Navigate to="/unauthorized" replace />;
};

export default ProtectedRoute;
