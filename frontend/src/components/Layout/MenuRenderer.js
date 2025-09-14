import React from 'react';
import Sidebar from '@/components/Layout/Sidebar';
import { menuStructure } from '@/components/Layout/menuStructure';
import { useAuth } from '@/app/providers/contexts/AuthContext';
import { usePermission } from '@/hooks/usePermission';

const MenuRenderer = ({ onMobileClose }) => {
  const { user, loading } = useAuth();
  const { checkPermission } = usePermission();
  const isSuperAdmin = user?.isSuperAdmin || false;

  if (loading || !user) {
    return <div>Carregando Menu...</div>; // Or a skeleton loader
  }

  return (
    <Sidebar
      menuStructure={menuStructure}
      checkPermission={checkPermission}
      onMobileClose={onMobileClose}
      isSuperAdmin={isSuperAdmin}
    />
  );
};

export default MenuRenderer;