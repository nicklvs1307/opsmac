import React, { useState } from 'react';
import { Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useForm, Controller } from 'react-hook-form';
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '../../contexts/AuthContext';

const fetchStocks = async (restaurantId) => {
  const { data } = await axiosInstance.get('/api/stock');
  return data;
};

const createStockMovement = (movement) => {
  return axiosInstance.post('/api/stock/move', movement);
};

const fetchStockHistory = async (productId) => {
  const { data } = await axiosInstance.get(`/api/stock/history/${productId}`);
  return data;
};

const Stock = () => {
  const { user } = useAuth();
  const restaurantId = user?.restaurants?.[0]?.id;
  const queryClient = useQueryClient();

  const [openMovementDialog, setOpenMovementDialog] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [openHistoryDialog, setOpenHistoryDialog] = useState(false);

  const { data: stocks, isLoading: isLoadingStocks, isError: isErrorStocks } = useQuery('stocks', () => fetchStocks(restaurantId), {
    enabled: !!restaurantId,
  });

  const { data: products, isLoading: isLoadingProducts } = useQuery('products', () => axiosInstance.get('/api/products').then(res => res.data), {
    enabled: !!restaurantId,
  });

  const { data: stockHistory, isLoading: isLoadingHistory, isError: isErrorHistory } = useQuery(
    ['stockHistory', selectedProductId],
    () => fetchStockHistory(selectedProductId),
    {
      enabled: !!selectedProductId && openHistoryDialog,
    }
  );

  const { control, handleSubmit, reset } = useForm();

  const movementMutation = useMutation(createStockMovement, {
    onSuccess: () => {
      queryClient.invalidateQueries('stocks');
      queryClient.invalidateQueries(['stockHistory', selectedProductId]);
      setOpenMovementDialog(false);
      reset();
    },
  });

  const onMovementSubmit = (data) => {
    movementMutation.mutate(data);
  };

  const handleOpenMovementDialog = (productId) => {
    setSelectedProductId(productId);
    setOpenMovementDialog(true);
  };

  const handleCloseMovementDialog = () => {
    setOpenMovementDialog(false);
    setSelectedProductId(null);
    reset();
  };

  const handleOpenHistoryDialog = (productId) => {
    setSelectedProductId(productId);
    setOpenHistoryDialog(true);
  };

  const handleCloseHistoryDialog = () => {
    setOpenHistoryDialog(false);
    setSelectedProductId(null);
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Controle de Estoque
      </Typography>

      <Paper sx={{ mb: 3 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Produto</TableCell>
                <TableCell>SKU</TableCell>
                <TableCell>Estoque Atual</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoadingStocks || isLoadingProducts ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : isErrorStocks ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Alert severity="error">Erro ao carregar estoque.</Alert>
                  </TableCell>
                </TableRow>
              ) : (
                stocks.map((stock) => (
                  <TableRow key={stock.id}>
                    <TableCell>{stock.product?.name}</TableCell>
                    <TableCell>{stock.product?.sku}</TableCell>
                    <TableCell>{stock.quantity}</TableCell>
                    <TableCell>
                      <Button size="small" onClick={() => handleOpenMovementDialog(stock.product_id)}>
                        Movimentar
                      </Button>
                      <Button size="small" onClick={() => handleOpenHistoryDialog(stock.product_id)} sx={{ ml: 1 }}>
                        Histórico
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Dialog for Stock Movement */}
      <Dialog open={openMovementDialog} onClose={handleCloseMovementDialog}>
        <DialogTitle>Movimentar Estoque</DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit(onMovementSubmit)}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Tipo de Movimento</InputLabel>
              <Controller
                name="type"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <Select {...field} label="Tipo de Movimento">
                    <MenuItem value="in">Entrada</MenuItem>
                    <MenuItem value="out">Saída</MenuItem>
                  </Select>
                )}
              />
            </FormControl>
            <Controller
              name="quantity"
              control={control}
              defaultValue=""
              render={({ field }) => <TextField {...field} label="Quantidade" fullWidth margin="normal" type="number" />} 
            />
            <Controller
              name="description"
              control={control}
              defaultValue=""
              render={({ field }) => <TextField {...field} label="Descrição" fullWidth margin="normal" multiline rows={2} />} 
            />
            <input type="hidden" {...control.register("product_id")} value={selectedProductId} />
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMovementDialog}>Cancelar</Button>
          <Button onClick={handleSubmit(onMovementSubmit)} variant="contained">
            Confirmar Movimento
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog for Stock History */}
      <Dialog open={openHistoryDialog} onClose={handleCloseHistoryDialog} maxWidth="md" fullWidth>
        <DialogTitle>Histórico de Movimentação de Estoque</DialogTitle>
        <DialogContent>
          {isLoadingHistory ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100px">
              <CircularProgress />
            </Box>
          ) : isErrorHistory ? (
            <Alert severity="error">Erro ao carregar histórico.</Alert>
          ) : stockHistory && stockHistory.length > 0 ? (
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Data</TableCell>
                    <TableCell>Tipo</TableCell>
                    <TableCell>Quantidade</TableCell>
                    <TableCell>Descrição</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stockHistory.map((movement) => (
                    <TableRow key={movement.id}>
                      <TableCell>{new Date(movement.movement_date).toLocaleString()}</TableCell>
                      <TableCell>{movement.type === 'in' ? 'Entrada' : 'Saída'}</TableCell>
                      <TableCell>{movement.quantity}</TableCell>
                      <TableCell>{movement.description || 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography>Nenhum histórico de movimentação encontrado para este produto.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseHistoryDialog}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Stock;