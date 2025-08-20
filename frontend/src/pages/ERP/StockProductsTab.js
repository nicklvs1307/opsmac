import React from 'react';
import { useQuery } from 'react-query';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Alert } from '@mui/material';
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '../../contexts/AuthContext';

const fetchAllStocks = async (restaurantId) => {
  const { data } = await axiosInstance.get(`/api/stock?restaurant_id=${restaurantId}`);
  return data;
};

const StockProductsTab = () => {
  const { user } = useAuth();
  const restaurantId = user?.restaurants?.[0]?.id;

  const { data: stocks, isLoading, isError } = useQuery(
    ['allStocks', restaurantId],
    () => fetchAllStocks(restaurantId),
    { enabled: !!restaurantId }
  );

  if (isLoading) return <CircularProgress />;
  if (isError) return <Alert severity="error">Erro ao carregar produtos em estoque.</Alert>;

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Todos os Produtos em Estoque</Typography>

      <Paper sx={{ mb: 3 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Produto</TableCell>
                <TableCell>SKU</TableCell>
                <TableCell>Estoque Atual</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stocks && stocks.length > 0 ? (
                stocks.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.sku}</TableCell>
                    <TableCell>{product.quantity}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    <Typography>Nenhum produto encontrado com informações de estoque.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default StockProductsTab;