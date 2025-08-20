import CategoryManagement from '../../components/ERP/CategoryManagement';
import ProductManagement from '../../components/ERP/ProductManagement';
import AddonManagement from '../../components/ERP/AddonManagement';
import React, { useState } from 'react';
import { Box, Typography, Tabs, Tab } from '@mui/material';
import { useTranslation } from 'react-i18next';
import '../../assets/css/dashboard-layout.css';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      className={`tab-content ${value === index ? 'active' : ''}`}
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
      <Box className="tabs">
        <Tabs value={value} onChange={handleChange} aria-label="menu tabs">
          <Tab className={`tab ${value === 0 ? 'active' : ''}`} label={t('menu.tabs.categories')} {...a11yProps(0)} />
          <Tab className={`tab ${value === 1 ? 'active' : ''}`} label={t('menu.tabs.pizzas')} {...a11yProps(1)} />
          <Tab className={`tab ${value === 2 ? 'active' : ''}`} label={t('menu.tabs.other_products')} {...a11yProps(2)} />
          <Tab className={`tab ${value === 3 ? 'active' : ''}`} label={t('menu.tabs.addons')} {...a11yProps(3)} />
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
      <TabPanel value={value} index={3}>
        <AddonManagement />
      </TabPanel>
    </Box>
  );
};

export default Menu;