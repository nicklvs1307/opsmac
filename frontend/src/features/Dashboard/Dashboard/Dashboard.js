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
  Avatar,
  useTheme,
  alpha,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Feedback as FeedbackIcon,
  Star as StarIcon,
  LocalOffer as CouponIcon,
  SentimentSatisfied as SmileyIcon,
  Cake as CakeIcon,
  ThumbUp as ThumbUpIcon,
  ThumbsUpDown as ThumbsUpDownIcon,
  ThumbDown as ThumbDownIcon,
  QuestionAnswer as QuestionAnswerIcon,
  PersonAdd as PersonAddIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
// Importando o componente MetricCard reutilizável
import MetricCard from '@/components/UI/MetricCard';
import CustomerCard from '@/components/UI/CustomerCard';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useAuth } from '@/app/providers/contexts/AuthContext'; // Adjust path as needed
import { useTranslation } from 'react-i18next';
import { useDashboardOverview } from '../api/dashboardQueries'; // Import the react-query hook

const Dashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const theme = useTheme();

  const [period, setPeriod] = useState('30d'); // Keep period state

  const restaurantId = user?.restaurants?.[0]?.id;

  const {
    data: dashboardData,
    isLoading,
    isError,
    error,
  } = useDashboardOverview(restaurantId, period);

  const RATING_COLORS = {
    5: '#4FC3F7',
    4: '#5C6BC0',
    3: '#42A5F5',
    2: '#EC407A',
    1: '#AB47BC',
  };

  const formattedRatingDistribution =
    dashboardData?.ratings_distribution?.map((item) => ({
      name: `${item.rating} estrelas`,
      value: Number(item.count),
      color: RATING_COLORS[item.rating] || '#CCCCCC', // Fallback color
    })) || [];

  const data = {
    overview: dashboardData?.overview || {},
    trends: dashboardData?.nps_trend_data || [],
    ratingDistribution: formattedRatingDistribution,
    feedbackTypes: dashboardData?.feedback_types || [],
    top_customers: dashboardData?.top_customers || [],
    period_comparison: dashboardData?.period_comparison || {},
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (isError) {
    console.error('Error fetching dashboard data:', error);
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error?.message || t('dashboard.error_loading_data')}
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header */}
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
          {t('dashboard.overview_title')}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: '#7f8c8d',
            mb: 3,
          }}
        >
          {t('dashboard.welcome_message')}
        </Typography>
      </Box>

      {/* Metrics Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Promotores"
            value={data.overview?.promoters || 0}
            icon={<ThumbUpIcon />}
            bgColor="linear-gradient(135deg, #a8e063 0%, #56ab2f 100%)"
            iconColor="rgba(255,255,255,0.2)"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Neutros"
            value={data.overview?.neutrals || 0}
            icon={<ThumbsUpDownIcon />}
            bgColor="linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)"
            iconColor="rgba(255,255,255,0.2)"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Detratores"
            value={data.overview?.detractors || 0}
            icon={<ThumbDownIcon />}
            bgColor="linear-gradient(135deg, #ff8177 0%, #ff867a 100%)"
            iconColor="rgba(255,255,255,0.2)"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Respostas"
            value={data.overview?.total_answers || 0}
            icon={<QuestionAnswerIcon />}
            bgColor="linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)"
            iconColor="rgba(255,255,255,0.2)"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Cadastros"
            value={data.overview?.total_customers || 0}
            icon={<PersonAddIcon />}
            bgColor="linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)"
            iconColor="rgba(255,255,255,0.2)"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Cupons Gerados"
            value={data.overview?.coupons_generated || 0}
            icon={<CouponIcon />}
            bgColor="linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
            iconColor="rgba(255,255,255,0.2)"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Cupons Utilizados"
            value={data.overview?.coupons_used || 0}
            icon={<CheckCircleIcon />}
            bgColor="linear-gradient(135deg, #69ff97 0%, #00e4ff 100%)"
            iconColor="rgba(255,255,255,0.2)"
          />
        </Grid>
      </Grid>

      {/* Top Customers */}
      <Grid container spacing={3} mt={2}>
        <Grid item xs={12}>
          <Paper
            sx={{
              p: 2.5,
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
              background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
              border: '1px solid rgba(0, 0, 0, 0.05)',
            }}
          >
            <Box display="flex" alignItems="center" mb={2}>
              <Avatar
                sx={{
                  bgcolor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  width: 32,
                  height: 32,
                  mr: 1.5,
                  fontSize: '1rem',
                }}
              >
                👥
              </Avatar>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: '#2c3e50',
                  fontSize: '1.25rem',
                }}
              >
                Top Clientes
              </Typography>
            </Box>
            {data.top_customers && data.top_customers.length > 0 ? (
              <Grid container spacing={2}>
                {data.top_customers.slice(0, 3).map((customer, index) => (
                  <Grid item xs={12} sm={6} md={4} key={customer.id}>
                    <CustomerCard customer={customer} index={index} />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box
                sx={{
                  textAlign: 'center',
                  py: 4,
                  bgcolor: 'rgba(0, 0, 0, 0.02)',
                  borderRadius: 2,
                  border: '2px dashed rgba(0, 0, 0, 0.1)',
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: 'rgba(0, 0, 0, 0.1)',
                    width: 48,
                    height: 48,
                    mx: 'auto',
                    mb: 1.5,
                  }}
                >
                  👥
                </Avatar>
                <Typography
                  variant="subtitle1"
                  sx={{
                    color: '#6c757d',
                    mb: 0.5,
                    fontWeight: 500,
                  }}
                >
                  Nenhum cliente encontrado
                </Typography>
                <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                  Os clientes aparecerão aqui conforme os feedbacks forem recebidos.
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} mt={3}>
        {/* NPS Trend Chart */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
              border: '1px solid rgba(0, 0, 0, 0.05)',
              height: '100%',
            }}
          >
            <Box display="flex" alignItems="center" mb={3}>
              <Avatar
                sx={{
                  bgcolor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  width: 32,
                  height: 32,
                  mr: 1.5,
                }}
              >
                📈
              </Avatar>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: '#2c3e50',
                  fontSize: '1.25rem',
                }}
              >
                Desempenho do NPS
              </Typography>
            </Box>
            {data.trends && data.trends.length > 0 ? (
              <Box
                sx={{
                  bgcolor: 'rgba(102, 126, 234, 0.05)',
                  borderRadius: 2,
                  p: 2,
                }}
              >
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart
                    data={data.trends}
                    margin={{
                      top: 10,
                      right: 30,
                      left: 20,
                      bottom: 10,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(102, 126, 234, 0.1)" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12, fill: '#6c757d' }}
                      axisLine={{ stroke: 'rgba(102, 126, 234, 0.2)' }}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: '#6c757d' }}
                      axisLine={{ stroke: 'rgba(102, 126, 234, 0.2)' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid rgba(102, 126, 234, 0.2)',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="nps"
                      stroke="#667eea"
                      strokeWidth={3}
                      dot={{ fill: '#667eea', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#667eea', strokeWidth: 2, fill: 'white' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            ) : (
              <Box
                sx={{
                  textAlign: 'center',
                  py: 4,
                  bgcolor: 'rgba(0, 0, 0, 0.02)',
                  borderRadius: 2,
                  border: '2px dashed rgba(0, 0, 0, 0.1)',
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Dados de tendência NPS não disponíveis.
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Rating Distribution Chart */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
              border: '1px solid rgba(0, 0, 0, 0.05)',
              height: '100%',
            }}
          >
            <Box display="flex" alignItems="center" mb={3}>
              <Avatar
                sx={{
                  bgcolor: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  width: 32,
                  height: 32,
                  mr: 1.5,
                }}
              >
                🎯
              </Avatar>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: '#2c3e50',
                  fontSize: '1.25rem',
                }}
              >
                Distribuição de Avaliações
              </Typography>
            </Box>
            {data.ratingDistribution && data.ratingDistribution.length > 0 ? (
              <Box
                sx={{
                  bgcolor: 'rgba(240, 147, 251, 0.05)',
                  borderRadius: 2,
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={data.ratingDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                    >
                      {data.ratingDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid rgba(240, 147, 251, 0.2)',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <Box mt={2}>
                  <Grid container spacing={1} justifyContent="center">
                    {data.ratingDistribution.map((entry, index) => (
                      <Grid item key={index}>
                        <Box display="flex" alignItems="center" mr={2}>
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              bgcolor: entry.color,
                              borderRadius: '50%',
                              mr: 0.5,
                            }}
                          />
                          <Typography
                            variant="body2"
                            sx={{ fontSize: '0.75rem', color: '#6c757d' }}
                          >
                            {entry.name}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Box>
            ) : (
              <Box
                sx={{
                  textAlign: 'center',
                  py: 4,
                  bgcolor: 'rgba(0, 0, 0, 0.02)',
                  borderRadius: 2,
                  border: '2px dashed rgba(0, 0, 0, 0.1)',
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Dados de distribuição de avaliações não disponíveis.
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
