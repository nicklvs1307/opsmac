import CategoryManagement from '../../components/ERP/CategoryManagement';
import ProductManagement from '../../components/ERP/ProductManagement';
import React, { useState } from 'react';
import { Box, Typography, Tabs, Tab } from '@mui/material';
import { useTranslation } from 'react-i18next';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
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
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const Menu = () => {
  const { t } = useTranslation();
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        {t('menu.title')}
      </Typography>
      <Typography variant="body1" gutterBottom>
        {t('menu.description')}
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 4 }}>
        <Tabs value={value} onChange={handleChange} aria-label="menu tabs">
          <Tab label={t('menu.tabs.categories')} {...a11yProps(0)} />
          <Tab label={t('menu.tabs.pizzas')} {...a11yProps(1)} />
          <Tab label={t('menu.tabs.other_products')} {...a11yProps(2)} />
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>
        <CategoryManagement />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <ProductManagement productType="pizza" />
      </TabPanel>
      <TabPanel value={value} index={2}>
        <ProductManagement productType="other" />
      </TabPanel>
    </Box>
  );
};

export default Menu;