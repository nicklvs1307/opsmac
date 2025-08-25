import React, { useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
  Divider,
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axiosInstance from '@/shared/lib/axiosInstance';
import toast from 'react-hot-toast';
import {
  Refresh as RefreshIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  CancelOutlined as CancelOutlinedIcon,
} from '@mui/icons-material';

const fetchOrders = async () => {
  const { data } = await axiosInstance.get('/api/orders');
  return data;
};

const updateOrderStatus = async ({ orderId, status }) => {
  const { data } = await axiosInstance.put(`/api/orders/${orderId}/status`, { status });
  return data;
};

const Orders = () => {
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState('');

  const {
    data: orders,
    isLoading,
    isError,
  } = useQuery(['orders', filterStatus], () => fetchOrders(filterStatus), {
    refetchInterval: 10000, // Poll every 10 seconds for new orders
    onError: (error) => {
      console.error('Erro ao carregar pedidos:', error);
      toast.error(`Erro ao carregar pedidos: ${error.response?.data?.msg || error.message}`);
    },
  });

  const updateStatusMutation = useMutation(updateOrderStatus, {
    onSuccess: () => {
      toast.success('Status do pedido atualizado!');
      queryClient.invalidateQueries('orders'); // Invalidate and refetch orders
    },
    onError: (error) => {
      console.error('Erro ao atualizar status:', error);
      toast.error(`Erro ao atualizar status: ${error.response?.data?.msg || error.message}`);
    },
  });

  const handleStatusChange = (orderId, newStatus) => {
    updateStatusMutation.mutate({ orderId, status: newStatus });
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
        <Alert severity="error">Erro ao carregar os pedidos. Tente novamente mais tarde.</Alert>
      </Box>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'orange';
      case 'accepted':
        return 'blue';
      case 'preparing':
        return 'purple';
      case 'on_the_way':
        return 'teal';
      case 'delivered':
        return 'green';
      case 'concluded':
        return 'green';
      case 'cancelled':
        return 'red';
      case 'rejected':
        return 'red';
      default:
        return 'gray';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Gerenciamento de Pedidos
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel>Filtrar por Status</InputLabel>
          <Select
            value={filterStatus}
            label="Filtrar por Status"
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="pending">Pendente</MenuItem>
            <MenuItem value="accepted">Aceito</MenuItem>
            <MenuItem value="preparing">Em Preparo</MenuItem>
            <MenuItem value="on_the_way">A Caminho</MenuItem>
            <MenuItem value="delivered">Entregue</MenuItem>
            <MenuItem value="concluded">Concluído</MenuItem>
            <MenuItem value="cancelled">Cancelado</MenuItem>
            <MenuItem value="rejected">Rejeitado</MenuItem>
          </Select>
        </FormControl>
        <IconButton onClick={() => queryClient.invalidateQueries('orders')}>
          <RefreshIcon />
        </IconButton>
      </Box>

      {orders.length === 0 ? (
        <Typography variant="h6" align="center" sx={{ mt: 5 }}>
          Nenhum pedido encontrado.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {orders.map((order) => (
            <Grid item xs={12} md={6} lg={4} key={order.id}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Pedido #{order.external_order_id || order.id.substring(0, 8)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Cliente: {order.customer_details.name} ({order.customer_details.phone})
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tipo: {order.delivery_type} | Plataforma: {order.platform}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Data: {new Date(order.order_date).toLocaleString()}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ mt: 1, fontWeight: 'bold', color: getStatusColor(order.status) }}
                  >
                    Status: {order.status.replace(/_/g, ' ').toUpperCase()}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle1" gutterBottom>
                    Itens:
                  </Typography>
                  {order.items.map((item, index) => (
                    <Typography key={index} variant="body2">
                      - {item.quantity}x {item.name} (R$ {Number(item.price).toFixed(2)})
                    </Typography>
                  ))}
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" align="right">
                    Total: R$ {Number(order.total_amount).toFixed(2)}
                  </Typography>

                  <Box sx={{ mt: 2 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Atualizar Status</InputLabel>
                      <Select
                        value={order.status}
                        label="Atualizar Status"
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      >
                        <MenuItem value="pending">Pendente</MenuItem>
                        <MenuItem value="accepted">Aceito</MenuItem>
                        <MenuItem value="preparing">Em Preparo</MenuItem>
                        <MenuItem value="on_the_way">A Caminho</MenuItem>
                        <MenuItem value="delivered">Entregue</MenuItem>
                        <MenuItem value="concluded">Concluído</MenuItem>
                        <MenuItem value="cancelled">Cancelado</MenuItem>
                        <MenuItem value="rejected">Rejeitado</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default Orders;
