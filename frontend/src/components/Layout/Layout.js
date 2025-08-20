import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  useTheme,
  useMediaQuery,
  alpha,
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
} from '@mui/icons-material';

import Sidebar from './Sidebar';
import Header from './Header';
import DashboardContentHeader from './DashboardContentHeader';

const drawerWidth = 250;

const Layout = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    document.body.style.backgroundColor = '#f5f7fa';
    document.body.style.color = 'var(--dark)';
    document.body.style.display = 'flex';
    document.body.style.minHeight = '100vh';
  }, []);

  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setDesktopOpen(!desktopOpen);
    }
  };

  const handleMobileDrawerClose = () => {
    setMobileOpen(false);
  };

  const drawer = (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      bgcolor: theme.palette.primary.main,
    }}>
      <Toolbar
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 3,
          py: 2,
          borderBottom: `1px solid rgba(255,255,255,0.1)`,
          marginBottom: '20px',
        }}
        className="logo"
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography 
            variant="h6" 
            sx={{ 
              color: 'white',
              fontWeight: 'bold',
              fontSize: '1.1rem',
              textShadow: '0 1px 2px rgba(0,0,0,0.2)'
            }}
          >
            <i className="fas fa-utensils" style={{ marginRight: '10px', color: 'var(--secondary)' }}></i>
            <span>{t('layout.app_name')}</span>
          </Typography>
        </Box>
      </Toolbar>
      <Sidebar onMobileClose={handleMobileDrawerClose} />
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', height: '100%' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: {
            md: desktopOpen ? `calc(100% - ${drawerWidth}px)` : '100%',
          },
          ml: {
            md: desktopOpen ? `${drawerWidth}px` : 0,
          },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.easeInOut,
            duration: theme.transitions.duration.standard,
          }),
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <Toolbar>
          <IconButton
            color="primary"
            aria-label={t('layout.open_drawer_aria_label')}
            edge="start"
            onClick={handleDrawerToggle}
            sx={{
              marginRight: 2,
              display: {
                md: desktopOpen ? 'none' : 'block',
              },
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'scale(1.1)',
                backgroundColor: alpha(theme.palette.primary.main, 0.1)
              }
            }}
          >
            <MenuIcon />
          </IconButton>
          <Header />
        </Toolbar>
      </AppBar>

      {/* Navigation Drawer */}
      <Box
        component="nav"
        sx={{
          width: { md: desktopOpen ? drawerWidth : 0 },
          flexShrink: { md: 0 },
        }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleMobileDrawerClose}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              backgroundImage: theme.palette.mode === 'light'
                ? 'linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05))'
                : 'linear-gradient(rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.05))'
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop drawer */}
        <Drawer
          variant="persistent"
          open={desktopOpen}
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.easeInOut,
                duration: theme.transitions.duration.standard,
              }),
              borderRight: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: {
            md: desktopOpen ? `calc(100% - ${drawerWidth}px)` : '100%',
          },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.easeInOut,
            duration: theme.transitions.duration.standard,
          }),
        }}
      >
        <DashboardContentHeader />
        <Toolbar /> {/* Spacer for fixed AppBar */}
        <Box>
          {children || <Outlet />}
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;