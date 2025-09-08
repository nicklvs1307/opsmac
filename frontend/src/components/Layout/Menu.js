import React from 'react';
import { NavLink } from 'react-router-dom';
import { List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { menuStructure } from './menuStructure';
import usePermissions from '@/hooks/usePermissions';
import { useTheme } from '@mui/material/styles';
import { useAuth } from '@/app/providers/contexts/AuthContext';

const Menu = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const { can, permissionSnapshot } = usePermissions();

  const getNavLinkStyle = ({ isActive }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: '8px 16px',
    borderRadius: theme.shape.borderRadius,
    textDecoration: 'none',
    color: theme.palette.text.primary,
    backgroundColor: isActive ? theme.palette.action.selected : 'transparent',
    fontWeight: isActive ? 'bold' : 'normal',
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  });

  const renderMenuItems = (items) => {
    return items.map((item, index) => {
      // Hide admin module for non-superadmins
      if (item.module === 'admin' && !user?.isSuperAdmin) {
        return null;
      }

      // Check module-level visibility and locked status from permissionSnapshot
      if (item.module) {
        const moduleInSnapshot = permissionSnapshot?.modules.find(m => m.key === item.module);
        if (!moduleInSnapshot || !moduleInSnapshot.visible || moduleInSnapshot.locked) {
          return null;
        }
      }

      // Check item-level permission if featureKey and actionKey are defined
      if (item.featureKey && item.actionKey && !can(item.featureKey, item.actionKey)) {
        return null;
      }

      if (item.submenu) {
        return (
          <React.Fragment key={item.title || index}>
            <ListItemButton>
              <ListItemIcon sx={{ minWidth: 'auto', mr: 2, color: 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.title} />
            </ListItemButton>
            <List component="div" disablePadding sx={{ pl: 4 }}>
              {renderMenuItems(item.submenu)}
            </List>
          </React.Fragment>
        );
      }

      return (
        <ListItem key={item.path || item.title || index} disablePadding>
          <ListItemButton component={NavLink} to={item.path} sx={getNavLinkStyle}>
            <ListItemIcon sx={{ minWidth: 'auto', mr: 2, color: 'inherit' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.title} />
          </ListItemButton>
        </ListItem>
      );
    });
  };

  // Only render menu if permissionSnapshot is available
  if (!permissionSnapshot) {
    return null;
  }

  return <List>{renderMenuItems(menuStructure)}</List>;
};

export default Menu;
