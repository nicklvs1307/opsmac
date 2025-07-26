import React from 'react';
import { useTheme } from '@mui/material/styles';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Box,
  Tooltip,
  Divider,
  Typography,
  alpha,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Feedback as FeedbackIcon,
  QrCode as QrCodeIcon,
  CardGiftcard as RewardsIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  ExpandLess,
  ExpandMore,
  Add as AddIcon,
  List as ListIcon,
  Analytics as AnalyticsIcon,
  CheckCircleOutline as CheckinIcon,
  CardGiftcard,
  Poll as PollIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

const Sidebar = ({ onMobileClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [openMenus, setOpenMenus] = useState({});
  const theme = useTheme();
  const mode = theme.palette.mode;

  const handleClick = (path) => {
    navigate(path);
    if (onMobileClose) {
      onMobileClose();
    }
  };

  const handleMenuToggle = (menu) => {
    setOpenMenus(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const menuItems = [
    {
      title: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/dashboard',
      roles: ['admin', 'owner', 'manager']
    },
    {
      title: 'Check-in',
      icon: <CheckinIcon />,
      path: '/checkin',
      roles: ['admin', 'owner', 'manager']
    },
    {
      title: 'Feedbacks',
      icon: <FeedbackIcon />,
      path: '/feedback',
      roles: ['admin', 'owner', 'manager'],
      submenu: [
        {
          title: 'Lista de Feedbacks',
          icon: <ListIcon />,
          path: '/feedback'
        },
        {
          title: 'Novo Feedback',
          icon: <AddIcon />,
          path: '/feedback/new'
        }
      ]
    },
    {
      title: 'Pesquisas',
      icon: <PollIcon />,
      path: '/surveys',
      roles: ['admin', 'owner'],
      submenu: [
        {
          title: 'Listar Pesquisas',
          icon: <ListIcon />,
          path: '/surveys'
        },
        {
          title: 'Nova Pesquisa',
          icon: <AddIcon />,
          path: '/surveys/new'
        }
      ]
    },
    {
      title: 'QR Codes',
      icon: <QrCodeIcon />,
      path: '/qrcodes',
      roles: ['admin', 'owner', 'manager'],
      submenu: [
        {
          title: 'Gerenciar QR Codes',
          icon: <ListIcon />,
          path: '/qrcodes'
        },
        {
          title: 'Gerar QR Code',
          icon: <AddIcon />,
          path: '/qrcodes/new'
        }
      ]
    },
    {
      title: 'Recompensas',
      icon: <RewardsIcon />,
      path: '/rewards',
      roles: ['admin', 'owner', 'manager']
    },
    {
      title: 'Cupons',
      icon: <RewardsIcon />,
      path: '/coupons',
      roles: ['admin', 'owner', 'manager']
    },
    {
      title: 'Clientes',
      icon: <PeopleIcon />,
      path: '/customers',
      roles: ['admin', 'owner', 'manager'],
      submenu: [
        {
          title: 'Listar Clientes',
          icon: <ListIcon />,
          path: '/customers'
        },
        {
          title: 'Aniversariantes',
          icon: <CardGiftcard />,
          path: '/customers/birthdays'
        },
        {
          title: 'Dashboard de Clientes',
          icon: <AnalyticsIcon />,
          path: '/customers/dashboard'
        }
      ]
    },
    {
      title: 'Configurações',
      icon: <SettingsIcon />,
      path: '/settings',
      roles: ['admin', 'owner']
    }
  ];

  const filteredMenuItems = menuItems.filter(item => 
    !item.roles || item.roles.includes(user?.role)
  );

  return (
    <Box sx={{ 
      overflow: 'auto', 
      flexGrow: 1, 
      px: 1,
      '&::-webkit-scrollbar': {
        width: '6px',
      },
      '&::-webkit-scrollbar-track': {
        background: 'transparent',
      },
      '&::-webkit-scrollbar-thumb': {
        background: mode === 'light' ? alpha(theme.palette.primary.main, 0.2) : alpha(theme.palette.primary.main, 0.3),
        borderRadius: '10px',
      },
      '&::-webkit-scrollbar-thumb:hover': {
        background: mode === 'light' ? alpha(theme.palette.primary.main, 0.3) : alpha(theme.palette.primary.main, 0.4),
      },
    }}>
      <Box sx={{ 
        p: 2, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        mb: 1,
      }}>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 700, 
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '0.5px',
            textAlign: 'center',
          }}
        >
          {t('sidebar.app_name')}
        </Typography>
      </Box>
      <Divider sx={{ 
        mb: 1,
        borderColor: mode === 'light' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)',
      }} />
      <List sx={{ pt: 1 }}>
        {filteredMenuItems.map((item) => (
          <React.Fragment key={item.title}>
            <ListItem disablePadding sx={{ mb: 0.5 }}>
              <Tooltip title={item.title} placement="right" arrow enterDelay={500}>
                <ListItemButton
                  onClick={() => {
                    if (item.submenu) {
                      handleMenuToggle(item.title);
                    } else {
                      handleClick(item.path);
                    }
                  }}
                  selected={!item.submenu && isActive(item.path)}
                  sx={{
                    minHeight: 48,
                    borderRadius: 2,
                    mx: 1,
                    position: 'relative',
                    transition: 'all 0.2s ease',
                    '&.Mui-selected': {
                      background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                      color: 'white',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                      transform: 'translateY(-1px)',
                      '&:hover': {
                        background: `linear-gradient(90deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                      },
                      '& .MuiListItemIcon-root': {
                        color: 'white',
                      },
                    },
                    '&:hover': {
                      backgroundColor: mode === 'light' ? alpha(theme.palette.primary.main, 0.08) : alpha(theme.palette.primary.main, 0.15),
                      borderRadius: 2,
                      transform: 'translateX(4px)',
                    },
                    '&::before': isActive(item.path) && !item.submenu ? {
                      content: '""',
                      position: 'absolute',
                      left: '-8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      height: '60%',
                      width: '4px',
                      backgroundColor: theme.palette.primary.main,
                      borderRadius: '0 4px 4px 0',
                    } : {},
                  }}
                >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: 2,
                    justifyContent: 'center',
                    color: isActive(item.path) ? 'white' : 'text.secondary',
                    transition: 'all 0.3s ease',
                    transform: isActive(item.path) ? 'scale(1.1)' : 'scale(1)',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.title}
                  primaryTypographyProps={{
                    fontSize: '0.875rem',
                    fontWeight: isActive(item.path) ? 600 : 500,
                    color: isActive(item.path) ? 'white' : 'text.primary',
                    letterSpacing: isActive(item.path) ? '0.3px' : 'normal',
                    transition: 'all 0.2s ease',
                  }}
                />
                {item.submenu && (
                  openMenus[item.title] ? 
                    <ExpandLess sx={{ 
                      color: isActive(item.path) ? 'white' : 'text.secondary',
                      transition: 'transform 0.3s ease',
                      transform: 'rotate(0deg)',
                    }} /> : 
                    <ExpandMore sx={{ 
                      color: isActive(item.path) ? 'white' : 'text.secondary',
                      transition: 'transform 0.3s ease',
                      transform: 'rotate(0deg)',
                    }} />
                )}
              </ListItemButton>
              </Tooltip>
            </ListItem>
            
            {item.submenu && (
              <Collapse in={openMenus[item.title]} timeout="auto" unmountOnExit>
                <List component="div" disablePadding sx={{ ml: 2, mt: 0.5 }}>
                  {item.submenu.map((subItem) => (
                    <ListItem key={subItem.title} disablePadding sx={{ mb: 0.5 }}>
                      <Tooltip title={subItem.title} placement="right" arrow enterDelay={500}>
                        <ListItemButton
                          onClick={() => handleClick(subItem.path)}
                          selected={isActive(subItem.path)}
                          sx={{
                            pl: 3,
                            minHeight: 40,
                            borderRadius: 2,
                            mx: 1,
                            transition: 'all 0.2s ease',
                            '&.Mui-selected': {
                              background: `linear-gradient(90deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
                              color: 'white',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                              transform: 'translateY(-1px)',
                              '&:hover': {
                                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                              },
                              '& .MuiListItemIcon-root': {
                                color: 'white',
                              },
                            },
                            '&:hover': {
                              backgroundColor: mode === 'light' ? alpha(theme.palette.primary.main, 0.05) : alpha(theme.palette.primary.main, 0.1),
                              borderRadius: 2,
                              transform: 'translateX(4px)',
                            },
                            '&::before': isActive(subItem.path) ? {
                              content: '""',
                              position: 'absolute',
                              left: '-4px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              height: '40%',
                              width: '3px',
                              backgroundColor: theme.palette.primary.light,
                              borderRadius: '0 4px 4px 0',
                            } : {},
                          }}
                        >
                          <ListItemIcon
                            sx={{
                              minWidth: 0,
                              mr: 2,
                              justifyContent: 'center',
                              color: isActive(subItem.path) ? 'white' : 'text.secondary',
                              transition: 'all 0.3s ease',
                              transform: isActive(subItem.path) ? 'scale(1.1)' : 'scale(1)',
                              fontSize: '0.9rem',
                            }}
                          >
                            {subItem.icon}
                          </ListItemIcon>
                          <ListItemText 
                            primary={subItem.title}
                            primaryTypographyProps={{
                              fontSize: '0.8125rem',
                              fontWeight: isActive(subItem.path) ? 600 : 500,
                              color: isActive(subItem.path) ? 'white' : 'text.primary',
                              letterSpacing: isActive(subItem.path) ? '0.2px' : 'normal',
                              transition: 'all 0.2s ease',
                            }}
                          />
                        </ListItemButton>
                      </Tooltip>
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            )}
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
};

export default Sidebar;