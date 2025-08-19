import React from 'react';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

const DashboardContentHeader = () => {
  const { t } = useTranslation();

  return (
    <>
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

        <Box className="card success">
          <Box className="card-header">
            <span className="card-title">Produtos Ativos</span>
            <i className="fas fa-check-circle" style={{ color: 'var(--success)' }}></i>
          </Box>
          <Box className="card-value">87</Box>
          <Box className="card-footer">
            <i className="fas fa-arrow-up" style={{ color: 'var(--success)' }}></i>
            <span>+12 este mês</span>
          </Box>
        </Box>

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
    </>
  );
};

export default DashboardContentHeader;