import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  CheckCircleOutline as CheckinIcon,
  AccessTime as TimeIcon,
  People as PeopleIcon,
  BarChart as BarChartIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import axiosInstance from '../../api/axiosInstance';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CheckinDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [checkinData, setCheckinData] = useState(null);

  const fetchCheckinData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const restaurantId = user?.restaurants?.[0]?.id;

      if (!restaurantId) {
        setError('Nenhum restaurante encontrado. Por favor, verifique suas configurações.');
        setLoading(false);
        return;
      }

      const response = await axiosInstance.get(`/api/checkin/analytics/${restaurantId}`);
      setCheckinData(response.data);
      console.log('Dados de Check-in recebidos no frontend:', response.data);
    } catch (err) {
      console.error('Erro ao buscar dados de check-in (frontend):', err);
      setError('Erro ao carregar dados de check-in');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCheckinData();
  }, [fetchCheckinData]);

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    let result = '';
    if (hours > 0) result += `${hours}h `;
    if (minutes > 0) result += `${minutes}m `;
    if (remainingSeconds > 0 || result === '') result += `${remainingSeconds}s`;
    return result.trim();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  const MetricCard = ({ title, value, icon, bgColor, iconColor }) => (
    <Card
      sx={{
        height: '100%',
        background: bgColor,
        color: 'white',
        position: 'relative',
        overflow: 'visible',
      }}
    >
      <CardContent sx={{ pb: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography
              variant="body2"
              sx={{
                color: 'rgba(255,255,255,0.8)',
                fontSize: '0.875rem',
                fontWeight: 500,
                mb: 1,
              }}
            >
              {title}
            </Typography>
            <Typography
              variant="h3"
              component="div"
              sx={{
                color: 'white',
                fontWeight: 'bold',
                fontSize: '2.5rem',
                lineHeight: 1,
              }}
            >
              {value}
            </Typography>
          </Box>
          <Box
            sx={{
              bgcolor: iconColor,
              width: 48,
              height: 48,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Box mb={4}>
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 'bold',
            color: '#2c3e50',
            mb: 1,
          }}
        >
          Dashboard de Check-ins
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: '#7f8c8d',
            mb: 3,
          }}
        >
          Visão geral e análises dos check-ins dos clientes
        </Typography>
      </Box>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={4}>
          <MetricCard
            title="Total de Check-ins"
            value={checkinData?.total_checkins || 0}
            icon={<CheckinIcon sx={{ color: 'white' }} />}
            bgColor="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            iconColor="rgba(255,255,255,0.2)"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <MetricCard
            title="Tempo Médio de Visita"
            value={formatDuration(checkinData?.average_visit_duration_seconds || 0)}
            icon={<TimeIcon sx={{ color: 'white' }} />}
            bgColor="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
            iconColor="rgba(255,255,255,0.2)"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3} mt={4}>
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 2,
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            }}
          >
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                fontWeight: 600,
                color: '#2c3e50',
                mb: 3
              }}
            >
              Check-ins por Dia (Últimos 30 Dias)
            </Typography>
            {checkinData?.checkins_by_day && checkinData.checkins_by_day.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={checkinData.checkins_by_day}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#8884d8" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Dados de check-ins por dia não disponíveis.
              </Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 2,
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            }}
          >
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                fontWeight: 600,
                color: '#2c3e50',
                mb: 3
              }}
            >
              Clientes Mais Frequentes
            </Typography>
            {checkinData?.most_frequent_customers && checkinData.most_frequent_customers.length > 0 ? (
              <List>
                {checkinData.most_frequent_customers.map((customer) => (
                  <ListItem key={customer.customer_id}>
                    <ListItemIcon>
                      <PeopleIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={customer.customer.name}
                      secondary={`Check-ins: ${customer.checkin_count}`}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Nenhum cliente frequente disponível.
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CheckinDashboard;