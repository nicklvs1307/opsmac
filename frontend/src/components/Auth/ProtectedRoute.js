import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/app/providers/contexts/AuthContext';
import { useCheckPermission } from '@/hooks/useRealtimePermissions';

const ProtectedRoute = ({ children, featureKey, actionKey }) => {
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const { data: permission, isLoading: permissionsLoading, isError: permissionsError } = useCheckPermission(featureKey, actionKey);

  // If authentication or permissions are still loading, show a loader
  if (authLoading || (featureKey && permissionsLoading)) {
    return <div className="loading-spinner"></div>; // Or a proper spinner component
  }

  // If user is not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Superadmin bypass: If authenticated and is a superadmin, grant access immediately.
  if (user?.permissionSnapshot?.isSuperadmin) {
    return children;
  }

  // If featureKey and actionKey are not provided, it's a base authenticated route.
  if (!featureKey || !actionKey) {
    return children;
  }

  // Handle permissions error
  if (permissionsError) {
    console.error("Permissions system error:", permissionsError);
    return <Navigate to="/unauthorized" replace />; // Or a specific error page
  }

  // Check if the user has the required permission
  if (permission?.allowed) {
    return children;
  }

  // Handle locked feature (e.g., payment required)
  if (permission?.locked) {
    // The axios interceptor might handle this with a toast, but a redirect is a fallback.
    return <Navigate to="/feature-locked" replace />; // A dedicated page for locked features
  }

  // If permission is explicitly denied, redirect to an unauthorized page
  return <Navigate to="/unauthorized" replace />;
};

export default ProtectedRoute;