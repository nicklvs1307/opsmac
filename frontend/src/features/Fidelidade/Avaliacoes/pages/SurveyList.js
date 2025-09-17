import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  TextField,
  Grid,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BarChartIcon from '@mui/icons-material/BarChart';
import QrCodeIcon from '@mui/icons-material/QrCode';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SearchIcon from '@mui/icons-material/Search';
import toast from 'react-hot-toast';
import QRCode from 'qrcode.react';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/app/providers/contexts/AuthContext';
import usePermissions from '@/hooks/usePermissions';
import {
  useSurveys,
  useDeleteSurvey,
  useUpdateSurveyStatus,
} from '@/features/Fidelidade/Avaliacoes/api/surveyService';
import QrCodeModal from '../components/QrCodeModal';
import SurveyTable from '../components/SurveyTable';

const SurveyList = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { can } = usePermissions();
  const restaurantId = user?.restaurants?.[0]?.id;
  // const enabledModules = user?.restaurants?.[0]?.settings?.enabled_modules || []; // Old logic, no longer needed

  const [filters, setFilters] = useState({ search: '' });
  const [qrCodeValue, setQrCodeValue] = useState(null);
  const [isQrModalOpen, setQrModalOpen] = useState(false);

  const { data: surveys, isLoading, error, refetch } = useSurveys(restaurantId, filters);
  const deleteMutation = useDeleteSurvey();
  const updateStatusMutation = useUpdateSurveyStatus();

  const handleToggleStatus = (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'draft' : 'active';
    updateStatusMutation.mutate({ id, status: newStatus });
  };

  const handleDelete = (id) => {
    if (window.confirm(t('survey_list.delete_confirm'))) {
      deleteMutation.mutate(id);
    }
  };

  const getPublicSurveyLink = (restaurantSlug, surveySlug) => {
    if (!restaurantSlug) {
      return null;
    }
    return `${window.location.origin}/public/surveys/${restaurantSlug}/${surveySlug}`;
  };

  const handleCopyLink = (surveySlug) => {
    const restaurantSlug = user?.restaurants?.[0]?.slug;
    const publicLink = getPublicSurveyLink(restaurantSlug, surveySlug);
    if (!publicLink) {
      toast.error(t('survey_list.restaurant_slug_not_found'));
      return;
    }
    navigator.clipboard
      .writeText(publicLink)
      .then(() => toast.success(t('survey_list.copy_link_success')))
      .catch(() => toast.error(t('survey_list.copy_link_error')));
  };

  const handleGenerateQrCode = (surveySlug) => {
    const restaurantSlug = user?.restaurants?.[0]?.slug;
    const publicLink = getPublicSurveyLink(restaurantSlug, surveySlug);
    if (!publicLink) {
      toast.error(t('survey_list.restaurant_slug_not_found'));
      return;
    }
    setQrCodeValue(publicLink);
    setQrModalOpen(true);
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    if (restaurantId) {
      refetch();
    }
  }, [filters, refetch, restaurantId]);

  if (!can('fidelity:satisfaction:surveys', 'read')) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="warning">
          {t('common.module_not_enabled', { moduleName: t('modules.satisfaction') })}
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
          <Alert severity="error">
            {t('common.error_loading_surveys')}: {error.message}
          </Alert>
        ) : (
          <SurveyTable
            surveys={surveys}
            handleToggleStatus={handleToggleStatus}
            handleDelete={handleDelete}
            handleGenerateQrCode={handleGenerateQrCode}
            handleCopyLink={handleCopyLink}
            deleteMutation={deleteMutation}
            updateStatusMutation={updateStatusMutation}
          />
        )}
          
        )}
      </Paper>

      
    <QrCodeModal isOpen={isQrModalOpen} onClose={() => setQrModalOpen(false)} qrCodeValue={qrCodeValue} />
    </Box>
  );
};

export default SurveyList;
