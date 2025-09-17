import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  TextField,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import NpsReportTable from '../components/Reports/NpsReportTable';
import SatisfactionReportTable from '../components/Reports/SatisfactionReportTable';
import ComplaintsReportTable from '../components/Reports/ComplaintsReportTable';
import TrendsReportTable from '../components/Reports/TrendsReportTable';
import CustomersReportTable from '../components/Reports/CustomersReportTable';
import { useAuth } from '@/app/providers/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';
import axiosInstance from '@/services/axiosInstance';
import { format, subDays } from 'date-fns';

// API Function to fetch reports
const fetchReport = async ({ restaurantId, reportType, startDate, endDate, token }) => {
  const response = await axiosInstance.get(`/dashboard/reports/${reportType}`, {
    params: { restaurantId, start_date: startDate, end_date: endDate },
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const FidelityReports = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const restaurantId = user?.restaurants?.[0]?.id;
  const token = user?.token;

  const [reportType, setReportType] = useState('nps'); // Default report type
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const {
    data: reportData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery(
    ['fidelityReport', restaurantId, reportType, startDate, endDate],
    () => fetchReport({ restaurantId, reportType, startDate, endDate, token }),
    {
      enabled: !!restaurantId && !!token && !!reportType,
    }
  );

  const handleGenerateReport = () => {
    refetch();
  };

  const renderReportTable = () => {
    if (!reportData || reportData.length === 0) {
      return <Typography>{t('reports.no_data_found')}</Typography>;
    }

    switch (reportType) {
      case 'nps':
        return <NpsReportTable reportData={reportData} />;
      case 'satisfaction':
        return <SatisfactionReportTable reportData={reportData} />;
      case 'complaints':
        return <ComplaintsReportTable reportData={reportData} />;
      case 'trends':
        return <TrendsReportTable reportData={reportData} />;
      case 'customers':
        return <CustomersReportTable reportData={reportData} />;
      default:
        return <Typography>{t('reports.select_report_type')}</Typography>;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {t('fidelity_reports.title')}
      </Typography>

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>{t('reports.select_report')}</InputLabel>
            <Select
              value={reportType}
              label={t('reports.select_report')}
              onChange={(e) => setReportType(e.target.value)}
            >
              <MenuItem value="nps">{t('reports.type_nps')}</MenuItem>
              <MenuItem value="satisfaction">{t('reports.type_satisfaction')}</MenuItem>
              <MenuItem value="complaints">{t('reports.type_complaints')}</MenuItem>
              <MenuItem value="trends">{t('reports.type_trends')}</MenuItem>
              <MenuItem value="customers">{t('reports.type_customers')}</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label={t('common.start_date')}
            type="date"
            InputLabelProps={{ shrink: true }}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            sx={{ minWidth: 180 }}
          />
          <TextField
            label={t('common.end_date')}
            type="date"
            InputLabelProps={{ shrink: true }}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            sx={{ minWidth: 180 }}
          />
          <Button variant="contained" onClick={handleGenerateReport} disabled={isLoading}>
            {isLoading ? <CircularProgress size={24} /> : t('reports.generate_report')}
          </Button>
        </Box>
      </Paper>

      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error?.message || t('common.error_loading_data')}
        </Alert>
      )}

      {isLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      ) : (
        renderReportTable()
      )}
    </Box>
  );
};

export default FidelityReports;
