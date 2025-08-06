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
  ListItemIcon,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
} from '@mui/material';
import {
  AccessTime as TimeIcon,
  People as PeopleIcon,
  BarChart as BarChartIcon,
  Stars as StarsIcon,
} from '@mui/icons-material';
import { CheckCircleOutline as CheckinIcon, ExitToApp as ExitToAppIcon } from '@mui/icons-material';
import { useAuth } from '../../../contexts/AuthContext';
import axiosInstance from '../../../api/axiosInstance';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import CheckinProgram from './CheckinProgram';
import { useForm, useFieldArray } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const CheckinDashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const restaurantId = user?.restaurants?.[0]?.id;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [checkinData, setCheckinData] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [rewards, setRewards] = useState([]);
  const [checkinQRCode, setCheckinQRCode] = useState(null);
  const [activeCheckins, setActiveCheckins] = useState([]); // Novo estado para check-ins ativos

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      checkin_cycle_length: 10,
      checkin_cycle_name: '',
      enable_ranking: false,
      enable_level_progression: false,
      rewards_per_visit: [],
      checkin_time_restriction: 'unlimited',
      identification_method: 'phone',
      points_per_checkin: 1,
      checkin_limit_per_cycle: 1,
      allow_multiple_cycles: true,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'rewards_per_visit',
  });

  const fetchCheckinData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      if (!restaurantId) {
        setError('Nenhum restaurante encontrado. Por favor, verifique suas configurações.');
        setLoading(false);
        return;
      }

      const response = await axiosInstance.get(`/api/checkin/analytics/${restaurantId}`);
      setCheckinData(response.data);
    } catch (err) {
      console.error('Erro ao buscar dados de check-in (frontend):', err);
      setError('Erro ao carregar dados de check-in');
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  const fetchRewards = useCallback(async () => {
    if (!restaurantId) return;
    try {
      const response = await axiosInstance.get(`/api/rewards/restaurant/${restaurantId}`);
      setRewards(response.data.rewards);
    } catch (err) {
      console.error('Erro ao buscar recompensas:', err);
      toast.error(t('relationship.error_fetching_rewards'));
    }
  }, [restaurantId, t]);

  const fetchCheckinProgramSettings = useCallback(async () => {
    if (!restaurantId) return;
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/api/settings/${restaurantId}`);
      const checkinProgramSettings = response.data.settings?.checkin_program_settings || {};
      reset(checkinProgramSettings);
    } catch (err) {
      console.error('Erro ao buscar configurações do programa de check-in:', err);
      toast.error(t('Erro ao carregar configurações do programa de fidelidade'));
    } finally {
      setLoading(false);
    }
  }, [restaurantId, reset, t]);

  const fetchCheckinQRCode = useCallback(async () => {
    if (!restaurantId) return;
    try {
      const restaurantSlug = user?.restaurants?.[0]?.slug;
      if (restaurantSlug) {
        const checkinUrl = `${window.location.origin}/checkin/public/${restaurantSlug}`;
        setCheckinQRCode({ url: checkinUrl });
      } else {
        setCheckinQRCode(null);
        console.warn('Slug do restaurante não encontrado, não foi possível gerar o QR Code de check-in.');
      }
    } catch (err) {
      console.error('Erro ao gerar QR Code de check-in:', err);
    }
  }, [restaurantId, user]);

  const fetchActiveCheckins = useCallback(async () => {
    if (!restaurantId) return;
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/api/checkin/active/${restaurantId}`);
      setActiveCheckins(response.data.activeCheckins);
    } catch (err) {
      console.error('Erro ao buscar check-ins ativos:', err);
      setError('Erro ao carregar check-ins ativos');
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  const onSaveCheckinProgram = async (data) => {
    try {
      setLoading(true);
      await axiosInstance.put(`/api/settings/${restaurantId}`, {
        settings: {
          checkin_program_settings: data,
        },
      });
      toast.success(t('relationship.checkin_program_saved_successfully'));
      fetchCheckinQRCode(); // Atualiza o QR Code após salvar
    } catch (err) {
      console.error('Erro ao salvar programa de check-in:', err);
      toast.error(err.response?.data?.message || t('relationship.error_saving_checkin_program'));
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async (checkinId) => {
    try {
      setLoading(true);
      await axiosInstance.put(`/api/checkin/checkout/${checkinId}`);
      toast.success('Check-out realizado com sucesso!');
      fetchActiveCheckins(); // Atualiza a lista após o checkout
    } catch (err) {
      console.error('Erro ao realizar check-out:', err);
      toast.error(err.response?.data?.message || 'Erro ao realizar check-out');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tabValue === 0) {
      fetchCheckinData();
    } else if (tabValue === 1) {
      fetchRewards();
      fetchCheckinProgramSettings();
      fetchCheckinQRCode();
    } else if (tabValue === 2) {
      fetchActiveCheckins();
    }
  }, [tabValue, fetchCheckinData, fetchRewards, fetchCheckinProgramSettings, fetchCheckinQRCode, fetchActiveCheckins]);

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

  const renderAnalytics = () => (
    <>
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
    </>
  );

  const renderActiveCheckins = () => (
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
        Check-ins Ativos
      </Typography>
      {activeCheckins.length > 0 ? (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Cliente</TableCell>
                <TableCell>Telefone</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Hora do Check-in</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {activeCheckins.map((checkin) => (
                <TableRow key={checkin.id}>
                  <TableCell>{checkin.customer?.name || 'N/A'}</TableCell>
                  <TableCell>{checkin.customer?.phone || 'N/A'}</TableCell>
                  <TableCell>{checkin.customer?.email || 'N/A'}</TableCell>
                  <TableCell>{new Date(checkin.checkin_time).toLocaleString()}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="secondary"
                      size="small"
                      startIcon={<ExitToAppIcon />}
                      onClick={() => handleCheckout(checkin.id)}
                    >
                      Checkout
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography variant="body2" color="text.secondary">
          Nenhum check-in ativo encontrado.
        </Typography>
      )}
    </Paper>
  );

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

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Análise de Check-ins" icon={<BarChartIcon />} />
          <Tab label="Configurações Checkin" icon={<StarsIcon />} />
          <Tab label="Check-ins Ativos" icon={<CheckinIcon />} />
        </Tabs>
      </Paper>

      {tabValue === 0 && renderAnalytics()}
      {tabValue === 1 && (
        <CheckinProgram
          control={control}
          errors={errors}
          fields={fields}
          append={append}
          remove={remove}
          rewards={rewards}
          loading={loading}
          onSave={handleSubmit(onSaveCheckinProgram)}
          t={t}
          checkinQRCode={checkinQRCode}
        />
      )}
      {tabValue === 2 && renderActiveCheckins()}
    </Box>
  );
};

export default CheckinDashboard;
