import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/app/providers/contexts/AuthContext'; // Assuming AuthContext provides user and selected restaurant
import axios from 'axios'; // Assuming axios is available for API calls

const usePermissions = () => {
  const { user, selectedRestaurantId } = useAuth(); // Assuming selectedRestaurantId is available from AuthContext
  const [permissionSnapshot, setPermissionSnapshot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPermissions = useCallback(async () => {
    if (!user || !selectedRestaurantId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/api/iam/${selectedRestaurantId}/tree`, {
        headers: {
          Authorization: `Bearer ${user.token}`, // Assuming user.token exists
        },
      });
      setPermissionSnapshot(response.data);
    } catch (err) {
      console.error('Failed to fetch permission snapshot:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [user, selectedRestaurantId]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  const can = useCallback(
    (featureKey, actionKey) => {
      if (loading || error || !permissionSnapshot) {
        return false; // Or handle as appropriate during loading/error
      }

      // Superadmin bypass
      if (permissionSnapshot.isSuperAdmin) {
        return true;
      }

      // Owner bypass (if feature is not locked by entitlement)
      // This logic is already handled in the backend buildSnapshot, so we just check the 'allowed' flag
      // if (permissionSnapshot.isOwner && !featureLocked) { return true; } // This is implicitly handled by the snapshot

      // Optimized search for feature and action
      let foundFeature = null;
      for (const mod of permissionSnapshot.modules) {
        for (const submod of mod.submodules) {
          const feat = submod.features.find((f) => f.key === featureKey);
          if (feat) {
            foundFeature = feat;
            break;
          }
        }
        if (foundFeature) break;
      }

      if (!foundFeature) return false; // Feature not found in snapshot

      if (foundFeature.locked) {
        return false; // Feature is locked by entitlement
      }

      const action = foundFeature.actions.find((a) => a.key === actionKey);
      if (!action) return false; // Action not found for this feature

      return action.allowed;
    },
    [loading, error, permissionSnapshot]
  );

  return {
    can,
    permissionSnapshot,
    loading,
    error,
    refetchPermissions: fetchPermissions,
  };
};

export default usePermissions;
