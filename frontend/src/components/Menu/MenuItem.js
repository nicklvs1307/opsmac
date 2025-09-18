import React, { useState } from 'react';
import {
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Tooltip,
  List,
} from '@mui/material';
import { ExpandLess, ExpandMore, ChevronRight, Lock } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePermissions } from '../hooks/usePermissions'; // Importar o hook de permissões

const MenuItem = ({ item, level = 0, onMobileClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { checkPermission, isSuperadmin } = usePermissions(); // Usar o hook de permissões
  const [open, setOpen] = useState(false);

  // Verificar permissões para o item atual
  const { allowed, locked } = item.featureKey && item.actionKey
    ? checkPermission(item.featureKey, item.actionKey)
    : { allowed: true, locked: false };

  const hasChildren = item.submenu && item.submenu.length > 0;
  const hasAccess = allowed || isSuperadmin; // Superadmin sempre tem acesso

  const isActive = (path) =>
    path && (location.pathname === path || location.pathname.startsWith(path));

  const handleClick = () => {
    if (hasChildren) {
      setOpen(!open);
    } else if (hasAccess && item.path) {
      navigate(item.path);
      if (onMobileClose) {
        onMobileClose();
      }
    }
  };

  return (
    <React.Fragment>
      <ListItem disablePadding sx={{ mb: 0.5 }}>
        <Tooltip
          title={!hasAccess ? t('common.no_permission') : (item.displayName || t(item.title))}
          placement="right"
          arrow
          enterDelay={500}
        >
          <ListItemButton
            onClick={handleClick}
            selected={isActive(item.path)}
            sx={{
              minHeight: 48,
              borderRadius: 2,
              mx: 1,
              pl: 2 + level * 2, // Ajuste do padding para níveis de submenu
            }}
            disabled={!hasAccess}
          >
            {item.icon && (
              <ListItemIcon sx={{ minWidth: 0, mr: 2, justifyContent: 'center' }}>
                {item.icon}
              </ListItemIcon>
            )}
            <ListItemText
              primary={item.displayName || t(item.title)}
              primaryTypographyProps={{ fontSize: '0.875rem' }}
            />
            {!hasAccess && (
              <Lock sx={{ fontSize: '1rem', color: 'text.disabled', ml: 1 }} />
            )}
            {hasChildren && (open ? <ExpandLess /> : <ExpandMore />)}
          </ListItemButton>
        </Tooltip>
      </ListItem>
      {hasChildren && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {item.submenu.map((subItem, index) => (
              <MenuItem
                key={subItem.name || subItem.title || index} // Adicionado index como fallback para key
                item={subItem}
                level={level + 1}
                onMobileClose={onMobileClose}
              />
            ))}
          </List>
        </Collapse>
      )}
    </React.Fragment>
  );
};

export default MenuItem;
