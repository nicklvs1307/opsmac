import React, { useState } from 'react';
import { Box, Tabs, Tab, Paper, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import CategoriesTab from '../components/CategoriesTab';
import ProductsTab from '../components/ProductsTab';
import AddonsTab from '../components/AddonsTab';
import VariationsTab from '../components/VariationsTab';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`menu-tabpanel-${index}`}
      aria-labelledby={`menu-tab-${index}`}
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

const MenuManagementPage = () => {
  const { t } = useTranslation();
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        {t('menu_management.title')}
      </Typography>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="menu management tabs">
          <Tab label={t('menu_management.tabs.categories')} />
          <Tab label={t('menu_management.tabs.products')} />
          <Tab label={t('menu_management.tabs.addons')} />
          <Tab label={t('menu_management.tabs.variations')} />
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>
        <CategoriesTab />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <ProductsTab />
      </TabPanel>
      <TabPanel value={value} index={2}>
        <AddonsTab />
      </TabPanel>
      <TabPanel value={value} index={3}>
        <VariationsTab />
      </TabPanel>
    </Paper>
  );
};

export default MenuManagementPage;
