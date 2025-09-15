import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/app/providers/contexts/AuthContext';
import { useCheckPermission } from '@/hooks/useRealtimePermissions';

const ProtectedRoute = ({ children, featureKey, actionKey }) => {
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const {
    data: permission,
    isLoading: permissionsLoading,
    isError: permissionsError,
    refetch: refetchPermission,
  } = useCheckPermission(featureKey, actionKey);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (authLoading || (featureKey && permissionsLoading)) {
        setTimedOut(true);
      }
    }, 10000); // 10 seconds

    return () => clearTimeout(timer);
  }, [authLoading, featureKey, permissionsLoading]);

  // If authentication or permissions are still loading, show a loader
  if (authLoading || (featureKey && permissionsLoading)) {
    if (timedOut) {
      return (
        <div className="loading-overlay">
          <div>
            <p>Ocorreu um erro ao carregar as permissões.</p>
            <button onClick={() => refetchPermission()}>Tentar novamente</button>
          </div>
        </div>
      );
    }

    return (
      <div className="loading-overlay">
        <div className="loading-spinner"></div>
      </div>
    );
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
    return (
      <div className="loading-overlay">
        <div>
          <p>Ocorreu um erro ao carregar as permissões.</p>
          <button onClick={() => refetchPermission()}>Tentar novamente</button>
        </div>
      </div>
    );
  }

  // If authentication or permissions are still loading, show a loader
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
