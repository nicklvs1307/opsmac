import React, { useState } from 'react';
import { Box, Typography, Button, TextField, MenuItem, Select, FormControl, InputLabel, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, CircularProgress, Alert } from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axiosInstance from '../../api/axiosInstance';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

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
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const restaurantId = user?.restaurants?.[0]?.id; // Assuming user is associated with one restaurant

  const { data: ingredients, isLoading, isError } = useQuery('ingredients', fetchIngredients, {
    enabled: !!restaurantId, // Only fetch if restaurantId is available
    onError: (error) => {
      console.error('Erro ao carregar ingredientes:', error);
      toast.error(`Erro ao carregar ingredientes: ${error.response?.data?.msg || error.message}`);
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
      toast.success('Ingrediente criado com sucesso!');
      queryClient.invalidateQueries('ingredients');
      handleCloseDialog();
    },
    onError: (error) => {
      console.error('Erro ao criar ingrediente:', error);
      toast.error(`Erro ao criar ingrediente: ${error.response?.data?.msg || error.message}`);
    }
  });

  const updateMutation = useMutation(updateIngredient, {
    onSuccess: () => {
      toast.success('Ingrediente atualizado com sucesso!');
      queryClient.invalidateQueries('ingredients');
      handleCloseDialog();
    },
    onError: (error) => {
      console.error('Erro ao atualizar ingrediente:', error);
      toast.error(`Erro ao atualizar ingrediente: ${error.response?.data?.msg || error.message}`);
    }
  });

  const deleteMutation = useMutation(deleteIngredient, {
    onSuccess: () => {
      toast.success('Ingrediente deletado com sucesso!');
      queryClient.invalidateQueries('ingredients');
    },
    onError: (error) => {
      console.error('Erro ao deletar ingrediente:', error);
      toast.error(`Erro ao deletar ingrediente: ${error.response?.data?.msg || error.message}`);
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
        <Alert severity="error">Erro ao carregar ingredientes. Verifique sua conexão ou tente novamente.</Alert>
      </Box>
    );
  }

  if (!restaurantId) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Alert severity="warning">Nenhum restaurante associado ao usuário. Não é possível gerenciar ingredientes.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Gerenciar Ingredientes</Typography>
      <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
        Adicionar Ingrediente
      </Button>

      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Unidade de Medida</TableCell>
              <TableCell>Custo por Unidade</TableCell>
              <TableCell align="right">Ações</TableCell>
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
        <DialogTitle>{currentIngredient ? 'Editar Ingrediente' : 'Adicionar Ingrediente'}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Preencha os detalhes do ingrediente.
          </DialogContentText>
          <form onSubmit={handleSubmit}>
            <TextField
              autoFocus
              margin="dense"
              name="name"
              label="Nome do Ingrediente"
              type="text"
              fullWidth
              variant="outlined"
              value={formValues.name}
              onChange={handleChange}
              required
            />
            <FormControl fullWidth margin="dense" variant="outlined" required>
              <InputLabel>Unidade de Medida</InputLabel>
              <Select
                name="unit_of_measure"
                value={formValues.unit_of_measure}
                onChange={handleChange}
                label="Unidade de Medida"
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
              label="Custo por Unidade"
              type="number"
              fullWidth
              variant="outlined"
              value={formValues.cost_per_unit}
              onChange={handleChange}
              inputProps={{ step: "0.0001" }}
              required
            />
            <DialogActions>
              <Button onClick={handleCloseDialog}>Cancelar</Button>
              <Button type="submit" variant="contained" color="primary">
                {currentIngredient ? 'Salvar Alterações' : 'Adicionar'}
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Ingredients;
