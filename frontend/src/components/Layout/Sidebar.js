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
import { menuStructure } from './menuStructure';
import usePermissions from '@/hooks/usePermissions';
import { Lock } from '@mui/icons-material'; // Import Lock icon

const findFirstAccessiblePath = (item) => {
  if (!item || !item.hasAccess) {
    return null;
  }
  if (item.path) {
    return item.path;
  }
  if (item.submenu) {
    // Use submenu instead of submodules and features
    for (const subItem of item.submenu) {
      const path = findFirstAccessiblePath(subItem);
      if (path) {
        return path;
      }
    }
  }
  return null;
};

const Submenu = ({ items: parentItem, parentEl, onClose, level = 0, can }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const [openSubmenu, setOpenSubmenu] = useState({ anchor: null, items: [] });

  const isActive = (path) =>
    location.pathname === path || (path && location.pathname.startsWith(path));

  const handleSubmenuToggle = (event, item) => {
    event.stopPropagation();

    if (!item.hasAccess && !item.isLocked) {
      // Only allow toggle if hasAccess or isLocked
      return;
    }

    const hasChildren = item.submenu && item.submenu.length > 0;

    if (hasChildren) {
      if (openSubmenu.anchor === event.currentTarget) {
        setOpenSubmenu({ anchor: null, items: [] });
      } else {
        setOpenSubmenu({ anchor: event.currentTarget, items: item }); // Pass the item itself
      }
    }
  };

  const handleItemClick = (item) => {
    if (item.hasAccess && item.path) {
      navigate(item.path);
    }
    onClose();
  };

  const renderMenuItem = (item) => {
    const hasChildren = item.submenu && item.submenu.length > 0;

    return (
      <ListItem key={item.name || item.title} disablePadding>
        <ListItemButton
          onClick={(e) => (hasChildren ? handleSubmenuToggle(e, item) : handleItemClick(item))}
          selected={isActive(item.path)}
          sx={{ pl: 2.5 + level * 1.5, pr: 1.5, minHeight: 40, m: 0.5, borderRadius: 1.5 }}
          disabled={!item.hasAccess}
        >
          {item.icon && <ListItemIcon sx={{ minWidth: 32 }}>{item.icon}</ListItemIcon>}
          <ListItemText
            primary={item.displayName || item.title}
            primaryTypographyProps={{ fontSize: '0.875rem' }}
          />
          {!item.hasAccess && item.isLocked && (
            <Lock sx={{ fontSize: '1rem', color: 'text.disabled', ml: 1 }} />
          )}
          {hasChildren && <ChevronRight sx={{ fontSize: '1.2rem', color: 'text.secondary' }} />}
        </ListItemButton>
        {hasChildren && openSubmenu.anchor && openSubmenu.items.name === item.name && (
          <Submenu
            items={openSubmenu.items}
            parentEl={openSubmenu.anchor}
            onClose={onClose}
            level={level + 1}
            can={can}
          />
        )}
      </ListItem>
    );
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
                {(parentItem.submenu || []).map(renderMenuItem)}
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
          can={can}
        />
      )}
    </>
  );
};

const Sidebar = ({ onMobileClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [openMobileMenus, setOpenMobileMenus] = useState({});
  const [openPopper, setOpenPopper] = useState({ anchor: null, items: [] });
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  const { can } = usePermissions();

  const filterAndMapMenuItems = (items) => {
    return items
      .map((item) => {
        let hasAccess = true;
        let isLocked = false; // To indicate if a module is locked (not just no access)

        if (item.module) {
          // Check module access
          hasAccess = can(item.module, 'read');
          // Assuming 'locked' status comes from the permission snapshot for modules
          // This would need to be passed down from AuthContext or fetched here
          // For now, we'll just use 'hasAccess'
          isLocked = !hasAccess; // Simplified: if no access, consider it locked for display purposes
        } else if (item.featureKey && item.actionKey) {
          // Check feature access
          hasAccess = can(item.featureKey, item.actionKey);
        }

        const newItem = { ...item, hasAccess, isLocked };

        if (item.submenu) {
          newItem.submenu = filterAndMapMenuItems(newItem.submenu);
          // If a parent has no access, its children also effectively have no access
          if (!hasAccess) {
            newItem.submenu.forEach((sub) => {
              sub.hasAccess = false;
              sub.isLocked = true;
            });
          }
        }

        return newItem;
      })
      .filter((item) => item.hasAccess || item.isLocked); // Keep locked items to display lock icon
  };

  const filteredMenuItems = filterAndMapMenuItems(menuStructure);

  const handleClick = (item) => {
    if (item.hasAccess && item.path) {
      navigate(item.path);
    }
    if (onMobileClose) {
      onMobileClose();
    }
  };

  const handleMenuToggle = (event, item) => {
    if (!item.hasAccess && !item.isLocked) {
      // Only allow toggle if hasAccess or isLocked
      return;
    }

    const hasChildren = item.submenu && item.submenu.length > 0;

    if (isDesktop) {
      if (hasChildren) {
        if (openPopper.anchor === event.currentTarget) {
          handlePopperClose();
        } else {
          setOpenPopper({ anchor: event.currentTarget, items: item });
        }
      } else {
        handleClick(item);
        handlePopperClose();
      }
    } else {
      if (hasChildren) {
        setOpenMobileMenus((prev) => ({ ...prev, [item.name]: !prev[item.name] }));
      } else {
        handleClick(item);
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
          {filteredMenuItems.map((moduleItem) => (
            <React.Fragment key={moduleItem.name}>
              <ListItem disablePadding sx={{ mb: 0.5 }}>
                <Tooltip title={moduleItem.displayName || moduleItem.title} placement="right" arrow enterDelay={500}>
                  <ListItemButton
                    onClick={(event) => handleMenuToggle(event, moduleItem)}
                    selected={isActive(moduleItem.path)}
                    sx={{ minHeight: 48, borderRadius: 2, mx: 1 }}
                    disabled={!moduleItem.hasAccess} // Disable if no access
                  >
                    <ListItemIcon sx={{ minWidth: 0, mr: 2, justifyContent: 'center' }}>
                      {/* Assuming modules still have icons, otherwise provide a default or handle null */}
                      {moduleItem.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={moduleItem.displayName || moduleItem.title}
                      primaryTypographyProps={{ fontSize: '0.875rem' }}
                    />
                    {!moduleItem.hasAccess && (
                      <Lock sx={{ fontSize: '1rem', color: 'text.disabled', ml: 1 }} />
                    )}
                    {moduleItem.submenu &&
                      moduleItem.submenu.length > 0 &&
                      (isDesktop ? (
                        <ChevronRight />
                      ) : openMobileMenus[moduleItem.name] ? (
                        <ExpandLess />
                      ) : (
                        <ExpandMore />
                      ))}
                  </ListItemButton>
                </Tooltip>
              </ListItem>
              {!isDesktop && moduleItem.submenu && moduleItem.submenu.length > 0 && (
                <Collapse in={openMobileMenus[moduleItem.name]} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding sx={{ ml: 2 }}>
                    {moduleItem.submenu.map((subItem) => (
                      <React.Fragment key={subItem.name}>
                        <ListItem disablePadding>
                          <ListItemButton
                            onClick={(event) => handleMenuToggle(event, subItem)}
                            sx={{ pl: 4, minHeight: 40, m: 0.5, borderRadius: 1.5 }}
                            disabled={!subItem.hasAccess}
                          >
                            <ListItemIcon sx={{ minWidth: 32 }}>{subItem.icon}</ListItemIcon>
                            <ListItemText
                              primary={subItem.displayName || subItem.title}
                              primaryTypographyProps={{ fontSize: '0.875rem' }}
                            />
                            {!subItem.hasAccess && (
                              <Lock sx={{ fontSize: '1rem', color: 'text.disabled', ml: 1 }} />
                            )}
                            {subItem.submenu && subItem.submenu.length > 0 && (
                              <ChevronRight sx={{ fontSize: '1.2rem', color: 'text.secondary' }} />
                            )}
                          </ListItemButton>
                        </ListItem>
                        {!isDesktop && subItem.submenu && subItem.submenu.length > 0 && (
                          <Collapse in={openMobileMenus[subItem.name]} timeout="auto" unmountOnExit>
                            <List component="div" disablePadding sx={{ ml: 2 }}>
                              {subItem.submenu.map((grandSubItem) => (
                                <ListItemButton
                                  key={grandSubItem.name || grandSubItem.title}
                                  onClick={() => handleClick(grandSubItem)}
                                  sx={{ pl: 6, minHeight: 40, m: 0.5, borderRadius: 1.5 }}
                                  disabled={!grandSubItem.hasAccess}
                                >
                                  <ListItemIcon sx={{ minWidth: 32 }}>
                                    {grandSubItem.icon}
                                  </ListItemIcon>
                                  <ListItemText
                                    primary={grandSubItem.displayName || grandSubItem.title}
                                    primaryTypographyProps={{ fontSize: '0.875rem' }}
                                  />
                                  {!grandSubItem.hasAccess && (
                                    <Lock
                                      sx={{ fontSize: '1rem', color: 'text.disabled', ml: 1 }}
                                    />
                                  )}
                                </ListItemButton>
                              ))}
                            </List>
                          </Collapse>
                        )}
                      </React.Fragment>
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
            can={can}
          />
        )}
      </Box>
    </ClickAwayListener>
  );
};

export default Sidebar;
