
import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, TextField, Grid } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BarChartIcon from '@mui/icons-material/BarChart';
import QrCodeIcon from '@mui/icons-material/QrCode';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SearchIcon from '@mui/icons-material/Search';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axiosInstance from '../../../api/axiosInstance';
import toast from 'react-hot-toast';
import QRCode from 'qrcode.react';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../contexts/AuthContext'; // Importar useAuth

const fetchSurveys = async (filters) => {
  const { data } = await axiosInstance.get('/api/surveys', { params: filters });
  return data;
};

const deleteSurvey = async (id) => {
  await axiosInstance.delete(`/api/surveys/${id}`);
};

const updateSurveyStatus = async ({ id, status }) => {
  await axiosInstance.patch(`/api/surveys/${id}/status`, { status });
};

const SurveyList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    search: '',
  });
  const [qrCodeValue, setQrCodeValue] = useState(null);
  const [isQrModalOpen, setQrModalOpen] = useState(false);
  const { t } = useTranslation();
  const { user } = useAuth(); // Obter usuário para acessar enabled_modules
  const enabledModules = user?.restaurants?.[0]?.settings?.enabled_modules || [];

  const { data: surveys, isLoading, error, refetch } = useQuery(['surveys', filters], () => fetchSurveys(filters));

  const deleteMutation = useMutation(deleteSurvey, {
    onSuccess: () => {
      queryClient.invalidateQueries('surveys');
      toast.success(t('survey_list.delete_success'));
    },
    onError: (err) => {
      toast.error(t('survey_list.delete_error', { message: err.response.data.msg || err.message }));
    },
  });

  const updateStatusMutation = useMutation(updateSurveyStatus, {
    onSuccess: () => {
      queryClient.invalidateQueries('surveys');
      toast.success(t('survey_list.status_update_success'));
    },
    onError: (err) => {
      toast.error(t('survey_list.status_update_error', { message: err.response.data.msg || err.message }));
    },
  });

  // Verifica se o módulo de pesquisas/feedback está habilitado
  if (!enabledModules.includes('surveys_feedback')) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="warning">
          {t('common.module_not_enabled', { moduleName: t('modules.surveys_feedback') })}
        </Alert>
      </Box>
    );
  }

  const handleToggleStatus = (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'draft' : 'active';
    updateStatusMutation.mutate({ id, status: newStatus });
  };

  const handleDelete = (id) => {
    if (window.confirm(t('survey_list.delete_confirm'))) {
      deleteMutation.mutate(id);
    }
  };

  const handleCopyLink = (slug) => {
    const publicLink = `${window.location.origin}/public/surveys/${slug}`;
    navigator.clipboard.writeText(publicLink)
      .then(() => {
        toast.success(t('survey_list.copy_link_success'));
      })
      .catch((err) => {
        toast.error(t('survey_list.copy_link_error'));
        console.error(t('survey_list.copy_link_error_console'), err);
      });
  };

  const handleGenerateQrCode = (surveyId) => {
    const publicLink = `${window.location.origin}/public/surveys/${surveyId}`;
    setQrCodeValue(publicLink);
    setQrModalOpen(true);
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    refetch();
  }, [filters, refetch]);

  // Verifica se o módulo de pesquisas/feedback está habilitado
  if (!enabledModules.includes('surveys_feedback')) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="warning">
          {t('common.module_not_enabled', { moduleName: t('modules.surveys_feedback') })}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">{t('survey_list.title')}</Typography>
        <Button
          variant="contained"
          component={RouterLink}
          to="/fidelity/surveys/new"
          startIcon={<AddIcon />}
        >
          {t('survey_list.new_survey_button')}
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
            {t('survey_list.filters_title')}
          </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label={t('survey_list.search_label')}
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder={t('survey_list.search_placeholder')}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />,
              }}
            />
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={3} sx={{ p: 3 }}>
        {isLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{t('common.error_loading_surveys')}: {error.message}</Alert>
        ) : (
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('survey_list.table_header_title')}</TableCell>
                  <TableCell>{t('survey_list.table_header_type')}</TableCell>
                  <TableCell>{t('survey_list.table_header_status')}</TableCell>
                  <TableCell align="right">{t('survey_list.table_header_actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {surveys.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      {t('survey_list.no_surveys_found')}
                    </TableCell>
                  </TableRow>
                ) : (
                  surveys.map((survey) => (
                    <TableRow key={survey.id}>
                      <TableCell>{survey.title}</TableCell>
                      <TableCell>{survey.type}</TableCell>
                      <TableCell>{survey.status}</TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                          <IconButton component={RouterLink} to={`/fidelity/surveys/${survey.id}/results`} color="primary" aria-label={t('survey_list.view_results_aria_label')}>
                            <BarChartIcon />
                          </IconButton>
                          <IconButton component={RouterLink} to={`/fidelity/surveys/edit/${survey.id}`} color="info" aria-label={t('survey_list.edit_survey_aria_label')}>
                            <EditIcon />
                          </IconButton>
                          <IconButton 
                            color={survey.status === 'active' ? 'success' : 'default'}
                            aria-label={t('survey_list.toggle_status_aria_label')}
                            onClick={() => handleToggleStatus(survey.id, survey.status)}
                          >
                            {survey.status === 'active' ? <ToggleOnIcon /> : <ToggleOffIcon />}
                          </IconButton>
                          <IconButton color="secondary" aria-label={t('survey_list.generate_qr_code_aria_label')} onClick={() => handleGenerateQrCode(survey.id)}>
                            <QrCodeIcon />
                          </IconButton>
                          <IconButton color="default" aria-label={t('survey_list.copy_link_aria_label')} onClick={() => handleCopyLink(survey.slug)}>
                            <ContentCopyIcon />
                          </IconButton>
                          <IconButton color="error" aria-label={t('survey_list.delete_survey_aria_label')} onClick={() => handleDelete(survey.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {isQrModalOpen && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1300, // Ensure it's above other content
          }}
          onClick={() => setQrModalOpen(false)}
        >
          <Paper sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <Typography variant="h6">{t('survey_list.qr_code_modal_title')}</Typography>
            <QRCode value={qrCodeValue} size={256} />
            <Button variant="contained" onClick={() => setQrModalOpen(false)}>{t('common.close')}</Button>
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default SurveyList;
