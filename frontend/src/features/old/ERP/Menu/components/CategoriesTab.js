import React, { useState } from 'react';
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  DialogContentText,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useQueryClient } from 'react-query';
import { useAuth } from '@/app/providers/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { 
  useCategories, 
  useCreateCategory, 
  useUpdateCategory, 
  useDeleteCategory, 
  useToggleCategoryStatus 
} from '../api/menuService';

const CategoriesTab = () => {
  const { user } = useAuth();
  const restaurantId = user?.restaurants?.[0]?.id;
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', is_active: true });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const { data: categories, isLoading, isError, error } = useCategories(restaurantId);

  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();
  const toggleStatusMutation = useToggleCategoryStatus();

  const handleOpenModal = (category = null) => {
    if (category) {
      setIsEditing(true);
      setCurrentCategory(category);
      setFormData({ name: category.name, description: category.description, is_active: category.is_active });
    } else {
      setIsEditing(false);
      setCurrentCategory(null);
      setFormData({ name: '', description: '', is_active: true });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setCurrentCategory(null);
  };

  const handleSave = () => {
    const dataToSave = { ...formData, restaurant_id: restaurantId };
    if (isEditing) {
      updateMutation.mutate({ id: currentCategory.id, fields: dataToSave }, {
        onSuccess: () => {
          toast.success(t('menu_management.category_updated_success'));
          handleCloseModal();
        },
        onError: () => {
          toast.error(t('menu_management.category_updated_error'));
        }
      });
    } else {
      createMutation.mutate(dataToSave, {
        onSuccess: () => {
          toast.success(t('menu_management.category_created_success'));
          handleCloseModal();
        },
        onError: () => {
          toast.error(t('menu_management.category_created_error'));
        }
      });
    }
  };

  const handleDeleteClick = (id) => {
    setItemToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      deleteMutation.mutate(itemToDelete, {
        onSuccess: () => { toast.success(t('menu_management.category_deleted_success')); },
        onError: () => { toast.error(t('menu_management.category_deleted_error')); }
      });
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const handleToggleStatus = (id) => {
    toggleStatusMutation.mutate(id, {
      onSuccess: () => {
        toast.success(t('menu_management.category_status_updated'));
      },
      onError: () => {
        toast.error(t('menu_management.category_status_update_error'));
      }
    });
  };

  if (isLoading) return <CircularProgress />;
  if (isError) return <Alert severity="error">{error.message}</Alert>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenModal()}>
          {t('menu_management.new_category')}
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('menu_management.table.name')}</TableCell>
              <TableCell>{t('menu_management.table.description')}</TableCell>
              <TableCell>{t('menu_management.table.status')}</TableCell>
              <TableCell align="right">{t('menu_management.table.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories?.map((category) => (
              <TableRow key={category.id}>
                <TableCell>{category.name}</TableCell>
                <TableCell>{category.description}</TableCell>
                <TableCell>
                  <Switch
                    checked={category.is_active}
                    onChange={() => handleToggleStatus(category.id)}
                    disabled={toggleStatusMutation.isLoading}
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleOpenModal(category)}><EditIcon /></IconButton>
                  <IconButton onClick={() => handleDeleteClick(category.id)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={modalOpen} onClose={handleCloseModal}>
        <DialogTitle>{isEditing ? t('menu_management.edit_category') : t('menu_management.new_category')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={t('menu_management.table.name')}
            type="text"
            fullWidth
            variant="standard"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label={t('menu_management.table.description')}
            type="text"
            fullWidth
            multiline
            rows={3}
            variant="standard"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <FormControlLabel
            control={<Switch checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} />}
            label={t('menu_management.table.active')}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>{t('common.cancel')}</Button>
          <Button onClick={handleSave} disabled={createMutation.isLoading || updateMutation.isLoading}>
            {t('common.save')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>{t('menu_management.confirm_delete_category_title')}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t('menu_management.confirm_delete_category')}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>{t('common.cancel')}</Button>
          <Button onClick={confirmDelete} color="error">{t('common.delete')}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CategoriesTab;
