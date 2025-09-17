import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from 'react-query'; // Import useQueryClient

// React Query Hooks
import { useSaveAdminUser } from '@/features/Admin/api/adminQueries';

// Hooks
import usePermissions from '@/hooks/usePermissions';
import useAdminData from '@/hooks/useAdminData';

// Components
import UserTable from '@/components/Admin/UserTable';

// Services
import { deleteUser } from '@/services/adminService'; // Import deleteUser service

const AdminUsersPage = () => {
  const { t } = useTranslation();
  const { can } = usePermissions();
  const navigate = useNavigate();
  const queryClient = useQueryClient(); // Initialize useQueryClient

  const { users, loading } = useAdminData();

  // React Query Mutations
  const saveUserMutation = useSaveAdminUser();

  const handleDeleteUser = async (userId) => {
    if (window.confirm(t('admin_dashboard.confirm_delete_user'))) {
      try {
        await deleteUser(userId);
        queryClient.invalidateQueries('adminUsers'); // Invalidate cache to refetch users
        // Optionally show a success message
      } catch (error) {
        // Optionally show an error message
        console.error("Failed to delete user:", error);
      }
    }
  };

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
        canDeleteUser={can('admin:users', 'delete')}
        onDeleteUser={handleDeleteUser}
      />
    </Box>
  );
};

export default AdminUsersPage;
