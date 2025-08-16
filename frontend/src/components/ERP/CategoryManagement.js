import React, { useState } from 'react';
import { Box, Button, TextField, List, ListItem, ListItemText, IconButton, Typography, Paper, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useTranslation } from 'react-i18next';
import axiosInstance from '../api/axiosInstance';
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
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>{editingCategory ? t('category_management.edit_category') : t('category_management.add_new_category')}</Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            label={t('category_management.category_name')}
            variant="outlined"
            fullWidth
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
          />
          {editingCategory ? (
            <Button
              variant="contained"
              color="primary"
              startIcon={<EditIcon />}
              onClick={handleUpdateCategory}
              disabled={updateCategoryMutation.isLoading}
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
            >
              {t('common.cancel')}
            </Button>
          )}
        </Box>
      </Paper>

      <Typography variant="h6" gutterBottom>{t('category_management.existing_categories')}</Typography>
      <Paper elevation={2} sx={{ p: 3 }}>
        {categories.length === 0 ? (
          <Typography>{t('category_management.no_categories')}</Typography>
        ) : (
          <List>
            {categories.map((category) => (
              <ListItem
                key={category.id}
                secondaryAction={
                  <Box>
                    <IconButton edge="end" aria-label="edit" onClick={() => handleEditClick(category)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteClick(category)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                }
              >
                <ListItemText primary={category.name} />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>

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