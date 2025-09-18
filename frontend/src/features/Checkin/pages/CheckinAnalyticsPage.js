import React from 'react';
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
} from '@mui/material';
import {
  AccessTime as TimeIcon,
  People as PeopleIcon,
  CheckCircleOutline as CheckinIcon,
} from '@mui/icons-material';
import MetricCard from '@/shared/components/MetricCard'; // Importar o MetricCard genérico
import { useAuth } from '@/app/providers/contexts/AuthContext';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useTranslation } from 'react-i18next';
import usePermissions from '@/hooks/usePermissions';
// Updated import path for checkinQueries
import { useGetCheckinAnalytics } from '@/features/Checkin/api/checkinQueries';
import { formatDuration } from '../../../../utils/timeFormatters';
// Assuming FrequentCustomersList will be moved to the new components folder
import FrequentCustomersList from '../components/FrequentCustomersList';

const CheckinAnalyticsPage = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { can } = usePermissions();
  const restaurantId = user?.restaurants?.[0]?.id;

  const {
    data: checkinData,
    isLoading,
    isError,
    error,
  } = useGetCheckinAnalytics(restaurantId, { enabled: can('fidelity:checkin:dashboard', 'read') });

  // Verifica se o usuário tem a feature para acessar a página
  if (!can('fidelity:checkin:dashboard', 'read')) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="warning">
          {t('common.module_not_enabled', { moduleName: t('modules.checkin') })}
        </Alert>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (isError) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error.message}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
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
          {t('checkin_dashboard.main_title')}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: '#7f8c8d',
            mb: 3,
          }}
        >
          {t('checkin_dashboard.main_description')}
        </Typography>
      </Box>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={4}>
          <MetricCard
            title={t('checkin_dashboard.total_checkins_title')}
            value={checkinData?.total_checkins || 0}
            icon={<CheckinIcon sx={{ color: 'white' }} />}
            bgColor="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            iconColor="rgba(255,255,255,0.2)"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <MetricCard
            title={t('checkin_dashboard.average_visit_time_title')}
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
                mb: 3,
              }}
            >
              {t('checkin_dashboard.checkins_by_day_title')}
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
                {t('checkin_dashboard.no_daily_checkin_data')}
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
                mb: 3,
              }}
            >
              {t('checkin_dashboard.most_frequent_customers_title')}
            </Typography>
            <FrequentCustomersList customers={checkinData?.most_frequent_customers} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CheckinAnalyticsPage;
