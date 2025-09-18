import { useAuth } from '@/app/providers/contexts/AuthContext';

// This hook provides a function to check user permissions against the snapshot.
export const usePermissions = () => {
  const { user } = useAuth();
  const permissionSnapshot = user?.permissionSnapshot;

  const can = (featureKey, actionKey) => {
    if (user?.isSuperadmin) {
      return true;
    }

    if (!permissionSnapshot || !permissionSnapshot.modules) {
      return false; // Default to not allowed if no snapshot
    }

    for (const module of permissionSnapshot.modules) {
      for (const submodule of module.submodules) {
        const feature = submodule.features.find((f) => f.key === featureKey);
        if (feature) {
          if (feature.isLockedByEntitlement) {
            return false;
          }
          const action = feature.actions.find((a) => a.key === actionKey);
          if (action) {
            return action.allowed;
          }
        }
      }
    }

    return false; // Default deny if not found
  };

  return { can, isSuperadmin: user?.isSuperadmin || false };
};
