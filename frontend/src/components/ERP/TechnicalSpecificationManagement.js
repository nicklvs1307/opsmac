import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField, List, ListItem, ListItemText, IconButton, Paper, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, InputLabel, Select, MenuItem, CircularProgress, Alert, Divider } from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, RemoveCircleOutline as RemoveIcon } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axiosInstance from '../../api/axiosInstance';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

// Fetch functions
const fetchProducts = async () => {
  const { data } = await axiosInstance.get('/api/products');
  return data;
};

const fetchIngredients = async () => {
  const { data } = await axiosInstance.get('/api/ingredients');
  return data;
};

const fetchTechnicalSpecification = async (productId) => {
  if (!productId) return null;
  const { data } = await axiosInstance.get(`/api/technical-specifications/${productId}`);
  return data;
};

const createTechnicalSpecification = async (data) => {
  const { data: response } = await axiosInstance.post('/api/technical-specifications', data);
  return response;
};

const updateTechnicalSpecification = async ({ productId, recipe_ingredients }) => {
  const { data } = await axiosInstance.put(`/api/technical-specifications/${productId}`, { recipe_ingredients });
  return data;
};

const deleteTechnicalSpecification = async (productId) => {
  await axiosInstance.delete(`/api/technical-specifications/${productId}`);
};

const TechnicalSpecificationManagement = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [selectedProductId, setSelectedProductId] = useState('');
  const [currentRecipeIngredients, setCurrentRecipeIngredients] = useState([]);
  const [selectedIngredientId, setSelectedIngredientId] = useState('');
  const [ingredientQuantity, setIngredientQuantity] = useState('');
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [tsToDeleteProductId, setTsToDeleteProductId] = useState(null);

  // Fetch data
  const { data: products, isLoading: isLoadingProducts, isError: isErrorProducts } = useQuery('products', fetchProducts);
  const { data: ingredients, isLoading: isLoadingIngredients, isError: isErrorIngredients } = useQuery('ingredients', fetchIngredients);
  const { data: technicalSpecification, isLoading: isLoadingTS, isError: isErrorTS, refetch: refetchTS } = useQuery(
    ['technicalSpecification', selectedProductId],
    () => fetchTechnicalSpecification(selectedProductId),
    { enabled: !!selectedProductId }
  );

  // Mutations
  const createTSMutation = useMutation(createTechnicalSpecification, {
    onSuccess: () => {
      toast.success(t('ts_management.create_success'));
      refetchTS();
      queryClient.invalidateQueries('products'); // Invalidate products to show TS status if needed
    },
    onError: (error) => {
      toast.error(error.response?.data?.msg || t('ts_management.create_error'));
    },
  });

  const updateTSMutation = useMutation(updateTechnicalSpecification, {
    onSuccess: () => {
      toast.success(t('ts_management.update_success'));
      refetchTS();
    },
    onError: (error) => {
      toast.error(error.response?.data?.msg || t('ts_management.update_error'));
    },
  });

  const deleteTSMutation = useMutation(deleteTechnicalSpecification, {
    onSuccess: () => {
      toast.success(t('ts_management.delete_success'));
      queryClient.invalidateQueries('products');
      setSelectedProductId('');
      setCurrentRecipeIngredients([]);
      setOpenDeleteDialog(false);
      setTsToDeleteProductId(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.msg || t('ts_management.delete_error'));
    },
  });

  // Effects
  useEffect(() => {
    if (technicalSpecification) {
      setCurrentRecipeIngredients(technicalSpecification.recipeIngredients || []);
    } else {
      setCurrentRecipeIngredients([]);
    }
  }, [technicalSpecification]);

  // Handlers
  const handleAddIngredient = () => {
    if (selectedIngredientId && ingredientQuantity > 0) {
      const ingredientToAdd = ingredients.find(ing => ing.id === selectedIngredientId);
      if (ingredientToAdd) {
        setCurrentRecipeIngredients(prev => [
          ...prev,
          {
            ingredient_id: selectedIngredientId,
            quantity: parseFloat(ingredientQuantity),
            ingredient: { ...ingredientToAdd } // Include ingredient details for display
          }
        ]);
        setSelectedIngredientId('');
        setIngredientQuantity('');
      }
    } else {
      toast.error(t('ts_management.add_ingredient_error_validation'));
    }
  };

  const handleRemoveIngredient = (ingredientId) => {
    setCurrentRecipeIngredients(prev => prev.filter(item => item.ingredient_id !== ingredientId));
  };

  const handleSaveTechnicalSpecification = () => {
    const recipe_ingredients = currentRecipeIngredients.map(ri => ({
      ingredient_id: ri.ingredient_id,
      quantity: ri.quantity,
    }));

    if (technicalSpecification) {
      updateTSMutation.mutate({ productId: selectedProductId, recipe_ingredients });
    } else {
      createTSMutation.mutate({ product_id: selectedProductId, recipe_ingredients });
    }
  };

  const handleDeleteTSClick = (productId) => {
    setTsToDeleteProductId(productId);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDeleteTS = () => {
    if (tsToDeleteProductId) {
      deleteTSMutation.mutate(tsToDeleteProductId);
    }
  };

  if (isLoadingProducts || isLoadingIngredients) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (isErrorProducts || isErrorIngredients) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Alert severity="error">{t('common.error_loading_data')}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>{t('ts_management.title')}</Typography>

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>{t('ts_management.select_product')}</Typography>
        <FormControl fullWidth variant="outlined">
          <InputLabel>{t('ts_management.product')}</InputLabel>
          <Select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            label={t('ts_management.product')}
          >
            <MenuItem value="">{t('ts_management.select_product_placeholder')}</MenuItem>
            {products?.map(product => (
              <MenuItem key={product.id} value={product.id}>
                {product.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      {selectedProductId && (
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>{t('ts_management.manage_ts', { productName: products?.find(p => p.id === selectedProductId)?.name || '' })}</Typography>
          
          {isLoadingTS ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100px">
              <CircularProgress />
            </Box>
          ) : isErrorTS ? (
            <Alert severity="error">{t('ts_management.error_loading_ts')}</Alert>
          ) : (
            <>
              <Typography variant="subtitle1" gutterBottom>{t('ts_management.current_ingredients')}</Typography>
              {currentRecipeIngredients.length === 0 ? (
                <Typography color="text.secondary">{t('ts_management.no_ingredients_added')}</Typography>
              ) : (
                <List>
                  {currentRecipeIngredients.map((item, index) => (
                    <ListItem key={item.ingredient_id || index} secondaryAction={
                      <IconButton edge="end" aria-label="delete" onClick={() => handleRemoveIngredient(item.ingredient_id)}>
                        <RemoveIcon />
                      </IconButton>
                    }>
                      <ListItemText
                        primary={`${item.ingredient?.name || 'N/A'} - ${item.quantity} ${item.ingredient?.unit_of_measure || ''}`}
                        secondary={`Custo: R$ ${((item.ingredient?.cost_per_unit || 0) * item.quantity).toFixed(4)}`}
                      />
                    </ListItem>
                  ))}
                </List>
              )}

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle1" gutterBottom>{t('ts_management.add_ingredient')}</Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>{t('ts_management.ingredient')}</InputLabel>
                  <Select
                    value={selectedIngredientId}
                    onChange={(e) => setSelectedIngredientId(e.target.value)}
                    label={t('ts_management.ingredient')}
                  >
                    <MenuItem value="">{t('ts_management.select_ingredient_placeholder')}</MenuItem>
                    {ingredients?.map(ingredient => (
                      <MenuItem key={ingredient.id} value={ingredient.id}>
                        {ingredient.name} ({ingredient.unit_of_measure})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  label={t('ts_management.quantity')}
                  type="number"
                  value={ingredientQuantity}
                  onChange={(e) => setIngredientQuantity(e.target.value)}
                  variant="outlined"
                  sx={{ width: 150 }}
                  inputProps={{ step: "0.01" }}
                />
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddIngredient}>
                  {t('ts_management.add_button')}
                </Button>
              </Box>

              <Button
                variant="contained"
                color="primary"
                onClick={handleSaveTechnicalSpecification}
                disabled={currentRecipeIngredients.length === 0 || createTSMutation.isLoading || updateTSMutation.isLoading}
                sx={{ mr: 2 }}
              >
                {technicalSpecification ? t('ts_management.update_ts_button') : t('ts_management.create_ts_button')}
              </Button>
              {technicalSpecification && (
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => handleDeleteTSClick(selectedProductId)}
                  disabled={deleteTSMutation.isLoading}
                >
                  {t('ts_management.delete_ts_button')}
                </Button>
              )}
            </>
          )}
        </Paper>
      )}

      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{t('ts_management.confirm_delete_title')}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {t('ts_management.confirm_delete_message')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>{t('common.cancel')}</Button>
          <Button onClick={handleConfirmDeleteTS} color="error" autoFocus>
            {t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TechnicalSpecificationManagement;