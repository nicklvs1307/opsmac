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
import { useAuth } from '@/app/providers/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useAddons, useCreateAddon, useUpdateAddon, useDeleteAddon, useToggleAddonStatus } from '../api/menuQueries';

const AddonsTab = () => {
  const { user } = useAuth();
  const restaurantId = user?.restaurants?.[0]?.id;
  const { t } = useTranslation();

  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [formData, setFormData] = useState({ name: '', price: '', is_active: true });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const { data: addons, isLoading, isError, error } = useAddons(restaurantId);

  const createMutation = useCreateAddon();
  const updateMutation = useUpdateAddon();
  const deleteMutation = useDeleteAddon();
  const toggleStatusMutation = useToggleAddonStatus();

  const handleOpenModal = (item = null) => {
    if (item) {
      setIsEditing(true);
      setCurrentItem(item);
      setFormData({ name: item.name, price: item.price, is_active: item.is_active });
    } else {
      setIsEditing(false);
      setCurrentItem(null);
      setFormData({ name: '', price: '', is_active: true });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setCurrentItem(null);
  };

  const handleSave = () => {
    const dataToSave = { ...formData, price: parseFloat(formData.price), restaurant_id: restaurantId };
    if (isEditing) {
      updateMutation.mutate({ id: currentItem.id, fields: dataToSave }, {
        onSuccess: () => { toast.success(t('menu_management.addon_updated_success')); handleCloseModal(); },
        onError: () => { toast.error(t('menu_management.addon_updated_error')); }
      });
    } else {
      createMutation.mutate(dataToSave, {
        onSuccess: () => { toast.success(t('menu_management.addon_created_success')); handleCloseModal(); },
        onError: () => { toast.error(t('menu_management.addon_created_error')); }
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
        onSuccess: () => { toast.success(t('menu_management.addon_deleted_success')); },
        onError: () => { toast.error(t('menu_management.addon_deleted_error')); }
      });
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const handleToggleStatus = (id) => {
    toggleStatusMutation.mutate(id, {
        onSuccess: () => { toast.success(t('menu_management.addon_status_updated')); },
        onError: () => { toast.error(t('menu_management.addon_status_update_error')); }S
    });
  };

  if (isLoading) return <CircularProgress />;
  if (isError) return <Alert severity="error">{error.message}</Alert>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenModal()}>
          {t('menu_management.new_addon')}
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('menu_management.table.name')}</TableCell>
              <TableCell>{t('menu_management.table.price')}</TableCell>
              <TableCell>{t('menu_management.table.status')}</TableCell>
              <TableCell align="right">{t('menu_management.table.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {addons?.map((addon) => (
              <TableRow key={addon.id}>
                <TableCell>{addon.name}</TableCell>
                <TableCell>{`R$ ${addon.price}`}</TableCell>
                <TableCell>
                  <Switch
                    checked={addon.is_active}
                    onChange={() => handleToggleStatus(addon.id)}
                    disabled={toggleStatusMutation.isLoading}
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleOpenModal(addon)}><EditIcon /></IconButton>
                  <IconButton onClick={() => handleDeleteClick(addon.id)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={modalOpen} onClose={handleCloseModal}>
        <DialogTitle>{isEditing ? t('menu_management.edit_addon') : t('menu_management.new_addon')}</DialogTitle>
        <DialogContent>
          <TextField autoFocus margin="dense" label={t('menu_management.table.name')} type="text" fullWidth variant="standard" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          <TextField margin="dense" label={t('menu_management.table.price')} type="number" fullWidth variant="standard" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
          <FormControlLabel control={<Switch checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} />} label={t('menu_management.table.active')} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>{t('common.cancel')}</Button>
          <Button onClick={handleSave} disabled={createMutation.isLoading || updateMutation.isLoading}>{t('common.save')}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>{t('menu_management.confirm_delete_addon_title')}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t('menu_management.confirm_delete_addon')}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>{t('common.cancel')}</Button>
          <Button onClick={confirmDelete} color="error">{t('common.delete')}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AddonsTab;
