
import React, { useState, useRef } from 'react';
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
  useMediaQuery,
  Popper,
  Paper,
  Grow,
  ClickAwayListener,
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
  ChevronRight,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

// Componente recursivo para os submenus flutuantes
const Submenu = ({ items, parentEl, onClose, level = 0 }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const [openSubmenu, setOpenSubmenu] = useState({ anchor: null, items: [] });

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const handleSubmenuEnter = (event, submenuItems) => {
    if (submenuItems && submenuItems.length > 0) {
      setOpenSubmenu({ anchor: event.currentTarget, items: submenuItems });
    }
  };

  const handleSubmenuLeave = () => {
    setOpenSubmenu({ anchor: null, items: [] });
  };

  const handleItemClick = (path) => {
    navigate(path);
    onClose(); // Fecha toda a cadeia de submenus
  };

  return (
    <>
      <Popper
        open={Boolean(parentEl)}
        anchorEl={parentEl}
        placement="right-start"
        transition
        modifiers={[
          {
            name: 'offset',
            options: {
              offset: [0, 2],
            },
          },
        ]}
        style={{ zIndex: 2000 }}
        onMouseLeave={handleSubmenuLeave}
      >
        {({ TransitionProps }) => (
          <Grow {...TransitionProps} timeout={350}>
            <Paper 
              elevation={8}
              sx={{ 
                minWidth: 220, 
                borderRadius: 2,
                boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
                background: theme.palette.background.paper,
              }}
            >
              <List component="div" disablePadding>
                {items.map((item) => (
                  <ListItem 
                    key={item.title} 
                    disablePadding 
                    onMouseEnter={(e) => handleSubmenuEnter(e, item.submenu)}
                  >
                    <ListItemButton
                      onClick={() => handleItemClick(item.path)}
                      selected={isActive(item.path)}
                      sx={{ 
                        pl: 2.5, 
                        pr: 1.5,
                        minHeight: 40,
                        m: 0.5,
                        borderRadius: 1.5,
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 32 }}>{item.icon}</ListItemIcon>
                      <ListItemText primary={item.title} primaryTypographyProps={{ fontSize: '0.875rem' }} />
                      {item.submenu && <ChevronRight sx={{ fontSize: '1.2rem', color: 'text.secondary' }} />}
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grow>
        )}
      </Popper>
      {openSubmenu.anchor && (
        <Submenu
          items={openSubmenu.items}
          parentEl={openSubmenu.anchor}
          onClose={onClose}
          level={level + 1}
        />
      )}
    </>
  );
};


const Sidebar = ({ onMobileClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [openMobileMenus, setOpenMobileMenus] = useState({});
  const [openPopper, setOpenPopper] = useState({ anchor: null, items: [] });
  const theme = useTheme();
  const mode = theme.palette.mode;
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const sidebarRef = useRef(null);

  const handleClick = (path) => {
    navigate(path);
    if (onMobileClose) {
      onMobileClose();
    }
  };

  const handleMenuToggle = (event, item) => {
    if (isDesktop) {
      if (item.submenu) {
        setOpenPopper({ anchor: event.currentTarget, items: item.submenu });
      } else {
        handleClick(item.path);
        handlePopperClose();
      }
    } else {
      // Lógica para mobile (Collapse)
      if (item.submenu) {
        setOpenMobileMenus(prev => ({ ...prev, [item.title]: !prev[item.title] }));
      } else {
        handleClick(item.path);
      }
    }
  };

  const handlePopperClose = () => {
    setOpenPopper({ anchor: null, items: [] });
  };

  const isActive = (path) => {
    if (!path) return false;
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
      icon: <CheckinIcon />,
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
          title: t('sidebar.erp_menu'),
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
          title: t('sidebar.orders'), // New
          icon: <ListIcon />, // Consider a more specific icon
          path: '/erp/orders'
        },
        {
          title: t('sidebar.technical_specifications'), // New
          icon: <ListIcon />,
          path: '/erp/technical-specifications'
        },
        {
          title: t('sidebar.team'),
          icon: <PeopleIcon />,
          path: '/team'
        },
        {
          title: t('sidebar.financial'),
          icon: <PointOfSaleIcon />, // Using PointOfSaleIcon for financial, can be changed
          path: '/erp/financial-transactions', // Corrected path
          submenu: [
            {
              title: t('sidebar.financial_transactions'),
              icon: <ListIcon />,
              path: '/erp/financial-transactions'
            },
            {
              title: t('sidebar.payment_methods'),
              icon: <ListIcon />,
              path: '/erp/payment-methods'
            },
            {
              title: t('sidebar.reports'),
              icon: <AnalyticsIcon />,
              path: '/reports',
              submenu: [
                {
                  title: t('sidebar.cash_flow_report'),
                  icon: <ListIcon />,
                  path: '/reports/cash-flow'
                },
                {
                  title: t('sidebar.dre_report'),
                  icon: <ListIcon />,
                  path: '/reports/dre'
                },
                {
                  title: t('sidebar.sales_by_payment_method_report'),
                  icon: <ListIcon />,
                  path: '/reports/sales-by-payment-method'
                },
                {
                  title: t('sidebar.list_of_accounts_report'),
                  icon: <ListIcon />,
                  path: '/reports/list-of-accounts'
                },
                {
                  title: t('sidebar.current_stock_position_report'),
                  icon: <ListIcon />,
                  path: '/reports/current-stock-position'
                },
                {
                  title: t('sidebar.stock_position_history_report'),
                  icon: <ListIcon />,
                  path: '/reports/stock-position-history'
                },
                {
                  title: t('sidebar.generated_coupons_report'),
                  icon: <ListIcon />,
                  path: '/reports/generated-coupons'
                }
              ]
            }
          ]
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
    <ClickAwayListener onClickAway={handlePopperClose}>
      <Box 
        ref={sidebarRef}
        sx={{ 
          overflow: 'auto', 
          flexGrow: 1, 
          px: 1,
          '&::-webkit-scrollbar': { width: '6px' },
          '&::-webkit-scrollbar-track': { background: 'transparent' },
          '&::-webkit-scrollbar-thumb': {
            background: mode === 'light' ? alpha(theme.palette.primary.main, 0.2) : alpha(theme.palette.primary.main, 0.3),
            borderRadius: '10px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: mode === 'light' ? alpha(theme.palette.primary.main, 0.3) : alpha(theme.palette.primary.main, 0.4),
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
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
        <Divider sx={{ mb: 1, borderColor: mode === 'light' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)' }} />
        
        <List sx={{ pt: 1 }} onMouseLeave={isDesktop ? handlePopperClose : undefined}>
          {filteredMenuItems.map((item) => (
            <React.Fragment key={item.title}>
              <ListItem disablePadding sx={{ mb: 0.5 }}>
                <Tooltip title={item.title} placement="right" arrow enterDelay={500}>
                  <ListItemButton
                    onClick={(event) => handleMenuToggle(event, item)}
                    onMouseEnter={(event) => isDesktop && item.submenu && handleMenuToggle(event, item)}
                    selected={!item.submenu && isActive(item.path)}
                    sx={{
                      minHeight: 48,
                      borderRadius: 2,
                      mx: 1,
                      transition: 'all 0.2s ease',
                      '&.Mui-selected': {
                        background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                        color: 'white',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                        transform: 'translateY(-1px)',
                        '&:hover': {
                          background: `linear-gradient(90deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                        },
                        '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
                          color: 'white',
                        },
                      },
                      '&:hover': {
                        backgroundColor: mode === 'light' ? alpha(theme.palette.primary.main, 0.08) : alpha(theme.palette.primary.main, 0.15),
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
                        color: isActive(item.path) && !item.submenu ? 'white' : 'text.secondary',
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.title}
                      primaryTypographyProps={{
                        fontSize: '0.875rem',
                        fontWeight: isActive(item.path) && !item.submenu ? 600 : 500,
                      }}
                    />
                    {item.submenu && (
                      isDesktop ? 
                        <ChevronRight sx={{ color: 'text.secondary', transition: 'transform 0.3s ease' }} /> :
                        (openMobileMenus[item.title] ? <ExpandLess /> : <ExpandMore />)
                    )}
                  </ListItemButton>
                </Tooltip>
              </ListItem>
              
              {!isDesktop && item.submenu && (
                <Collapse in={openMobileMenus[item.title]} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding sx={{ ml: 2, mt: 0.5 }}>
                    {item.submenu.map((subItem) => (
                      <ListItem key={subItem.title} disablePadding sx={{ mb: 0.5 }}>
                        <Tooltip title={subItem.title} placement="right" arrow enterDelay={500}>
                          <ListItemButton
                            onClick={() => handleClick(subItem.path)}
                            selected={isActive(subItem.path)}
                            sx={{ pl: 3, minHeight: 40, borderRadius: 2, mx: 1 }}
                          >
                            <ListItemIcon sx={{ minWidth: 0, mr: 2, justifyContent: 'center' }}>
                              {subItem.icon}
                            </ListItemIcon>
                            <ListItemText 
                              primary={subItem.title}
                              primaryTypographyProps={{ fontSize: '0.8125rem' }}
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
        
        {isDesktop && openPopper.anchor && (
          <Submenu 
            items={openPopper.items}
            parentEl={openPopper.anchor}
            onClose={handlePopperClose}
          />
        )}
      </Box>
    </ClickAwayListener>
  );
};

export default Sidebar;
