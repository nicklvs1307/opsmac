// This hook is deprecated. Please use usePermissions from '@/hooks/usePermissions.js' instead.
export const usePermission = () => {
  return { checkPermission: () => ({ allowed: false, locked: true }) };
};