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
        return (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('reports.table_header.date')}</TableCell>
                  <TableCell>{t('reports.table_header.total_responses')}</TableCell>
                  <TableCell>{t('reports.table_header.promoters')}</TableCell>
                  <TableCell>{t('reports.table_header.passives')}</TableCell>
                  <TableCell>{t('reports.table_header.detractors')}</TableCell>
                  <TableCell>{t('reports.table_header.nps_score')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reportData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{format(new Date(row.date), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>{row.totalResponses}</TableCell>
                    <TableCell>{row.promoters}</TableCell>
                    <TableCell>{row.passives}</TableCell>
                    <TableCell>{row.detractors}</TableCell>
                    <TableCell>{row.npsScore?.toFixed(0)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );
      case 'satisfaction':
        return (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('reports.table_header.date')}</TableCell>
                  <TableCell>{t('reports.table_header.total_feedbacks')}</TableCell>
                  <TableCell>{t('reports.table_header.avg_rating')}</TableCell>
                  <TableCell>{t('reports.table_header.excellent')}</TableCell>
                  <TableCell>{t('reports.table_header.good')}</TableCell>
                  <TableCell>{t('reports.table_header.average')}</TableCell>
                  <TableCell>{t('reports.table_header.poor')}</TableCell>
                  <TableCell>{t('reports.table_header.terrible')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reportData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{format(new Date(row.date), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>{row.totalFeedbacks}</TableCell>
                    <TableCell>{row.avgRating?.toFixed(2)}</TableCell>
                    <TableCell>{row.excellent}</TableCell>
                    <TableCell>{row.good}</TableCell>
                    <TableCell>{row.average}</TableCell>
                    <TableCell>{row.poor}</TableCell>
                    <TableCell>{row.terrible}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );
      case 'complaints':
        return (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('reports.table_header.date')}</TableCell>
                  <TableCell>{t('reports.table_header.customer_name')}</TableCell>
                  <TableCell>{t('reports.table_header.rating')}</TableCell>
                  <TableCell>{t('reports.table_header.comment')}</TableCell>
                  <TableCell>{t('reports.table_header.status')}</TableCell>
                  <TableCell>{t('reports.table_header.priority')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reportData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{format(new Date(row.createdAt), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>{row.customer?.name || t('common.anonymous')}</TableCell>
                    <TableCell>{row.rating}</TableCell>
                    <TableCell>{row.comment}</TableCell>
                    <TableCell>{row.status}</TableCell>
                    <TableCell>{row.priority}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );
      case 'trends':
        return (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('reports.table_header.week')}</TableCell>
                  <TableCell>{t('reports.table_header.total_feedbacks')}</TableCell>
                  <TableCell>{t('reports.table_header.avg_rating')}</TableCell>
                  <TableCell>{t('reports.table_header.positive_feedbacks')}</TableCell>
                  <TableCell>{t('reports.table_header.negative_feedbacks')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reportData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{format(new Date(row.week), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>{row.totalFeedbacks}</TableCell>
                    <TableCell>{row.avgRating?.toFixed(2)}</TableCell>
                    <TableCell>{row.positiveFeedbacks}</TableCell>
                    <TableCell>{row.negativeFeedbacks}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );
      case 'customers':
        return (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('reports.table_header.customer_name')}</TableCell>
                  <TableCell>{t('reports.table_header.email')}</TableCell>
                  <TableCell>{t('reports.table_header.segment')}</TableCell>
                  <TableCell>{t('reports.table_header.total_visits')}</TableCell>
                  <TableCell>{t('reports.table_header.loyalty_points')}</TableCell>
                  <TableCell>{t('reports.table_header.feedback_count')}</TableCell>
                  <TableCell>{t('reports.table_header.avg_feedback_rating')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reportData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.email}</TableCell>
                    <TableCell>{row.customerSegment}</TableCell>
                    <TableCell>{row.totalVisits}</TableCell>
                    <TableCell>{row.loyaltyPoints}</TableCell>
                    <TableCell>{row.feedbackCount}</TableCell>
                    <TableCell>{row.avgFeedbackRating?.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );
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
