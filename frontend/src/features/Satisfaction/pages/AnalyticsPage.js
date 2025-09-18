import React, { useState } from 'react';
import { usePermissions } from '../../../hooks/usePermissions';
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  TextField,
  Button,
} from '@mui/material';
import {
  BarChart as BarChartIcon,
  Star as StarIcon,
  ThumbUp as ThumbUpIcon,
} from '@mui/icons-material';
import { useAuth } from '@/app/providers/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { useSatisfactionAnalytics } from '../api/satisfactionService';
import { format, subMonths } from 'date-fns';
// import SatisfactionDateFilters from '../components/SatisfactionDateFilters';
// import SatisfactionMetricCards from '../components/SatisfactionMetricCards';
// import FeedbackTable from '../components/FeedbackTable';

// A simple card for displaying a metric
const MetricCard = ({ title, value, icon, bgColor }) => (
  <Paper
    sx={{
      p: 3,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%',
      background: bgColor,
      color: 'white',
      borderRadius: 2,
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    }}
  >
    {icon}
    <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', mt: 1 }}>
      {value}
    </Typography>
    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
      {title}
    </Typography>
  </Paper>
);

const AnalyticsPage = () => {
  const { can } = usePermissions();
  const { user } = useAuth();
  const { t } = useTranslation();
  const restaurantId = user?.restaurants?.[0]?.id;

  const [startDate, setStartDate] = useState(format(subMonths(new Date(), 12), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [appliedStartDate, setAppliedStartDate] = useState(startDate);
  const [appliedEndDate, setAppliedEndDate] = useState(endDate);

  const { data, isLoading, error } = useSatisfactionAnalytics(restaurantId, {
    start_date: appliedStartDate,
    end_date: appliedEndDate,
  });

  const handleApplyFilters = () => {
    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
  };

  if (!can('fidelity:satisfaction:dashboard', 'read')) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="warning">
          {t('common.module_not_enabled', { moduleName: t('modules.satisfaction') })}
        </Alert>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 3 }}>
        {t('satisfaction_analytics.load_error')} ({error.message})
      </Alert>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" component="h1" gutterBottom>
        {t('fidelity_general.satisfaction_analytics_title')}
      </Typography>

      {/* <SatisfactionDateFilters
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        onApplyFilters={handleApplyFilters}
      /> */}

      {/* <SatisfactionMetricCards data={data} /> */}

      {/* {isLoading ? ( // Usar isLoading do useSatisfactionAnalytics para feedbacks também
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100px">
          <CircularProgress />
        </Box>
      ) : error ? ( // Usar error do useSatisfactionAnalytics para feedbacks também
        <Alert severity="error">
          {t('common.error_loading_feedbacks')}: {error.message}
        </Alert>
      ) : (
        <FeedbackTable feedbacks={data?.feedbacks} />
      )} */}
    </Box>
  );
};

export default AnalyticsPage;
