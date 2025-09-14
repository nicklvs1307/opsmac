import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  OutlinedInput,
} from '@mui/material';
import { useAuth } from '@/app/providers/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { useSurveys } from '@/features/Fidelidade/Avaliacoes/api/surveyService'; // To get list of surveys
import { useSurveysComparisonAnalytics } from '@/features/Fidelidade/Avaliacoes/api/satisfactionService'; // New hook
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const SurveysComparison = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const restaurantId = user?.restaurants?.[0]?.id;

  const [selectedSurveyIds, setSelectedSurveyIds] = useState([]);

  const {
    data: surveysData,
    isLoading: isLoadingSurveys,
    isError: isErrorSurveys,
  } = useSurveys(restaurantId);
  const {
    data: comparisonData,
    isLoading: isLoadingComparison,
    isError: isErrorComparison,
  } = useSurveysComparisonAnalytics(restaurantId, selectedSurveyIds);

  const handleSurveySelect = (event) => {
    setSelectedSurveyIds(event.target.value);
  };

  if (isLoadingSurveys || isLoadingComparison) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (isErrorSurveys || isErrorComparison) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {t('common.error_loading_data')}
      </Alert>
    );
  }

  const surveys = surveysData || [];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {t('fidelity_general.surveys_comparison_title')}
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <FormControl fullWidth>
          <InputLabel id="select-surveys-label">
            {t('surveys_comparison.select_surveys')}
          </InputLabel>
          <Select
            labelId="select-surveys-label"
            multiple
            value={selectedSurveyIds}
            onChange={handleSurveySelect}
            input={
              <OutlinedInput
                id="select-multiple-chip"
                label={t('surveys_comparison.select_surveys')}
              />
            }
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip key={value} label={surveys.find((s) => s.id === value)?.title || value} />
                ))}
              </Box>
            )}
          >
            {surveys.map((survey) => (
              <MenuItem key={survey.id} value={survey.id}>
                {survey.title}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      {selectedSurveyIds.length > 0 && comparisonData && comparisonData.length > 0 ? (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                {t('surveys_comparison.nps_comparison')}
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="title" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="averageNps" fill="#8884d8" name="NPS" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                {t('surveys_comparison.csat_comparison')}
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="title" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="averageCsat" fill="#82ca9d" name="CSAT" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                {t('surveys_comparison.metrics_table')}
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('surveys_comparison.survey_title')}</TableCell>
                      <TableCell>{t('surveys_comparison.total_responses')}</TableCell>
                      <TableCell>{t('surveys_comparison.average_nps')}</TableCell>
                      <TableCell>{t('surveys_comparison.average_csat')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {comparisonData.map((data) => (
                      <TableRow key={data.surveyId}>
                        <TableCell>{data.title}</TableCell>
                        <TableCell>{data.totalResponses}</TableCell>
                        <TableCell>{data.averageNps?.toFixed(1) || 'N/A'}</TableCell>
                        <TableCell>{data.averageCsat?.toFixed(1) || 'N/A'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      ) : selectedSurveyIds.length > 0 && comparisonData && comparisonData.length === 0 ? (
        <Alert severity="info">{t('surveys_comparison.no_data_for_selected_surveys')}</Alert>
      ) : (
        <Alert severity="info">{t('surveys_comparison.select_surveys_to_compare')}</Alert>
      )}
    </Box>
  );
};

export default SurveysComparison;
