import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Restaurant as IfoodIcon,
  DeliveryDining as DeliveryMuchIcon,
  Store as UaiRangoIcon,
  Business as GoogleMyBusinessIcon,
  Settings as SaiposIcon,
} from '@mui/icons-material';

import IfoodIntegration from './IfoodIntegration';
import UaiRangoIntegration from './UaiRangoIntegration';
import GoogleMyBusinessIntegration from './GoogleMyBusinessIntegration';
import SaiposIntegration from './SaiposIntegration';
import DeliveryMuchIntegration from './DeliveryMuchIntegration';

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
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
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
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        Integrações
      </Typography>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="abas de integração"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Ifood" icon={<IfoodIcon />} {...a11yProps(0)} />
          <Tab label="Uai Rango" icon={<UaiRangoIcon />} {...a11yProps(1)} />
          <Tab label="Google Meu Negócio" icon={<GoogleMyBusinessIcon />} {...a11yProps(2)} />
          <Tab label="Saipos" icon={<SaiposIcon />} {...a11yProps(3)} />
          <Tab label="Delivery Much" icon={<DeliveryMuchIcon />} {...a11yProps(4)} />
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