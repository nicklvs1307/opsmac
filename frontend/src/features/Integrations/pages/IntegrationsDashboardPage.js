import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography, Paper, Tabs, Tab } from '@mui/material';
import {
  Restaurant as IfoodIcon,
  DeliveryDining as DeliveryMuchIcon,
  Store as UaiRangoIcon,
  Business as GoogleMyBusinessIcon,
  Settings as SaiposIcon,
} from '@mui/icons-material';

import IfoodIntegration from './IfoodIntegrationPage';
import UaiRangoIntegration from './UaiRangoIntegrationPage';
import GoogleMyBusinessIntegration from './GoogleMyBusinessIntegrationPage';
import SaiposIntegration from './SaiposIntegrationPage';
import DeliveryMuchIntegration from './DeliveryMuchIntegrationPage';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`integration-tabpanel-${index}`}
      aria-labelledby={`integration-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `integration-tab-${index}`,
    'aria-controls': `integration-tabpanel-${index}`,
  };
}

const IntegrationsPage = () => {
  const { t } = useTranslation();
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        {t('integrations.page_title')}
      </Typography>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label={t('integrations.tabs_aria_label')}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label={t('integrations.ifood_tab')} icon={<IfoodIcon />} {...a11yProps(0)} />
          <Tab label={t('integrations.uairango_tab')} icon={<UaiRangoIcon />} {...a11yProps(1)} />
          <Tab
            label={t('integrations.google_my_business_tab')}
            icon={<GoogleMyBusinessIcon />}
            {...a11yProps(2)}
          />
          <Tab label={t('integrations.saipos_tab')} icon={<SaiposIcon />} {...a11yProps(3)} />
          <Tab
            label={t('integrations.delivery_much_tab')}
            icon={<DeliveryMuchIcon />}
            {...a11yProps(4)}
          />
        </Tabs>
      </Paper>
      <TabPanel value={value} index={0}>
        <IfoodIntegration />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <UaiRangoIntegration />
      </TabPanel>
      <TabPanel value={value} index={2}>
        <GoogleMyBusinessIntegration />
      </TabPanel>
      <TabPanel value={value} index={3}>
        <SaiposIntegration />
      </TabPanel>
      <TabPanel value={value} index={4}>
        <DeliveryMuchIntegration />
      </TabPanel>
    </Box>
  );
};

export default IntegrationsPage;
