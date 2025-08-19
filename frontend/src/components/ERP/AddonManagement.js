import React, { useState } from 'react';
import { Box, Button, TextField, List, ListItem, ListItemText, IconButton, Typography, Paper, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useTranslation } from 'react-i18next';
import axiosInstance from '../../api/axiosInstance';
import toast from 'react-hot-toast';

const fetchAddons = async () => {
  const { data } = await axiosInstance.get('/api/addons');
  return data;
};

const createAddon = async (newAddon) => {
  const { data } = await axiosInstance.post('/api/addons', newAddon);
  return data;
};

const updateAddon = async ({ id, name, price }) => {
  const { data } = await axiosInstance.put(`/api/addons/${id}`, { name, price });
  return data;
};

const deleteAddon = async (id) => {
  await axiosInstance.delete(`/api/addons/${id}`);
};

const AddonManagement = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data: addons, isLoading, isError } = useQuery('addons', fetchAddons);

  const [newAddonName, setNewAddonName] = useState('');
  const [newAddonPrice, setNewAddonPrice] = useState('');
  const [editingAddon, setEditingAddon] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [addonToDelete, setAddonToDelete] = useState(null);

  const addAddonMutation = useMutation(createAddon, {
    onSuccess: () => {
      queryClient.invalidateQueries('addons');
      setNewAddonName('');
      setNewAddonPrice('');
      toast.success(t('addon_management.add_success'));
    },
    onError: (error) => {
      toast.error(error.response?.data?.msg || t('addon_management.add_error'));
    },
  });

  const updateAddonMutation = useMutation(updateAddon, {
    onSuccess: () => {
      queryClient.invalidateQueries('addons');
      setEditingAddon(null);
      setNewAddonName('');
      setNewAddonPrice('');
      toast.success(t('addon_management.update_success'));
    },
    onError: (error) => {
      toast.error(error.response?.data?.msg || t('addon_management.update_error'));
    },
  });

  const deleteAddonMutation = useMutation(deleteAddon, {
    onSuccess: () => {
      queryClient.invalidateQueries('addons');
      toast.success(t('addon_management.delete_success'));
      setOpenDeleteDialog(false);
      setAddonToDelete(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.msg || t('addon_management.delete_error'));
    },
  });

  const handleAddAddon = () => {
    if (newAddonName.trim() && newAddonPrice.trim()) {
      addAddonMutation.mutate({ name: newAddonName, price: parseFloat(newAddonPrice) });
    }
  };

  const handleEditClick = (addon) => {
    setEditingAddon(addon);
    setNewAddonName(addon.name);
    setNewAddonPrice(addon.price.toString());
  };

  const handleUpdateAddon = () => {
    if (editingAddon && newAddonName.trim() && newAddonPrice.trim()) {
      updateAddonMutation.mutate({ id: editingAddon.id, name: newAddonName, price: parseFloat(newAddonPrice) });
    }
  };

  const handleDeleteClick = (addon) => {
    setAddonToDelete(addon);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    if (addonToDelete) {
      deleteAddonMutation.mutate(addonToDelete.id);
    }
  };

  if (isLoading) return <Typography>{t('common.loading')}</Typography>;
  if (isError) return <Typography>{t('common.error_loading_data')}</Typography>;

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h5" gutterBottom>{t('addon_management.title')}</Typography>
      <Paper elevation={2} className="form-container" sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>{editingAddon ? t('addon_management.edit_addon') : t('addon_management.add_new_addon')}</Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            label={t('addon_management.addon_name')}
            variant="outlined"
            fullWidth
            value={newAddonName}
            onChange={(e) => setNewAddonName(e.target.value)}
            className="form-control"
          />
          <TextField
            label={t('addon_management.addon_price')}
            variant="outlined"
            fullWidth
            type="number"
            value={newAddonPrice}
            onChange={(e) => setNewAddonPrice(e.target.value)}
            className="form-control"
          />
          {editingAddon ? (
            <Button
              variant="contained"
              color="primary"
              startIcon={<EditIcon />}
              onClick={handleUpdateAddon}
              disabled={updateAddonMutation.isLoading}
              className="btn btn-primary"
            >
              {t('addon_management.update_button')}
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleAddAddon}
              disabled={addAddonMutation.isLoading}
              className="btn btn-primary"
            >
              {t('addon_management.add_button')}
            </Button>
          )}
          {editingAddon && (
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => {
                setEditingAddon(null);
                setNewAddonName('');
                setNewAddonPrice('');
              }}
              className="btn btn-secondary"
            >
              {t('common.cancel')}
            </Button>
          )}
        </Box>
      </Paper>

      <Typography variant="h6" gutterBottom>{t('addon_management.existing_addons')}</Typography>
      <Box className="table-container">
        <Box className="card-header" style={{ padding: '15px 20px', borderBottom: '1px solid #e0e0e0' }}>
          <span className="card-title">{t('addon_management.existing_addons')}</span>
          <button className="btn btn-primary" style={{ padding: '8px 15px' }} onClick={() => { setEditingAddon(null); setNewAddonName(''); setNewAddonPrice(''); }}>
            <i className="fas fa-plus"></i> {t('addon_management.add_new_addon')}
          </button>
        </Box>
        <table>
          <thead>
            <tr>
              <th>{t('addon_management.addon_name')}</th>
              <th>{t('addon_management.addon_price')}</th>
              <th>{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {addons.length === 0 ? (
              <tr>
                <td colSpan="3"><Typography>{t('addon_management.no_addons')}</Typography></td>
              </tr>
            ) : (
              addons.map((addon) => (
                <tr key={addon.id}>
                  <td>{addon.name}</td>
                  <td>R$ {addon.price}</td>
                  <td>
                    <button className="action-btn edit-btn" onClick={() => handleEditClick(addon)}><i className="fas fa-edit"></i></button>
                    <button className="action-btn delete-btn" onClick={() => handleDeleteClick(addon)}><i className="fas fa-trash"></i></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Box>

      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{t('addon_management.confirm_delete_title')}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {t('addon_management.confirm_delete_message', { addonName: addonToDelete?.name })}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>{t('common.cancel')}</Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            {t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AddonManagement;