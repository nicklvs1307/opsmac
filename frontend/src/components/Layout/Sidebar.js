import React, { useState } from 'react';
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
  useMediaQuery,
  Popper,
  Paper,
  Grow,
  ClickAwayListener,
} from '@mui/material';
import { ExpandLess, ExpandMore, ChevronRight } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/app/providers/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { menuStructure } from './menuStructure'; // Importa a estrutura completa do menu

// Componente recursivo para os submenus flutuantes
const Submenu = ({ items, parentEl, onClose, level = 0 }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const [openSubmenu, setOpenSubmenu] = useState({ anchor: null, items: [] });

  const isActive = (path) =>
    location.pathname === path || (path && location.pathname.startsWith(path));

  const handleSubmenuToggle = (event, submenuItems) => {
    event.stopPropagation();

    if (submenuItems && submenuItems.length > 0) {
      if (openSubmenu.anchor === event.currentTarget) {
        setOpenSubmenu({ anchor: null, items: [] });
      } else {
        setOpenSubmenu({ anchor: event.currentTarget, items: submenuItems });
      }
    }
  };

  const handleItemClick = (path) => {
    if (path) {
      navigate(path);
    }
    onClose();
  };

  return (
    <>
      <Popper
        open={Boolean(parentEl)}
        anchorEl={parentEl}
        placement="right-start"
        transition
        modifiers={[{ name: 'offset', options: { offset: [0, 2] } }]}
        style={{ zIndex: 2000 + level }}
      >
        {({ TransitionProps }) => (
          <Grow {...TransitionProps} timeout={250}>
            <Paper
              elevation={8}
              sx={{
                minWidth: 220,
                borderRadius: 2,
                boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
                background: theme.palette.background.paper,
                mt: -1,
              }}
            >
              <List component="div" disablePadding>
                {items.map((item) => (
                  <ListItem key={item.title} disablePadding>
                    <ListItemButton
                      onClick={(e) =>
                        item.submenu
                          ? handleSubmenuToggle(e, item.submenu)
                          : handleItemClick(item.path)
                      }
                      selected={isActive(item.path)}
                      sx={{ pl: 2.5, pr: 1.5, minHeight: 40, m: 0.5, borderRadius: 1.5 }}
                    >
                      {item.icon && <ListItemIcon sx={{ minWidth: 32 }}>{item.icon}</ListItemIcon>}
                      <ListItemText
                        primary={item.title}
                        primaryTypographyProps={{ fontSize: '0.875rem' }}
                      />
                      {item.submenu && (
                        <ChevronRight sx={{ fontSize: '1.2rem', color: 'text.secondary' }} />
                      )}
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
  const { user, allowedModules } = useAuth(); // Pega os módulos permitidos do contexto
  const { t } = useTranslation();
  const [openMobileMenus, setOpenMobileMenus] = useState({});
  const [openPopper, setOpenPopper] = useState({ anchor: null, items: [] });
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  const filterMenu = (menu, allowedModules, userRole) => {
    return menu.reduce((acc, item) => {
      const moduleMatch = !item.module || (allowedModules && allowedModules.includes(item.module));
      const isSuperAdmin = userRole?.name === 'super_admin';
      const roleMatch = isSuperAdmin || (item.roles && item.roles.includes(user?.role?.name));

      if (moduleMatch && roleMatch) {
        if (item.submenu) {
          const filteredSubmenu = filterMenu(item.submenu, allowedModules, userRole);
          if (filteredSubmenu.length > 0) {
            acc.push({ ...item, submenu: filteredSubmenu });
          }
        } else {
          acc.push(item);
        }
      }
      return acc;
    }, []);
  };

  const filteredMenuItems = filterMenu(menuStructure, allowedModules, user?.role);

  const handleClick = (path) => {
    if (path) {
      navigate(path);
    }
    if (onMobileClose) {
      onMobileClose();
    }
  };

  const handleMenuToggle = (event, item) => {
    if (isDesktop) {
      if (item.submenu) {
        if (openPopper.anchor === event.currentTarget) {
          handlePopperClose();
        } else {
          setOpenPopper({ anchor: event.currentTarget, items: item.submenu });
        }
      } else {
        handleClick(item.path);
        handlePopperClose();
      }
    } else {
      if (item.submenu) {
        setOpenMobileMenus((prev) => ({ ...prev, [item.title]: !prev[item.title] }));
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
    return location.pathname === path || location.pathname.startsWith(path);
  };

  return (
    <ClickAwayListener onClickAway={handlePopperClose}>
      <Box sx={{ overflow: 'auto', flexGrow: 1, px: 1 }}>
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {t('sidebar.app_name')}
          </Typography>
        </Box>
        <Divider sx={{ mb: 1 }} />
        <List sx={{ pt: 1 }}>
          {filteredMenuItems.map((item) => (
            <React.Fragment key={item.title}>
              <ListItem disablePadding sx={{ mb: 0.5 }}>
                <Tooltip title={item.title} placement="right" arrow enterDelay={500}>
                  <ListItemButton
                    onClick={(event) => handleMenuToggle(event, item)}
                    selected={!item.submenu && isActive(item.path)}
                    sx={{ minHeight: 48, borderRadius: 2, mx: 1 }}
                  >
                    <ListItemIcon sx={{ minWidth: 0, mr: 2, justifyContent: 'center' }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.title}
                      primaryTypographyProps={{ fontSize: '0.875rem' }}
                    />
                    {item.submenu &&
                      (isDesktop ? (
                        <ChevronRight />
                      ) : openMobileMenus[item.title] ? (
                        <ExpandLess />
                      ) : (
                        <ExpandMore />
                      ))}
                  </ListItemButton>
                </Tooltip>
              </ListItem>
              {!isDesktop && item.submenu && (
                <Collapse in={openMobileMenus[item.title]} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding sx={{ ml: 2 }}>
                    {item.submenu.map((subItem) => (
                      <ListItemButton
                        key={subItem.title}
                        onClick={() => handleClick(subItem.path)}
                        sx={{ pl: 4 }}
                      >
                        <ListItemIcon>{subItem.icon}</ListItemIcon>
                        <ListItemText primary={subItem.title} />
                      </ListItemButton>
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
