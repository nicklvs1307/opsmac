
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Alert
} from '@mui/material';
import { BarChart as BarChartIcon, Star as StarIcon, ThumbUp as ThumbUpIcon } from '@mui/icons-material';
import { useAuth } from '../../../contexts/AuthContext';
import axiosInstance from '../../../api/axiosInstance';
import { useQuery } from 'react-query';

// A simple card for displaying a metric
const MetricCard = ({ title, value, icon, bgColor, iconColor }) => (
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

const fetchSatisfactionAnalytics = async (restaurantId) => {
  // This endpoint needs to be created in the backend.
  const { data } = await axiosInstance.get(`/api/surveys/analytics/${restaurantId}`);
  return data;
};

const fetchNpsCriteria = async () => {
  const { data } = await axiosInstance.get('/api/nps-criteria');
  return data;
};

const SatisfactionAnalytics = () => {
  const { user } = useAuth();
  const restaurantId = user?.restaurants?.[0]?.id;

  const { data, isLoading, error } = useQuery(
    ['satisfactionAnalytics', restaurantId],
    () => fetchSatisfactionAnalytics(restaurantId),
    {
      enabled: !!restaurantId, // Only run the query if restaurantId is available
    }
  );

  const { data: npsCriteria } = useQuery('npsCriteria', fetchNpsCriteria);

  const getCriterionName = (criterionId) => {
    if (!npsCriteria) return criterionId;
    const criterion = npsCriteria.find(c => c.id === criterionId);
    return criterion ? criterion.name : criterionId;
  };

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
        Erro ao carregar as análises de satisfação. A funcionalidade no backend pode não existir ainda. ({error.message})
      </Alert>
    );
  }

  return (
    <Box p={3}>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <MetricCard
            title="Total de Respostas"
            value={data?.totalResponses || 0}
            icon={<BarChartIcon sx={{ fontSize: 40, color: 'white' }} />}
            bgColor="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <MetricCard
            title="NPS Score Médio"
            value={data?.averageNps?.toFixed(0) || 'N/A'}
            icon={<ThumbUpIcon sx={{ fontSize: 40, color: 'white' }} />}
            bgColor="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <MetricCard
            title="CSAT Médio"
            value={data?.averageCsat?.toFixed(2) || 'N/A'}
            icon={<StarIcon sx={{ fontSize: 40, color: 'white' }} />}
            bgColor="linear-gradient(135deg, #5ee7df 0%, #b490ca 100%)"
          />
        </Grid>
      </Grid>

      {/* NPS Scores by Criterion */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          NPS por Critério
        </Typography>
        {data?.npsMetricsPerCriterion && data.npsMetricsPerCriterion.length > 0 ? (
          <Grid container spacing={2}>
            {data.npsMetricsPerCriterion.map((criterion) => (
              <Grid item xs={12} md={6} key={criterion.id}>
                <Paper sx={{ p: 2, border: '1px solid #eee' }}>
                  <Typography variant="subtitle1">{criterion.name}</Typography>
                  <Typography>Promotores: {criterion.promoters}</Typography>
                  <Typography>Neutros: {criterion.neutrals}</Typography>
                  <Typography>Detratores: {criterion.detractors}</Typography>
                  <Typography>Total de Respostas: {criterion.totalResponses}</Typography>
                  <Typography variant="h6" sx={{ mt: 1 }}>NPS Score: {criterion.npsScore?.toFixed(2) || 'N/A'}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography>Nenhum dado de NPS por critério disponível.</Typography>
        )}
      </Paper>

      {/* More charts and data visualizations can be added here */}
    </Box>
  );
};

export default SatisfactionAnalytics;
