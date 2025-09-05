import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/app/providers/contexts/AuthContext';
import axios from 'axios';

// Import AUTH_ACTIONS to use the action type
import AuthContext from '@/app/providers/contexts/AuthContext';

const usePermissions = () => {
  const { user, selectedRestaurantId, dispatch } = useAuth(); // Get dispatch from context
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
          Authorization: `Bearer ${user.token}`,
        },
      });
      console.log('usePermissions Debug: API response for permission tree:', response.data);

      // Dispatch to global context
      if (dispatch) {
        dispatch({ type: 'SET_PERMISSION_SNAPSHOT', payload: response.data });
      }

      // Set local state
      setPermissionSnapshot(response.data);
    } catch (err) {
      console.error('Failed to fetch permission snapshot:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [user, selectedRestaurantId, dispatch]); // Add dispatch to dependency array

  useEffect(() => {
    // The user object from context is the source of truth.
    if (user?.permissionSnapshot) {
      setPermissionSnapshot(user.permissionSnapshot);
      setLoading(false);
    } else if (selectedRestaurantId) {
      // If no snapshot in context, fetch it.
      fetchPermissions();
    } else {
      // No user, no restaurant, no permissions.
      setLoading(false);
    }
    // Re-run when user or restaurant changes.
  }, [user, selectedRestaurantId, fetchPermissions]);

  const can = useCallback(
    (featureKey, actionKey) => {
      // If auth is still loading, or there's an error, or no snapshot yet, deny.
      if (loading || error || !permissionSnapshot) {
        return false;
      }

      // Superadmin bypass: if the flag is true, grant access immediately.
      if (permissionSnapshot.isSuperAdmin) {
        return true;
      }

      // If there's no module data (e.g., non-superadmin with no restaurant), deny.
      if (!permissionSnapshot.modules) {
        return false;
      }

      // Optimized search for feature and action
      let foundFeature = null;
      for (const mod of permissionSnapshot.modules) {
        // Check features directly under the module
        let feat = mod.features?.find((f) => f.key === featureKey);
        if (feat) {
          foundFeature = feat;
          break;
        }
        // Check features within submodules
        for (const submod of mod.submodules) {
          feat = submod.features.find((f) => f.key === featureKey);
          if (feat) {
            foundFeature = feat;
            break;
          }
        }
        if (foundFeature) break;
      }

      if (!foundFeature) return false;

      if (foundFeature.locked) {
        return false;
      }

      const action = foundFeature.actions.find((a) => a.key === actionKey);
      if (!action) return false;

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
