import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

// React Query Hooks
import { useSaveAdminUser } from './api/adminQueries';

// Hooks
import usePermissions from '@/hooks/usePermissions';
import useAdminData from '@/hooks/useAdminData';

// Components
import UserTable from '@/components/Admin/UserTable';

const AdminUsersPage = () => {
  const { t } = useTranslation();
  const { can } = usePermissions();
  const navigate = useNavigate();

  const { users, loading } = useAdminData();

  // React Query Mutations
  const saveUserMutation = useSaveAdminUser();

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {t('admin_dashboard.users_title')}
      </Typography>

      {can('admin:users', 'create') && (
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/admin/users/new')}
          sx={{ mb: 3 }}
        >
          {t('admin_dashboard.create_new_user')}
        </Button>
      )}

      <UserTable
        users={users}
        loading={loading || saveUserMutation.isLoading}
        canAddUser={can('admin:users', 'create')}
        canEditUser={can('admin:users', 'update')}
      />
    </Box>
  );
};

export default AdminUsersPage;
