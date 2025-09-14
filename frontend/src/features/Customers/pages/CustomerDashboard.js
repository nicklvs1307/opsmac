import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { useCustomerDashboardMetrics } from '@/features/Customers/api/customerQueries';
import { useAuth } from '@/app/providers/contexts/AuthContext';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const restaurantId = user?.restaurants?.[0]?.id;
  const { data: metrics, isLoading, isError, error } = useCustomerDashboardMetrics(restaurantId);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return <Alert severity="error">Erro ao carregar métricas do cliente: {error.message}</Alert>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard de Clientes
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper elevation={1} sx={{ p: 2 }}>
            <Typography variant="subtitle1" color="text.secondary">
              Total de Clientes
            </Typography>
            <Typography variant="h4">{metrics.totalCustomers}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={1} sx={{ p: 2 }}>
            <Typography variant="subtitle1" color="text.secondary">
              Taxa de Engajamento
            </Typography>
            <Typography variant="h4">{(metrics.engagementRate * 100).toFixed(0)}%</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={1} sx={{ p: 2 }}>
            <Typography variant="subtitle1" color="text.secondary">
              Taxa de Fidelidade
            </Typography>
            <Typography variant="h4">{(metrics.loyaltyRate * 100).toFixed(0)}%</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={1} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Clientes com Mais Check-ins
            </Typography>
            {metrics.mostCheckins.length > 0 ? (
              <List>
                {metrics.mostCheckins.map((customer, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={`${customer.customer_name || 'Desconhecido'} (${customer.checkin_count} check-ins)`}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography>Nenhum check-in registrado ainda.</Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={1} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Clientes com Mais Feedbacks
            </Typography>
            {metrics.mostFeedbacks.length > 0 ? (
              <List>
                {metrics.mostFeedbacks.map((customer, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={`${customer.customer_name || 'Desconhecido'} (${customer.feedback_count} feedbacks)`}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography>Nenhum feedback registrado ainda.</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CustomerDashboard;
