import React, { useState } from 'react';
import { Box, Typography, Button, TextField, MenuItem, Select, FormControl, InputLabel, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, CircularProgress, Alert } from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axiosInstance from 'api/axiosInstance';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

const fetchIngredients = async () => {
  const { data } = await axiosInstance.get('/api/ingredients');
  return data;
};

const createIngredient = async (newIngredient) => {
  const { data } = await axiosInstance.post('/api/ingredients', newIngredient);
  return data;
};

const updateIngredient = async ({ id, ...updatedIngredient }) => {
  const { data } = await axiosInstance.put(`/api/ingredients/${id}`, updatedIngredient);
  return data;
};

const deleteIngredient = async (id) => {
  await axiosInstance.delete(`/api/ingredients/${id}`);
};

const Ingredients = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const restaurantId = user?.restaurants?.[0]?.id; // Assuming user is associated with one restaurant

  const { data: ingredients, isLoading, isError } = useQuery('ingredients', fetchIngredients, {
    enabled: !!restaurantId, // Only fetch if restaurantId is available
    onError: (error) => {
      toast.error(t('ingredient_management.error_loading_ingredients', { message: error.response?.data?.msg || error.message }));
    }
  });

  const [openDialog, setOpenDialog] = useState(false);
  const [currentIngredient, setCurrentIngredient] = useState(null);
  const [formValues, setFormValues] = useState({
    name: '',
    unit_of_measure: '',
    cost_per_unit: '',
  });

  const unitOfMeasureOptions = [
    'g', 'kg', 'ml', 'L', 'unidade', 'colher de chá', 'colher de sopa', 'xícara', 'pitada', 'a gosto'
  ];

  const createMutation = useMutation(createIngredient, {
    onSuccess: () => {
      toast.success(t('ingredient_management.add_success'));
      queryClient.invalidateQueries('ingredients');
      handleCloseDialog();
    },
    onError: (error) => {
      toast.error(t('ingredient_management.add_error', { message: error.response?.data?.msg || error.message }));
    }
  });

  const updateMutation = useMutation(updateIngredient, {
    onSuccess: () => {
      toast.success(t('ingredient_management.update_success'));
      queryClient.invalidateQueries('ingredients');
      handleCloseDialog();
    },
    onError: (error) => {
      toast.error(t('ingredient_management.update_error', { message: error.response?.data?.msg || error.message }));
    }
  });

  const deleteMutation = useMutation(deleteIngredient, {
    onSuccess: () => {
      toast.success(t('ingredient_management.delete_success'));
      queryClient.invalidateQueries('ingredients');
    },
    onError: (error) => {
      toast.error(t('ingredient_management.delete_error', { message: error.response?.data?.msg || error.message }));
    }
  });

  const handleOpenDialog = (ingredient = null) => {
    setCurrentIngredient(ingredient);
    if (ingredient) {
      setFormValues({
        name: ingredient.name,
        unit_of_measure: ingredient.unit_of_measure,
        cost_per_unit: ingredient.cost_per_unit,
      });
    } else {
      setFormValues({
        name: '',
        unit_of_measure: '',
        cost_per_unit: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentIngredient(null);
    setFormValues({
      name: '',
      unit_of_measure: '',
      cost_per_unit: '',
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (currentIngredient) {
      updateMutation.mutate({ id: currentIngredient.id, ...formValues });
    } else {
      createMutation.mutate(formValues);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Tem certeza que deseja deletar este ingrediente?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Alert severity="error">{t('ingredient_management.error_loading_ingredients_generic')}</Alert>
      </Box>
    );
  }

  if (!restaurantId) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Alert severity="warning">{t('ingredient_management.no_restaurant_associated')}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>{t('ingredient_management.title')}</Typography>
      <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
        {t('ingredient_management.add_ingredient_button')}
      </Button>

      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('ingredient_management.table_header_name')}</TableCell>
              <TableCell>{t('ingredient_management.table_header_unit')}</TableCell>
              <TableCell>{t('ingredient_management.table_header_cost')}</TableCell>
              <TableCell align="right">{t('ingredient_management.table_header_actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ingredients.map((ingredient) => (
              <TableRow key={ingredient.id}>
                <TableCell>{ingredient.name}</TableCell>
                <TableCell>{ingredient.unit_of_measure}</TableCell>
                <TableCell>R$ {Number(ingredient.cost_per_unit).toFixed(4)}</TableCell>
                <TableCell align="right">
                  <IconButton color="primary" onClick={() => handleOpenDialog(ingredient)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(ingredient.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{currentIngredient ? t('ingredient_management.edit_ingredient_title') : t('ingredient_management.add_ingredient_title')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('ingredient_management.dialog_description')}
          </DialogContentText>
          <form onSubmit={handleSubmit}>
            <TextField
              autoFocus
              margin="dense"
              name="name"
              label={t('ingredient_management.ingredient_name_label')}
              type="text"
              fullWidth
              variant="outlined"
              value={formValues.name}
              onChange={handleChange}
              required
            />
            <FormControl fullWidth margin="dense" variant="outlined" required>
              <InputLabel>{t('ingredient_management.unit_of_measure_label')}</InputLabel>
              <Select
                name="unit_of_measure"
                value={formValues.unit_of_measure}
                onChange={handleChange}
                label={t('ingredient_management.unit_of_measure_label')}
              >
                {unitOfMeasureOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              margin="dense"
              name="cost_per_unit"
              label={t('ingredient_management.cost_per_unit_label')}
              type="number"
              fullWidth
              variant="outlined"
              value={formValues.cost_per_unit}
              onChange={handleChange}
              inputProps={{ step: "0.0001" }}
              required
            />
            <DialogActions>
              <Button onClick={handleCloseDialog}>{t('common.cancel')}</Button>
              <Button type="submit" variant="contained" color="primary">
                {currentIngredient ? t('ingredient_management.save_changes_button') : t('ingredient_management.add_button')}
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Ingredients;
