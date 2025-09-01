import React, { useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
  TextField,
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useAuth } from '@/app/providers/contexts/AuthContext';
import {
  useFinancialCategories,
  useCreateFinancialCategory,
  useUpdateFinancialCategory,
  useDeleteFinancialCategory,
} from './api/erpQueries';

const FinancialCategoriesPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const restaurantId = user?.restaurants?.[0]?.id;

  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  const { data: categories, isLoading, isError, error } = useFinancialCategories(restaurantId);

  const createMutation = useCreateFinancialCategory();
  const updateMutation = useUpdateFinancialCategory();
  const deleteMutation = useDeleteFinancialCategory();

  const handleCreateCategory = () => {
    if (!newCategoryName.trim()) {
      toast.error(t('financial.category_name_required'));
      return;
    }
    createMutation.mutate({ name: newCategoryName, restaurant_id: restaurantId });
  };

  const handleEditClick = (category) => {
    setEditingCategory(category);
    setNewCategoryName(category.name);
  };

  const handleUpdateCategory = () => {
    if (!editingCategory || !newCategoryName.trim()) {
      toast.error(t('financial.category_name_required'));
      return;
    }
    updateMutation.mutate({ id: editingCategory.id, fields: { name: newCategoryName } });
  };

  const handleDeleteClick = (category) => {
    setCategoryToDelete(category);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    if (categoryToDelete) {
      deleteMutation.mutate(categoryToDelete.id);
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Alert severity="error">
          {t('financial.error_loading_categories', { message: error.message })}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {t('financial.manage_categories')}
      </Typography>

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {editingCategory ? t('financial.edit_category') : t('financial.add_new_category')}
        </Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <TextField
            label={t('financial.category_name')}
            variant="outlined"
            fullWidth
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                editingCategory ? handleUpdateCategory() : handleCreateCategory();
              }
            }}
          />
          {editingCategory ? (
            <>
              <Button
                variant="contained"
                onClick={handleUpdateCategory}
                disabled={updateMutation.isLoading}
                startIcon={<EditIcon />}
              >
                {t('financial.update_category')}
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  setEditingCategory(null);
                  setNewCategoryName('');
                }}
              >
                {t('financial.cancel')}
              </Button>
            </>
          ) : (
            <Button
              variant="contained"
              onClick={handleCreateCategory}
              disabled={createMutation.isLoading}
              startIcon={<AddIcon />}
            >
              {t('financial.add_category')}
            </Button>
          )}
        </Box>
      </Paper>

      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t('financial.existing_categories')}
        </Typography>
        {categories.length === 0 ? (
          <Typography variant="body1" color="text.secondary">
            {t('financial.no_categories_found')}
          </Typography>
        ) : (
          <List>
            {categories.map((category) => (
              <ListItem
                key={category.id}
                secondaryAction={
                  <>
                    <IconButton
                      edge="end"
                      aria-label="edit"
                      onClick={() => handleEditClick(category)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleDeleteClick(category)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </>
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
        <DialogTitle id="alert-dialog-title">
          {t('financial.confirm_delete_category_title')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {t('financial.confirm_delete_category_message', {
              categoryName: categoryToDelete?.name,
            })}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>{t('financial.cancel')}</Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            autoFocus
            disabled={deleteMutation.isLoading}
          >
            {t('financial.delete_category')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FinancialCategoriesPage;
