import { useAuth } from '@/app/providers/contexts/AuthContext';

const usePermissions = () => {
  const { allowedPermissions, allowedModules, user } = useAuth();

  const hasPermission = (permissionName) => {
    // Super admin has all permissions
    if (user && user.role === 'super_admin') {
      return true;
    }
    return allowedPermissions.includes(permissionName);
  };

  const hasModule = (moduleName) => {
    // Super admin has all modules
    if (user && user.role === 'super_admin') {
      return true;
    }
    return allowedModules.includes(moduleName);
  };

  return {
    hasPermission,
    hasModule,
  };
};

export default usePermissions;
