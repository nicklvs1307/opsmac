import React, { useState } from 'react';
import { Alert } from '@mui/material';
import { usePermissions } from '../../../hooks/usePermissions';
import {
  Box,
  Typography,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  CircularProgress,
  IconButton,
  Chip,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  ContentCopy as ContentCopyIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '@/app/providers/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useQueryClient } from 'react-query';

import {
  useApiToken,
  useGenerateApiToken,
  useRevokeApiToken,
  useChangePassword,
} from '../api/settingsService'; // Adjusted import path

const SecurityPage = () => {
  const { can } = usePermissions();
  const { user } = useAuth();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const currentRestaurantId = user?.restaurants?.[0]?.id;

  const [apiToken, setApiToken] = useState('');
  const [changePasswordDialog, setChangePasswordDialog] = useState(false);

  const { data: apiTokenData } = useApiToken(currentRestaurantId, {
    enabled: !!currentRestaurantId,
    onSuccess: (apiTokenData) => setApiToken(apiTokenData.api_token || ''),
    onError: (error) => {
      console.error('Error fetching API token:', error);
      toast.error(t('settings.error_fetching_api_token'));
    },
  });

  const generateApiTokenMutation = useGenerateApiToken({
    onSuccess: (data) => {
      toast.success(t('settings.new_api_token_generated'));
      queryClient.invalidateQueries(['settingsApiToken', currentRestaurantId]); // Invalidate to refetch new token
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || t('settings.error_generating_api_token'));
    },
  });

  const revokeApiTokenMutation = useRevokeApiToken({
    onSuccess: () => {
      toast.success(t('settings.api_token_revoked'));
      queryClient.invalidateQueries(['settingsApiToken', currentRestaurantId]); // Invalidate to clear token
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || t('settings.error_revoking_api_token'));
    },
  });

  const changePasswordMutation = useChangePassword({
    onSuccess: () => {
      toast.success(t('settings.password_changed_successfully'));
      setChangePasswordDialog(false);
      resetPassword();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || t('settings.error_changing_password'));
    },
  });

  const handleGenerateApiToken = () => {
    if (!currentRestaurantId) return;
    generateApiTokenMutation.mutate(currentRestaurantId);
  };

  const handleRevokeApiToken = () => {
    if (!currentRestaurantId) return;
    revokeApiTokenMutation.mutate(currentRestaurantId);
  };

  const onPasswordSubmit = (data) => {
    changePasswordMutation.mutate({
      current_password: data.current_password,
      new_password: data.new_password,
    });
  };

  const {
    control: passwordControl,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
    watch,
  } = useForm({
    defaultValues: {
      current_password: '',
      new_password: '',
      confirm_password: '',
    },
  });

  const newPassword = watch('new_password');

  if (!can('security_settings', 'update')) { // Assumindo permissão para atualizar configurações de segurança
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="warning">
          {t('common.module_not_enabled', { moduleName: t('modules.security_settings') })}
        </Alert>
      </Box>
    );
  }

  return (
    <Card>
      <CardHeader
        title={t('settings.security_settings')}
        subheader={t('settings.manage_security_settings')}
      />
      <CardContent>
        <Box mb={3}>
          <Typography variant="h6" gutterBottom>
            {t('settings.change_password')}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {t('settings.keep_account_secure')}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => setChangePasswordDialog(true)}
          >
            {t('settings.change_password')}
          </Button>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box>
          <Typography variant="h6" gutterBottom>
            {t('settings.active_sessions')}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {t('settings.manage_logged_in_sessions')}
          </Typography>

          <List>
            <ListItem>
              <ListItemText
                primary={t('settings.current_browser')}
                secondary={t('settings.current_browser_details')}
              />
              <Chip label={t('settings.current_browser')} color="primary" size="small" />
            </ListItem>
          </List>
        </Box>
        {/* API Token Section */}
        <Divider sx={{ my: 3 }} />
        <Box>
          <Typography variant="h6" gutterBottom>
            {t('settings.api_token')}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {t('settings.use_public_api')}
          </Typography>
          {apiToken ? (
            <Box display="flex" alignItems="center">
              <TextField
                value={apiToken}
                fullWidth
                InputProps={{
                  readOnly: true,
                }}
                sx={{ mr: 2 }}
              />
              <IconButton onClick={() => navigator.clipboard.writeText(apiToken)}>
                <ContentCopyIcon />
              </IconButton>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />})
                onClick={handleRevokeApiToken}
                disabled={revokeApiTokenMutation.isLoading}
              >
                {revokeApiTokenMutation.isLoading ? (
                  <CircularProgress size={20} />
                ) : (
                  t('settings.revoke_token')
                )}
              </Button>
            </Box>
          ) : (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleGenerateApiToken}
              disabled={generateApiTokenMutation.isLoading}
            >
              {generateApiTokenMutation.isLoading ? (
                <CircularProgress size={20} />
              ) : (
                t('settings.generate_new_token')
              )}
            </Button>
          )}
        </Box>
      </CardContent>
      {/* Change Password Dialog */}
      <Dialog
        open={changePasswordDialog}
        onClose={() => setChangePasswordDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t('settings.change_password')}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Controller
                name="current_password"
                control={passwordControl}
                rules={{ required: t('settings.current_password_required') }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={t('settings.current_password_label')}
                    type="password"
                    fullWidth
                    error={!!passwordErrors.current_password}
                    helperText={passwordErrors.current_password?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="new_password"
                control={passwordControl}
                rules={{
                  required: t('settings.new_password_required'),
                  minLength: {
                    value: 6,
                    message: t('settings.new_password_min_length'),
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={t('settings.new_password_label')}
                    type="password"
                    fullWidth
                    error={!!passwordErrors.new_password}
                    helperText={passwordErrors.new_password?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="confirm_password"
                control={passwordControl}
                rules={{
                  required: t('settings.confirm_password_required'),
                  validate: (value) =>
                    value === newPassword || t('settings.passwords_do_not_match'),
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={t('settings.confirm_password_label')}
                    type="password"
                    fullWidth
                    error={!!passwordErrors.confirm_password}
                    helperText={passwordErrors.confirm_password?.message}
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setChangePasswordDialog(false)}>
            {t('settings.cancel_button')}
          </Button>
          <Button
            onClick={handlePasswordSubmit(onPasswordSubmit)}
            variant="contained"
            disabled={changePasswordMutation.isLoading}
          >
            {changePasswordMutation.isLoading ? (
              <CircularProgress size={24} />
            ) : (
              t('settings.update_password')
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default SecurityPage;
