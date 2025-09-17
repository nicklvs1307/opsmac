import React, { useState } from 'react';
import {
  List,
  Box,
  Divider,
  Typography,
  useMediaQuery,
  useTheme,
  Popper,
  Paper,
  Grow,
  ClickAwayListener,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import MenuItem from '../Menu/MenuItem'; // Importar o novo MenuItem
import { menuConfig } from '../../config/menuConfig'; // Importar a nova configuração do menu
import { usePermissions } from '../../hooks/usePermissions'; // Importar o hook de permissões

const SidebarLayout = ({ onMobileClose }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const { checkPermission, isSuperadmin } = usePermissions();
  const [openPopper, setOpenPopper] = useState({ anchor: null, items: [] });

  const handlePopperClose = () => {
    setOpenPopper({ anchor: null, items: [] });
  };

  // Função para filtrar itens de menu com base nas permissões
  const filterMenuItems = (items) => {
    return items.filter(item => {
      const { allowed } = item.featureKey && item.actionKey
        ? checkPermission(item.featureKey, item.actionKey)
        : { allowed: true }; // Se não tiver featureKey/actionKey, assume-se permitido

      const hasAccess = allowed || isSuperadmin;

      if (item.submenu) {
        item.submenu = filterMenuItems(item.submenu);
        // Se o item pai não tem acesso, mas tem submenus, e nenhum submenu tem acesso,
        // o item pai não deve ser exibido.
        if (!hasAccess && item.submenu.length === 0) {
          return false;
        }
      }
      return hasAccess;
    });
  };

  const filteredMenu = filterMenuItems(menuConfig);

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
          {filteredMenu.map((item, index) => (
            <MenuItem
              key={item.module || item.title || index}
              item={item}
              onMobileClose={onMobileClose}
            />
          ))}
        </List>
        {/* Lógica do Popper para desktop, se ainda for necessária e não estiver no MenuItem */}
        {isDesktop && openPopper.anchor && (
          <Popper
            open={Boolean(openPopper.anchor)}
            anchorEl={openPopper.anchor}
            placement="right-start"
            transition
            modifiers={[{ name: 'offset', options: { offset: [0, 2] } }]}
            style={{ zIndex: 2000 }}
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
                    {openPopper.items.submenu && openPopper.items.submenu.map((subItem, index) => (
                      <MenuItem
                        key={subItem.name || subItem.title || index}
                        item={subItem}
                        level={1} // Nível 1 para submenus abertos via Popper
                        onMobileClose={onMobileClose}
                      />
                    ))}
                  </List>
                </Paper>
              </Grow>
            )}
          </Popper>
        )}
      </Box>
    </ClickAwayListener>
  );
};

export default SidebarLayout;
