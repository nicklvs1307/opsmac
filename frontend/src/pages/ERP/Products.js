import React, { useState } from 'react';
import { Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useForm, Controller } from 'react-hook-form';
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '../../contexts/AuthContext';

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
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Alert severity="error">Erro ao carregar produtos.</Alert>
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.description}</TableCell>
                    <TableCell>{product.price}</TableCell>
                    <TableCell>{product.sku}</TableCell>
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
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleSubmit(onSubmit)} variant="contained">
            Criar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Products;