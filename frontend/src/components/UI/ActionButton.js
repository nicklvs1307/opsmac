import React from 'react';
import { Button } from '@/components/UI/Button'; // Assuming a generic Button component exists
import { LockClosedIcon } from '@heroicons/react/20/solid'; // Assuming Heroicons or similar icon library
import usePermissions from '@/hooks/usePermissions';
import toast from 'react-hot-toast';

const ActionButton = ({ children, featureKey, actionKey, onClick, ...props }) => {
  const { can, permissionSnapshot, loading, error } = usePermissions();

  // Determine if the action is allowed
  const isAllowed = can(featureKey, actionKey);

  // Check if the feature is explicitly locked by entitlement (for upsell)
  let isFeatureLockedByEntitlement = false;
  if (!loading && !error && permissionSnapshot) {
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
    if (foundFeature && foundFeature.locked) {
      isFeatureLockedByEntitlement = true;
    }
  }

  const handleClick = (event) => {
    if (isFeatureLockedByEntitlement) {
      toast.error('Este recurso está bloqueado. Entre em contato para mais informações.');
      // Optionally, open an upsell modal here
      return;
    }
    if (onClick) {
      onClick(event);
    }
  };

  return (
    <Button
      {...props}
      onClick={handleClick}
      disabled={!isAllowed || loading || error} // Disable if not allowed, loading, or error
      className={`${props.className || ''} ${isFeatureLockedByEntitlement ? 'opacity-50 cursor-not-allowed' : ''}`}
      title={isFeatureLockedByEntitlement ? 'Recurso Bloqueado' : isAllowed ? '' : 'Sem permissão'}
    >
      {children}
      {isFeatureLockedByEntitlement && (
        <LockClosedIcon className="ml-2 h-4 w-4 text-gray-500" aria-hidden="true" />
      )}
    </Button>
  );
};

export default ActionButton;
