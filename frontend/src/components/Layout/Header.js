import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Typography,
  Divider,
  ListItemIcon,
  Tooltip,
  alpha,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

const Header = ({ onMobileNavOpen }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const theme = useTheme();
  
  useEffect(() => {
    setNotificationsOpen(Boolean(notificationsAnchorEl));
  }, [notificationsAnchorEl]);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationsClose = () => {
    setNotificationsAnchorEl(null);
  };

  const handleNavigate = (path) => {
    navigate(path);
    handleProfileMenuClose();
  };

  const handleLogout = () => {
    logout();
    handleProfileMenuClose();
    navigate('/login');
  };

  const isProfileMenuOpen = Boolean(anchorEl);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        height: '100%',
        width: '100%',
        px: 1,
      }}
    >
      {/* Left side - could add breadcrumbs or page title here */}
      <Box>
        <Typography variant="h6" component="div">
          {/* Dynamic page title could go here */}
        </Typography>
      </Box>

      {/* Right side - user info and menu */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {/* User Info */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
            <Typography 
              variant="body2" 
              sx={{ 
                color: theme.palette.text.primary,
                fontWeight: 600,
                lineHeight: 1.2
              }}
            >
              {user?.name || 'João Silva'}
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: theme.palette.text.secondary,
                fontSize: '0.75rem'
              }}
            >
              {user?.role === 'admin' ? t('header.admin_role') : t('header.user_role')}
            </Typography>
          </Box>
          
          {/* User Avatar */}
          <Tooltip title={t('header.profile_tooltip')}>
            <IconButton
              onClick={handleProfileMenuOpen}
              sx={{ p: 0 }}
            >
              <Avatar
                alt={user?.name || t('header.user_placeholder')}
                src={user?.restaurant?.logo || user?.avatar}
                sx={{ 
                  width: 40, 
                  height: 40,
                  bgcolor: 'primary.light',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '1rem'
                }}
              >
                {!user?.restaurant?.logo && (user?.name || t('header.user_placeholder')).charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
          </Tooltip>
        </Box>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={isProfileMenuOpen}
        onClose={handleProfileMenuClose}
        onClick={handleProfileMenuClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            minWidth: 200,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography 
            variant="subtitle1" 
            noWrap 
            sx={{ 
              fontWeight: 600,
              color: theme.palette.text.primary,
            }}
          >
            {user?.name || t('header.user_placeholder')}
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: theme.palette.text.secondary,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
            }} 
            noWrap
          >
            <Box 
              component="span" 
              sx={{ 
                width: 8, 
                height: 8, 
                borderRadius: '50%', 
                backgroundColor: theme.palette.success.main,
                display: 'inline-block',
              }} 
            />
            {user?.email || t('header.email_placeholder')}
          </Typography>
        </Box>
        <Divider />
        <MenuItem onClick={() => handleNavigate('/profile')} sx={{ py: 1 }}>
          <ListItemIcon>
            <PersonIcon fontSize="small" sx={{ color: theme.palette.primary.main }} />
          </ListItemIcon>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {t('header.profile_menu_title')}
          </Typography>
        </MenuItem>
        <MenuItem onClick={() => handleNavigate('/settings')} sx={{ py: 1 }}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" sx={{ color: theme.palette.info.main }} />
          </ListItemIcon>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {t('header.settings_menu_title')}
          </Typography>
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem onClick={handleLogout} sx={{ py: 1 }}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" sx={{ color: theme.palette.error.main }} />
          </ListItemIcon>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {t('header.logout_menu_title')}
          </Typography>
        </MenuItem>
      </Menu>

      {/* Notifications Menu */}
      <Menu
        anchorEl={notificationsAnchorEl}
        id="notifications-menu"
        open={notificationsOpen}
        onClose={handleNotificationsClose}
        onClick={handleNotificationsClose}
        PaperProps={{
          elevation: 8,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            width: 320,
            borderRadius: 2,
            maxHeight: 400,
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
            '& .MuiMenuItem-root': {
              transition: 'background-color 0.2s ease',
              borderRadius: 1,
              mx: 0.5,
              my: 0.25,
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
              },
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{t('header.notifications_title')}</Typography>
          <Typography 
            variant="caption" 
            sx={{ 
              color: 'white', 
              bgcolor: theme.palette.primary.main, 
              px: 1, 
              py: 0.5, 
              borderRadius: 10,
              fontWeight: 500,
            }}
          >
            {t('header.notifications_count', { count: 3 })}
          </Typography>
        </Box>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem sx={{ py: 1.5 }}>
          <Box sx={{ width: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
              {t('header.notifications_count', { count: 3 })}
          </Typography>
        </Box>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem sx={{ py: 1.5 }}>
          <Box sx={{ width: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                {t('header.new_feedback_title')}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {t('header.new_feedback_time')}
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
              {t('header.new_feedback_description')}
            </Typography>
          </Box>
        </MenuItem>
        <MenuItem sx={{ py: 1.5 }}>
          <Box sx={{ width: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.success.main }}>
                {t('header.new_coupon_title')}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {t('header.new_coupon_time')}
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
              {t('header.new_coupon_description')}
            </Typography>
          </Box>
        </MenuItem>
        <MenuItem sx={{ py: 1.5 }}>
          <Box sx={{ width: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.warning.main }}>
                {t('header.nps_alert_title')}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {t('header.nps_alert_time')}
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
              {t('header.nps_alert_description')}
            </Typography>
          </Box>
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <Box sx={{ textAlign: 'center', p: 1.5 }}>
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'primary.main', 
              cursor: 'pointer',
              fontWeight: 500,
              '&:hover': {
                textDecoration: 'underline',
              },
              transition: 'all 0.2s ease',
            }}
          >
            {t('header.view_all_notifications')}
          </Typography>
        </Box>
      </Menu>
    </Box>
  </Box>
  );
};

export default Header;