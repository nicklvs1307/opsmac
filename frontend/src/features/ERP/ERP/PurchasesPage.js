import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useForm, Controller } from 'react-hook-form';
import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
} from '@mui/material';
import axiosInstance from '@/shared/lib/axiosInstance';
import { useAuth } from '@/app/providers/contexts/AuthContext';
import toast from 'react-hot-toast';

// Fetch products for selection
const fetchProducts = async (restaurantId) => {
  const { data } = await axiosInstance.get(`/api/products?restaurant_id=${restaurantId}`);
  return data;
};

// Fetch suppliers for selection
const fetchSuppliers = async (restaurantId) => {
  const { data } = await axiosInstance.get(`/api/suppliers?restaurant_id=${restaurantId}`);
  return data;
};

// Create a purchase (which will be a stock movement of type 'in')
const createPurchase = (purchaseData) => {
  return axiosInstance.post('/api/stock/move', purchaseData);
};

const PurchasesPage = () => {
  const { user } = useAuth();
  const restaurantId = user?.restaurants?.[0]?.id;
  const queryClient = useQueryClient();

  const {
    data: products,
    isLoading: isLoadingProducts,
    isError: isErrorProducts,
  } = useQuery(['products', restaurantId], () => fetchProducts(restaurantId), {
    enabled: !!restaurantId,
  });

  const {
    data: suppliers,
    isLoading: isLoadingSuppliers,
    isError: isErrorSuppliers,
  } = useQuery(['suppliers', restaurantId], () => fetchSuppliers(restaurantId), {
    enabled: !!restaurantId,
  });

  const { control, handleSubmit, reset } = useForm();

  const purchaseMutation = useMutation(createPurchase, {
    onSuccess: () => {
      queryClient.invalidateQueries('stocks'); // Invalidate stocks to reflect new purchase
      toast.success('Compra registrada com sucesso!');
      reset();
    },
    onError: (error) => {
      toast.error(`Erro ao registrar compra: ${error.response?.data?.msg || error.message}`);
    },
  });

  const onSubmit = (data) => {
    // Map purchase data to stock movement data
    const movementData = {
      product_id: data.product_id,
      type: 'in', // Purchases are always 'in' movements
      quantity: data.quantity,
      description: `Compra do fornecedor: ${data.supplier_name || 'N/A'}. Observações: ${data.notes || ''}`,
      // You might want to store supplier_id directly in stock_movements if needed for more detailed tracking
    };
    purchaseMutation.mutate(movementData);
  };

  if (isLoadingProducts || isLoadingSuppliers) return <CircularProgress />;
  if (isErrorProducts || isErrorSuppliers)
    return <Alert severity="error">Erro ao carregar dados para o formulário de compras.</Alert>;

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Registrar Nova Compra
      </Typography>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormControl fullWidth margin="normal">
            <InputLabel id="product-select-label">Produto</InputLabel>
            <Controller
              name="product_id"
              control={control}
              defaultValue=""
              rules={{ required: 'Produto é obrigatório' }}
              render={({ field }) => (
                <Select
                  labelId="product-select-label"
                  id="product-select"
                  label="Produto"
                  {...field}
                >
                  {products.map((product) => (
                    <MenuItem key={product.id} value={product.id}>
                      {product.name}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
          </FormControl>

          <Controller
            name="quantity"
            control={control}
            defaultValue=""
            rules={{
              required: 'Quantidade é obrigatória',
              min: { value: 1, message: 'Quantidade deve ser maior que 0' },
            }}
            render={({ field }) => (
              <TextField {...field} label="Quantidade" type="number" fullWidth margin="normal" />
            )}
          />

          <FormControl fullWidth margin="normal">
            <InputLabel id="supplier-select-label">Fornecedor</InputLabel>
            <Controller
              name="supplier_name"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <Select
                  labelId="supplier-select-label"
                  id="supplier-select"
                  label="Fornecedor"
                  {...field}
                >
                  {suppliers.map((supplier) => (
                    <MenuItem key={supplier.id} value={supplier.name}>
                      {supplier.name}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
          </FormControl>

          <Controller
            name="notes"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <TextField
                {...field}
                label="Observações"
                multiline
                rows={3}
                fullWidth
                margin="normal"
              />
            )}
          />

          <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
            Registrar Compra
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default PurchasesPage;
