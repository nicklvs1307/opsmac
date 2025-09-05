import React from 'react';
import { Navigate } from 'react-router-dom';
import usePermissions from '@/hooks/usePermissions';
import { useAuth } from '@/app/providers/contexts/AuthContext';

const ProtectedRoute = ({ children, featureKey, actionKey }) => {
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  // Get permissionSnapshot directly from usePermissions hook
  const { can, loading: permissionsLoading, error: permissionsError, permissionSnapshot } = usePermissions();

  // If authentication or permissions are still loading, show nothing or a loader
  if (authLoading || permissionsLoading) {
    return <div>Loading...</div>; // Or a proper spinner component
  }

  console.log('ProtectedRoute Debug: isAuthenticated', isAuthenticated);
  console.log('ProtectedRoute Debug: user', user);
  // Now we check the permissionSnapshot from the hook, not directly from user
  console.log('ProtectedRoute Debug: permissionSnapshot from hook', permissionSnapshot);
  console.log('ProtectedRoute Debug: isSuperAdmin from hook', permissionSnapshot?.isSuperAdmin);
  console.log('ProtectedRoute Debug: featureKey', featureKey);
  console.log('ProtectedRoute Debug: actionKey', actionKey);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Allow access for super admin if authenticated and no specific permission is required
  // This handles the root path where featureKey/actionKey might be undefined
  // Use permissionSnapshot from the hook, which is guaranteed to be loaded if permissionsLoading is false
  if (permissionSnapshot && permissionSnapshot.isSuperAdmin && !featureKey && !actionKey) {
    console.log('ProtectedRoute Debug: Super Admin bypass triggered.');
    return children;
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
  return <Navigate to="/unauthorized" replace />;
};

export default ProtectedRoute;