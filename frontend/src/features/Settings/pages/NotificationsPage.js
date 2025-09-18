import React, { useState, useEffect } from 'react';
import { Box, Alert } from '@mui/material';
import { usePermissions } from '../../hooks/usePermissions';
import {
  Card,
  CardContent,
  CardHeader,
  Switch,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import { useAuth } from '@/app/providers/contexts/AuthContext';
import { useTranslation } 'react-i18next';
import toast from 'react-hot-toast';

import {
  useUpdateGeneralSetting,
  useGeneralSettings,
} from '../api/settingsService'; // Adjusted import path

const NotificationsPage = () => {
  const { can } = usePermissions();
  const { user } = useAuth();
  const { t } = useTranslation();

  const [settings, setSettings] = useState({});

  const currentRestaurantId = user?.restaurants?.[0]?.id;

  const { data: generalSettingsData } = useGeneralSettings(currentRestaurantId, {
    enabled: !!currentRestaurantId,
    onSuccess: (data) => {
      setSettings((prevSettings) => ({
        notifications: {
          ...(prevSettings.notifications || {}),
          ...(data.settings?.notifications || {}),
        },
      }));
    },
    onError: (error) => {
      console.error('Error fetching settings:', error);
    },
  });

  const updateGeneralSettingMutation = useUpdateGeneralSetting({
    onSuccess: () => {
      toast.success(t('settings.setting_updated'));
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || t('settings.error_updating_setting'));
    },
  });

  const handleSettingChange = (category, setting, value) => {
    if (!currentRestaurantId) return;
    // Optimistic update (optional, but good for UX)
    setSettings((prev) => ({ ...prev, [category]: { ...prev[category], [setting]: value } }));

    updateGeneralSettingMutation.mutate({
      restaurantId: currentRestaurantId,
      category,
      setting,
      value,
    });
  };

  useEffect(() => {
    if (generalSettingsData) {
      setSettings(generalSettingsData);
    }
  }, [generalSettingsData]);

  if (!can('notification_settings', 'update')) { // Assumindo permissão para atualizar configurações de notificação
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="warning">
          {t('common.module_not_enabled', { moduleName: t('modules.notification_settings') })}
        </Alert>
      </Box>
    );
  }

  return (
    <Card>
      <CardHeader
        title={t('settings.notification_preferences')}
        subheader={t('settings.configure_notifications')}
      />
      <CardContent>
        <List>
          <ListItem>
            <ListItemText
              primary={t('settings.email_new_feedback')}
              secondary={t('settings.receive_email_new_feedback')}
            />
            <ListItemSecondaryAction>
              <Switch
                checked={settings?.notifications?.email_feedback || false}
                onChange={(e) =>
                  handleSettingChange('notifications', 'email_feedback', e.target.checked)
                }
              />
            </ListItemSecondaryAction>
          </ListItem>

          <ListItem>
            <ListItemText
              primary={t('settings.email_reports')}
              secondary={t('settings.receive_weekly_reports')}
            />
            <ListItemSecondaryAction>
              <Switch
                checked={settings?.notifications?.email_reports || false}
                onChange={(e) =>
                  handleSettingChange('notifications', 'email_reports', e.target.checked)
                }
              />
            </ListItemSecondaryAction>
          </ListItem>

          <ListItem>
            <ListItemText
              primary={t('settings.sms_alerts')}
              secondary={t('settings.receive_important_alerts_sms')}
            />
            <ListItemSecondaryAction>
              <Switch
                checked={settings?.notifications?.sms_alerts || false}
                onChange={(e) =>
                  handleSettingChange('notifications', 'sms_alerts', e.target.checked)
                }
              />
            </ListItemSecondaryAction>
          </ListItem>

          <ListItem>
            <ListItemText
              primary={t('settings.push_notifications')}
              secondary={t('settings.receive_browser_notifications')}
            />
            <ListItemSecondaryAction>
              <Switch
                checked={settings?.notifications?.push_notifications || false}
                onChange={(e) =>
                  handleSettingChange('notifications', 'push_notifications', e.target.checked)
                }
              />
            </ListItemSecondaryAction>
          </ListItem>
        </List>
      </CardContent>
    </Card>
  );
};

export default NotificationsPage;
