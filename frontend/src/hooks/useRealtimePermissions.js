// This hook is deprecated. The primary permission hook is now usePermissions, which uses a local snapshot for performance.
export const useCheckPermission = () => {
  return { data: { allowed: false, locked: true }, isLoading: false, isError: true, error: new Error('This hook is deprecated.') };
};