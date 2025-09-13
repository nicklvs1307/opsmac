import { useCallback } from 'react';
import { useAuth } from '@/app/providers/contexts/AuthContext'; // Correct path

const usePermissions = () => {
  const { user, loading, error } = useAuth(); // Get user, loading, error from AuthContext

  // The permissionSnapshot is now directly from the AuthContext user object
  const permissionSnapshot = user?.permissionSnapshot;

  const can = useCallback((featureKey, actionKey) => {
    // console.log('can check:', { featureKey, actionKey, loading, error, hasSnapshot: !!permissionSnapshot, isOwner: permissionSnapshot?.isOwner, isSuperAdmin: permissionSnapshot?.isSuperAdmin });

    // If featureKey or actionKey are not provided, deny permission.
    // This prevents errors when components call `can` with undefined values.
    if (!featureKey || !actionKey) {
      return false;
    }

    // If auth is still loading, or there's an error, or no snapshot yet, deny.
    if (loading || error || !permissionSnapshot) {
      return false;
    }

    // Superadmin bypass
    if (permissionSnapshot.isSuperadmin) {
      return true;
    }

    

    // Regular role-based and user override checks
    const feature = permissionSnapshot.modules
      .flatMap(mod => mod.submodules)
      .flatMap(sub => sub.features)
      .find(f => f.key === featureKey);

    if (!feature) {
      return false; // Feature not found in snapshot
    }

    const action = feature.actions.find(a => a.key === actionKey);

    if (!action) {
      return false; // Action not found for this feature
    }

    return action.allowed;
  }, [loading, error, permissionSnapshot]); // Dependencies for useCallback

  return {
    can,
    loading,
    error,
    permissionSnapshot,
    // No refetchPermissions needed here as AuthContext manages it
  };
};

export default usePermissions;
