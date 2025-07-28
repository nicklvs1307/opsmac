import React, { useState } from 'react';
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

const drawerWidth = 280;

const Layout = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(true);
  const { t } = useTranslation();

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
      bgcolor: theme.palette.mode === 'light' 
        ? alpha(theme.palette.background.paper, 0.9) 
        : alpha(theme.palette.background.paper, 0.2),
      backgroundImage: theme.palette.mode === 'light'
        ? 'linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05))'
        : 'linear-gradient(rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.05))'
    }}>
      <Toolbar
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 3,
          py: 2,
          bgcolor: theme.palette.mode === 'light' 
            ? alpha(theme.palette.background.paper, 0.8) 
            : alpha(theme.palette.background.paper, 0.2),
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          backdropFilter: 'blur(8px)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box 
            sx={{
              width: 36,
              height: 36,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              borderRadius: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.4)}`,
              }
            }}
          >
            <Typography 
              variant="h6" 
              sx={{ 
                color: 'white',
                fontWeight: 'bold',
                fontSize: '1.1rem',
                textShadow: '0 1px 2px rgba(0,0,0,0.2)'
              }}
            >
              C
            </Typography>
          </Box>
          <Typography 
            variant="h6" 
            noWrap 
            component="div" 
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 'bold',
              fontSize: '1.2rem',
              letterSpacing: '0.5px'
            }}
          >
            CHECK
          </Typography>
        </Box>
        {!isMobile && (
          <IconButton 
            onClick={handleDrawerToggle}
            sx={{ 
              color: 'text.secondary',
              transition: 'all 0.2s ease',
              '&:hover': {
                color: theme.palette.primary.main,
                transform: 'scale(1.1)',
                backgroundColor: alpha(theme.palette.primary.main, 0.1)
              }
            }}
          >
            <ChevronLeftIcon />
          </IconButton>
        )}
      </Toolbar>
      <Sidebar onMobileClose={handleMobileDrawerClose} />
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
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
          backdropFilter: 'blur(10px)',
          backgroundColor: alpha(theme.palette.background.default, 0.8),
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
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
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
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
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
          minHeight: 'calc(100vh - 64px)',
          backgroundColor: theme.palette.mode === 'light' 
            ? alpha(theme.palette.background.default, 0.5) 
            : alpha(theme.palette.background.default, 0.9),
          borderRadius: { xs: 0, md: desktopOpen ? '24px 0 0 0' : 0 },
          overflow: 'hidden',
          backdropFilter: 'blur(8px)',
          boxShadow: desktopOpen ? `inset 8px 0 16px ${alpha(theme.palette.common.black, 0.05)}` : 'none'
        }}
      >
        <Toolbar /> {/* Spacer for fixed AppBar */}
        <Box sx={{ 
          mt: 2,
          animation: 'fadeIn 0.5s ease-in-out',
          '@keyframes fadeIn': {
            '0%': {
              opacity: 0,
              transform: 'translateY(10px)'
            },
            '100%': {
              opacity: 1,
              transform: 'translateY(0)'
            },
          }
        }}>
          {children || <Outlet />}
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;