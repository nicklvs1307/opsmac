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
  ConnectWithoutContact as ConnectWithoutContactIcon,
  PointOfSale as PointOfSaleIcon,
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
      title: t('sidebar.dashboard'),
      icon: <DashboardIcon />,
      path: '/dashboard',
      roles: ['admin', 'owner', 'manager']
    },
    {
      title: t('sidebar.fidelity_program'),
      icon: <CheckinIcon />, // Usando CheckinIcon por enquanto, pode ser alterado
      path: '/fidelity',
      roles: ['admin', 'owner', 'manager'],
      submenu: [
        {
          title: t('sidebar.checkin_program'),
          icon: <CheckinIcon />,
          path: '/fidelity/checkin'
        },
        {
          title: t('sidebar.satisfaction'),
          icon: <PollIcon />,
          path: '/fidelity/satisfaction'
        }
      ]
    },
    
    {
      title: t('sidebar.qr_codes'),
      icon: <QrCodeIcon />,
      path: '/qrcodes',
      roles: ['admin', 'owner', 'manager'],
      submenu: [
        {
          title: t('sidebar.manage_qr_codes'),
          icon: <ListIcon />,
          path: '/qrcodes'
        },
        {
          title: t('sidebar.generate_qr_code'),
          icon: <AddIcon />,
          path: '/qrcodes/new'
        }
      ]
    },
    {
      title: t('sidebar.rewards'),
      icon: <RewardsIcon />,
      path: '/rewards',
      roles: ['admin', 'owner', 'manager']
    },
    {
      title: t('sidebar.coupons'),
      icon: <RewardsIcon />,
      path: '/coupons',
      roles: ['admin', 'owner', 'manager']
    },
    {
      title: t('sidebar.customers'),
      icon: <PeopleIcon />,
      path: '/customers',
      roles: ['admin', 'owner', 'manager'],
      submenu: [
        {
          title: t('sidebar.list_customers'),
          icon: <ListIcon />,
          path: '/customers'
        },
        {
          title: t('sidebar.birthdays'),
          icon: <CardGiftcard />,
          path: '/customers/birthdays'
        },
        {
          title: t('sidebar.customer_dashboard'),
          icon: <AnalyticsIcon />,
          path: '/customers/dashboard'
        }
      ]
    },
    {
      title: t('sidebar.relationship'),
      icon: <ConnectWithoutContactIcon />,
      path: '/relationship',
      roles: ['admin', 'owner', 'manager']
    },
    {
      title: t('sidebar.integrations'),
      icon: <ConnectWithoutContactIcon />,
      path: '/integrations',
      roles: ['admin', 'owner', 'manager']
    },
    {
      title: t('sidebar.erp'),
      icon: <DashboardIcon />,
      path: '/erp',
      roles: ['admin', 'owner', 'manager'],
      submenu: [
        {
          title: t('sidebar.menu'),
          icon: <ListIcon />,
          path: '/erp/menu'
        },
        {
          title: t('sidebar.stock'), // New
          icon: <ListIcon />, // Consider a more specific icon like <InventoryIcon />
          path: '/erp/stock'
        },
        {
          title: t('sidebar.tables'), // New
          icon: <ListIcon />, // Consider a more specific icon like <TableBarIcon />
          path: '/erp/tables'
        },
        {
          title: t('sidebar.pdv'), // New
          icon: <PointOfSaleIcon />,
          path: '/erp/pdv'
        },
        {
          title: t('sidebar.ingredients'), // New
          icon: <ListIcon />,
          path: '/erp/ingredients'
        },
        {
          title: t('sidebar.technical_specifications'), // New
          icon: <ListIcon />,
          path: '/erp/technical-specifications'
        }
      ]
    },
    {
      title: t('sidebar.labels'), // New
      icon: <QrCodeIcon />,
      path: '/labels',
      roles: ['admin', 'owner', 'manager'],
      submenu: [
        {
          title: t('sidebar.labels_dashboard'),
          icon: <DashboardIcon />,
          path: '/labels/dashboard'
        },
        {
          title: t('sidebar.labels_admin'),
          icon: <SettingsIcon />,
          path: '/labels/admin'
        },
        {
          title: t('sidebar.labels_stock_count'),
          icon: <ListIcon />,
          path: '/labels/stock-counts'
        },
        {
          title: t('sidebar.labels_production'),
          icon: <ListIcon />,
          path: '/labels/productions'
        }
      ]
    },
    {
      title: t('sidebar.settings'),
      icon: <SettingsIcon />,
      path: '/settings',
      roles: ['admin', 'owner']
    },
    {
      title: t('sidebar.admin'),
      icon: <DashboardIcon />,
      path: '/admin',
      roles: ['super_admin']
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
                      color: mode === 'light' ? '#333' : 'white', // Ajuste de contraste
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