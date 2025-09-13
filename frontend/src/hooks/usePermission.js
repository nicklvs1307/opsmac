import { useAuth } from '@/app/providers/contexts/AuthContext';

// This hook provides a function to check user permissions against the snapshot.
export const usePermission = () => {
  const { user } = useAuth();
  const permissionSnapshot = user?.permissionSnapshot;

  const checkPermission = (featureKey, actionKey) => {
    if (user?.isSuperadmin) {
      return { allowed: true, locked: false };
    }

    if (!permissionSnapshot || !permissionSnapshot.modules) {
      return { allowed: false, locked: true }; // Default to locked if no snapshot
    }

    for (const module of permissionSnapshot.modules) {
      for (const submodule of module.submodules) {
        const feature = submodule.features.find(f => f.key === featureKey);
        if (feature) {
          if (feature.isLockedByEntitlement) {
            return { allowed: false, locked: true };
          }
          const action = feature.actions.find(a => a.key === actionKey);
          if (action) {
            return { allowed: action.allowed, locked: action.locked };
          }
        }
      }
    }

    return { allowed: false, locked: false }; // Default deny if not found
  };

  return { checkPermission };
};