import React, { useState } from 'react';
import { Box, Typography, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from 'react-query';
import toast from 'react-hot-toast';

// React Query Hooks
import { useSaveAdminUser } from '@/features/Admin/api/adminQueries';

// Hooks
import { usePermissions } from '../../hooks/usePermissions';
import useAdminData from '../hooks/useAdminData';

// Components
import UserTable from '../components/UserTable';

// Services
import { deleteUser } from '../services/adminService'; // Import deleteUser service

const UsersPage = () => {
  const { t } = useTranslation();
  const { can } = usePermissions();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { users, loading } = useAdminData();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const saveUserMutation = useSaveAdminUser();

  const handleDeleteClick = (userId) => {
    setUserToDelete(userId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (userToDelete) {
      try {
        await deleteUser(userToDelete);
        queryClient.invalidateQueries('adminUsers');
        toast.success('Usuário excluído com sucesso!');
      } catch (error) {
        console.error('Failed to delete user:', error);
        toast.error(error.response?.data?.message || 'Erro ao excluir usuário.');
      } finally {
        setDeleteDialogOpen(false);
        setUserToDelete(null);
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
        onDeleteUser={handleDeleteClick}
      />

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>{t('admin_dashboard.confirm_delete_user_title')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('admin_dashboard.confirm_delete_user')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>{t('common.cancel')}</Button>
          <Button onClick={confirmDelete} color="error">
            {t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UsersPage;
