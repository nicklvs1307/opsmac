import React, { useState } from 'react';
import { Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl, InputLabel, Select, MenuItem, IconButton } from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, RestaurantMenu as RestaurantMenuIcon } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useForm, Controller } from 'react-hook-form';
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const fetchProducts = async (restaurantId) => {
  const { data } = await axiosInstance.get('/api/products');
  return data;
};

const createProduct = (product) => {
  return axiosInstance.post('/api/products', product);
};

const Products = () => {
  const { user } = useAuth();
  const restaurantId = user?.restaurants?.[0]?.id;
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [openTechSpecDialog, setOpenTechSpecDialog] = useState(false);
  const [selectedProductForTechSpec, setSelectedProductForTechSpec] = useState(null);

  const { data: products, isLoading, isError } = useQuery('products', () => fetchProducts(restaurantId), {
    enabled: !!restaurantId,
  });

  const { control, handleSubmit, reset } = useForm();

  const mutation = useMutation(createProduct, {
    onSuccess: () => {
      queryClient.invalidateQueries('products');
      setOpen(false);
      reset();
    },
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpenTechSpecDialog = (product) => {
    setSelectedProductForTechSpec(product);
    setOpenTechSpecDialog(true);
  };

  const handleCloseTechSpecDialog = () => {
    setOpenTechSpecDialog(false);
    setSelectedProductForTechSpec(null);
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Produtos
      </Typography>

      <Button variant="contained" onClick={handleOpen} sx={{ mb: 2 }}>
        Novo Produto
      </Button>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Descrição</TableCell>
                <TableCell>Preço</TableCell>
                <TableCell>SKU</TableCell>
                <TableCell>Ficha Técnica</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Alert severity="error">Erro ao carregar produtos.</Alert>
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.description}</TableCell>
                    <TableCell>R$ {Number(product.price).toFixed(2)}</TableCell>
                    <TableCell>{product.sku}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>
                      <Button 
                        variant="outlined" 
                        size="small" 
                        startIcon={<RestaurantMenuIcon />} 
                        onClick={() => handleOpenTechSpecDialog(product)}
                      >
                        Ficha Técnica
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Novo Produto</DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Controller
              name="name"
              control={control}
              defaultValue=""
              render={({ field }) => <TextField {...field} label="Nome" fullWidth margin="normal" />}
            />
            <Controller
              name="description"
              control={control}
              defaultValue=""
              render={({ field }) => <TextField {...field} label="Descrição" fullWidth margin="normal" />}
            />
            <Controller
              name="price"
              control={control}
              defaultValue=""
              render={({ field }) => <TextField {...field} label="Preço" fullWidth margin="normal" type="number" />}
            />
            <Controller
              name="sku"
              control={control}
              defaultValue=""
              render={({ field }) => <TextField {...field} label="SKU" fullWidth margin="normal" />}
            />
            <Controller
              name="category"
              control={control}
              defaultValue=""
              render={({ field }) => <TextField {...field} label="Categoria" fullWidth margin="normal" />}
            />
            <DialogActions>
              <Button onClick={handleClose}>Cancelar</Button>
              <Button type="submit" variant="contained">
                Criar
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>

      {/* Technical Specification Dialog */}
      <Dialog open={openTechSpecDialog} onClose={handleCloseTechSpecDialog} maxWidth="md" fullWidth>
        <DialogTitle>Ficha Técnica: {selectedProductForTechSpec?.name}</DialogTitle>
        <DialogContent>
          <TechnicalSpecificationManager 
            productId={selectedProductForTechSpec?.id} 
            restaurantId={restaurantId} 
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTechSpecDialog}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Componente para gerenciar a ficha técnica
const TechnicalSpecificationManager = ({ productId, restaurantId }) => {
  const queryClient = useQueryClient();

  const { data: techSpec, isLoading: isLoadingTechSpec, isError: isErrorTechSpec } = useQuery(
    ['technicalSpecification', productId],
    () => axiosInstance.get(`/api/technical-specifications/${productId}`),
    {
      enabled: !!productId,
      select: (data) => data.data, // Access the actual data from the axios response
      onError: (error) => {
        if (error.response && error.response.status === 404) {
          // No technical specification found, which is fine for creation
          return;
        }
        toast.error(`Erro ao carregar ficha técnica: ${error.response?.data?.msg || error.message}`);
      }
    }
  );

  const { data: ingredients, isLoading: isLoadingIngredients, isError: isErrorIngredients } = useQuery(
    'ingredients',
    () => axiosInstance.get('/api/ingredients').then(res => res.data),
    {
      enabled: !!restaurantId,
      onError: (error) => {
        toast.error(`Erro ao carregar ingredientes: ${error.response?.data?.msg || error.message}`);
      }
    }
  );

  const [recipeIngredientsForm, setRecipeIngredientsForm] = useState([]);

  // Populate form when techSpec or ingredients load
  React.useEffect(() => {
    if (techSpec && ingredients) {
      const initialForm = techSpec.recipeIngredients.map(ri => ({
        ingredient_id: ri.ingredient_id,
        quantity: ri.quantity,
        name: ri.ingredient.name, // For display
        unit_of_measure: ri.ingredient.unit_of_measure, // For display
      }));
      setRecipeIngredientsForm(initialForm);
    } else if (!techSpec && ingredients) {
      setRecipeIngredientsForm([]); // No existing tech spec, start fresh
    }
  }, [techSpec, ingredients]);

  const handleAddIngredient = () => {
    setRecipeIngredientsForm([...recipeIngredientsForm, { ingredient_id: '', quantity: '' }]);
  };

  const handleRemoveIngredient = (index) => {
    const newForm = [...recipeIngredientsForm];
    newForm.splice(index, 1);
    setRecipeIngredientsForm(newForm);
  };

  const handleIngredientChange = (index, field, value) => {
    const newForm = [...recipeIngredientsForm];
    newForm[index][field] = value;
    setRecipeIngredientsForm(newForm);
  };

  const saveTechSpecMutation = useMutation(
    (data) => {
      if (techSpec) {
        return axiosInstance.put(`/api/technical-specifications/${productId}`, data);
      } else {
        return axiosInstance.post('/api/technical-specifications', { ...data, product_id: productId });
      }
    },
    {
      onSuccess: () => {
        toast.success('Ficha técnica salva com sucesso!');
        queryClient.invalidateQueries(['technicalSpecification', productId]);
        queryClient.invalidateQueries('products'); // Invalidate products to reflect changes
      },
      onError: (error) => {
        toast.error(`Erro ao salvar ficha técnica: ${error.response?.data?.msg || error.message}`);
      }
    }
  );

  const handleSubmitTechSpec = () => {
    const ingredientsToSave = recipeIngredientsForm.map(ri => ({
      ingredient_id: ri.ingredient_id,
      quantity: parseFloat(ri.quantity),
    }));
    saveTechSpecMutation.mutate({ recipe_ingredients: ingredientsToSave });
  };

  if (isLoadingTechSpec || isLoadingIngredients) {
    return <CircularProgress />;
  }

  if (isErrorTechSpec && !techSpec) {
    return <Alert severity="error">Erro ao carregar ficha técnica.</Alert>;
  }

  if (isErrorIngredients) {
    return <Alert severity="error">Erro ao carregar ingredientes.</Alert>;
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Ingredientes da Receita</Typography>
      {recipeIngredientsForm.map((ri, index) => (
        <Box key={index} display="flex" alignItems="center" mb={2}>
          <FormControl variant="outlined" sx={{ mr: 2, flexGrow: 1 }}>
            <InputLabel>Ingrediente</InputLabel>
            <Select
              value={ri.ingredient_id}
              onChange={(e) => handleIngredientChange(index, 'ingredient_id', e.target.value)}
              label="Ingrediente"
            >
              {ingredients?.map((ingredient) => (
                <MenuItem key={ingredient.id} value={ingredient.id}>
                  {ingredient.name} ({ingredient.unit_of_measure})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Quantidade"
            type="number"
            value={ri.quantity}
            onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)}
            sx={{ width: 120, mr: 2 }}
            inputProps={{ step: "0.0001" }}
          />
          <IconButton color="error" onClick={() => handleRemoveIngredient(index)}>
            <DeleteIcon />
          </IconButton>
        </Box>
      ))}
      <Button startIcon={<AddIcon />} onClick={handleAddIngredient} sx={{ mb: 2 }}>
        Adicionar Ingrediente
      </Button>
      <Button variant="contained" onClick={handleSubmitTechSpec} disabled={saveTechSpecMutation.isLoading}>
        {saveTechSpecMutation.isLoading ? <CircularProgress size={24} /> : 'Salvar Ficha Técnica'}
      </Button>
    </Box>
  );
};

export default Products;