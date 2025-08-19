import React, { useState } from 'react';
import { Box, Button, TextField, List, ListItem, ListItemText, IconButton, Typography, Paper, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useTranslation } from 'react-i18next';
import axiosInstance from '../../api/axiosInstance';
import toast from 'react-hot-toast';

const fetchCategories = async () => {
  const { data } = await axiosInstance.get('/api/categories');
  return data;
};

const createCategory = async (newCategory) => {
  const { data } = await axiosInstance.post('/api/categories', newCategory);
  return data;
};

const updateCategory = async ({ id, name }) => {
  const { data } = await axiosInstance.put(`/api/categories/${id}`, { name });
  return data;
};

const deleteCategory = async (id) => {
  await axiosInstance.delete(`/api/categories/${id}`);
};

const CategoryManagement = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data: categories, isLoading, isError } = useQuery('categories', fetchCategories);

  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  const addCategoryMutation = useMutation(createCategory, {
    onSuccess: () => {
      queryClient.invalidateQueries('categories');
      setNewCategoryName('');
      toast.success(t('category_management.add_success'));
    },
    onError: (error) => {
      toast.error(error.response?.data?.msg || t('category_management.add_error'));
    },
  });

  const updateCategoryMutation = useMutation(updateCategory, {
    onSuccess: () => {
      queryClient.invalidateQueries('categories');
      setEditingCategory(null);
      toast.success(t('category_management.update_success'));
    },
    onError: (error) => {
      toast.error(error.response?.data?.msg || t('category_management.update_error'));
    },
  });

  const deleteCategoryMutation = useMutation(deleteCategory, {
    onSuccess: () => {
      queryClient.invalidateQueries('categories');
      toast.success(t('category_management.delete_success'));
      setOpenDeleteDialog(false);
      setCategoryToDelete(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.msg || t('category_management.delete_error'));
    },
  });

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      addCategoryMutation.mutate({ name: newCategoryName });
    }
  };

  const handleEditClick = (category) => {
    setEditingCategory(category);
    setNewCategoryName(category.name); // Populate the input with the current name
  };

  const handleUpdateCategory = () => {
    if (editingCategory && newCategoryName.trim()) {
      updateCategoryMutation.mutate({ id: editingCategory.id, name: newCategoryName });
    }
  };

  const handleDeleteClick = (category) => {
    setCategoryToDelete(category);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    if (categoryToDelete) {
      deleteCategoryMutation.mutate(categoryToDelete.id);
    }
  };

  if (isLoading) return <Typography>{t('common.loading')}</Typography>;
  if (isError) return <Typography>{t('common.error_loading_data')}</Typography>;

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h5" gutterBottom>{t('category_management.title')}</Typography>
      <Paper elevation={2} className="form-container" sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>{editingCategory ? t('category_management.edit_category') : t('category_management.add_new_category')}</Typography>
        <Box className="form-group" sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            label={t('category_management.category_name')}
            variant="outlined"
            fullWidth
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            className="form-control"
          />
          {editingCategory ? (
            <Button
              variant="contained"
              color="primary"
              startIcon={<EditIcon />}
              onClick={handleUpdateCategory}
              disabled={updateCategoryMutation.isLoading}
              className="btn btn-primary"
            >
              {t('category_management.update_button')}
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleAddCategory}
              disabled={addCategoryMutation.isLoading}
              className="btn btn-primary"
            >
              {t('category_management.add_button')}
            </Button>
          )}
          {editingCategory && (
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => {
                setEditingCategory(null);
                setNewCategoryName('');
              }}
              className="btn btn-secondary"
            >
              {t('common.cancel')}
            </Button>
          )}
        </Box>
      </Paper>

      <Typography variant="h6" gutterBottom>{t('category_management.existing_categories')}</Typography>
      <Box className="table-container">
        <Box className="card-header" style={{ padding: '15px 20px', borderBottom: '1px solid #e0e0e0' }}>
          <span className="card-title">{t('category_management.existing_categories')}</span>
          <button className="btn btn-primary" style={{ padding: '8px 15px' }} onClick={() => { setEditingCategory(null); setNewCategoryName(''); }}>
            <i className="fas fa-plus"></i> {t('category_management.add_new_category')}
          </button>
        </Box>
        <table>
          <thead>
            <tr>
              <th>{t('category_management.category_name')}</th>
              <th>{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan="2"><Typography>{t('category_management.no_categories')}</Typography></td>
              </tr>
            ) : (
              categories.map((category) => (
                <tr key={category.id}>
                  <td>{category.name}</td>
                  <td>
                    <button className="action-btn edit-btn" onClick={() => handleEditClick(category)}><i className="fas fa-edit"></i></button>
                    <button className="action-btn delete-btn" onClick={() => handleDeleteClick(category)}><i className="fas fa-trash"></i></button>
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
        <DialogTitle id="alert-dialog-title">{t('category_management.confirm_delete_title')}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {t('category_management.confirm_delete_message', { categoryName: categoryToDelete?.name })}
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

export default CategoryManagement;