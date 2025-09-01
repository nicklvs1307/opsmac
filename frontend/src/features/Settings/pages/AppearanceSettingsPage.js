import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  CardHeader,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useAuth } from '@/app/providers/contexts/AuthContext';
import { useThemeMode } from '@/app/providers/contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

import { useUpdateGeneralSetting, useGeneralSettings } from '../api/settingsService'; // Adjusted import path

const AppearanceSettingsPage = () => {
  const { user } = useAuth();
  const { toggleTheme } = useThemeMode();
  const { t, i18n } = useTranslation();

  const [settings, setSettings] = useState({});

  const currentRestaurantId = user?.restaurants?.[0]?.id;

  const { data: generalSettingsData } = useGeneralSettings(currentRestaurantId, {
    enabled: !!currentRestaurantId,
    onSuccess: (data) => {
      setSettings((prevSettings) => ({
        appearance: {
          ...(prevSettings.appearance || {}),
          ...(data.settings?.appearance || {}),
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

  return (
    <Card>
      <CardHeader
        title={t('settings.appearance')}
        subheader={t('settings.personalize_appearance')}
      />
      <CardContent>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>{t('settings.theme')}</InputLabel>
              <Select
                value={settings?.appearance?.theme || 'light'}
                label={t('settings.theme')}
                onChange={(e) => {
                  handleSettingChange('appearance', 'theme', e.target.value);
                  toggleTheme(e.target.value);
                }}
              >
                <MenuItem value="light">{t('settings.light')}</MenuItem>
                <MenuItem value="dark">{t('settings.dark')}</MenuItem>
                <MenuItem value="auto">{t('settings.auto')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>{t('settings.language')}</InputLabel>
              <Select
                value={settings?.appearance?.language || 'pt'}
                label={t('settings.language')}
                onChange={(e) => {
                  handleSettingChange('appearance', 'language', e.target.value);
                  i18n.changeLanguage(e.target.value);
                }}
              >
                <MenuItem value="pt">{t('settings.language_pt')}</MenuItem>
                <MenuItem value="en">{t('settings.language_en')}</MenuItem>
                <MenuItem value="es">{t('settings.language_es')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>{t('settings.timezone')}</InputLabel>
              <Select
                value={settings?.appearance?.timezone || 'America/Sao_Paulo'}
                label={t('settings.timezone')}
                onChange={(e) => handleSettingChange('appearance', 'timezone', e.target.value)}
              >
                <MenuItem value="America/Sao_Paulo">{t('settings.timezone_sao_paulo')}</MenuItem>
                <MenuItem value="America/New_York">{t('settings.timezone_new_york')}</MenuItem>
                <MenuItem value="Europe/London">{t('settings.timezone_london')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default AppearanceSettingsPage;
