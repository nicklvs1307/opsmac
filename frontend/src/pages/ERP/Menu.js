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
      <Box className="header">
        <Typography variant="h4" component="h1" gutterBottom>
          {t('menu.title')}
        </Typography>
        <Box className="user-profile">
          <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Usuário" />
          <span>Admin</span>
        </Box>
      </Box>

      {/* Cards Resumo */}
      <Box className="cards">
        <Box className="card">
          <Box className="card-header">
            <span className="card-title">Categorias</span>
            <i className="fas fa-list" style={{ color: 'var(--secondary)' }}></i>
          </Box>
          <Box className="card-value">15</Box>
          <Box className="card-footer">
            <i className="fas fa-arrow-up" style={{ color: 'var(--success)' }}></i>
            <span>+2 este mês</span>
          </Box>
        </Box>

            <Box>
      <Box className="tabs">

        <Box className="card warning">
          <Box className="card-header">
            <span className="card-title">Produtos Inativos</span>
            <i className="fas fa-exclamation-circle" style={{ color: 'var(--warning)' }}></i>
          </Box>
          <Box className="card-value">12</Box>
          <Box className="card-footer">
            <i className="fas fa-arrow-down" style={{ color: 'var(--danger)' }}></i>
            <span>-3 este mês</span>
          </Box>
        </Box>

        <Box className="card danger">
          <Box className="card-header">
            <span className="card-title">Sem Estoque</span>
            <i className="fas fa-times-circle" style={{ color: 'var(--danger)' }}></i>
          </Box>
          <Box className="card-value">5</Box>
          <Box className="card-footer">
            <i className="fas fa-arrow-up" style={{ color: 'var(--danger)' }}></i>
            <span>+2 este mês</span>
          </Box>
        </Box>
      </Box>

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