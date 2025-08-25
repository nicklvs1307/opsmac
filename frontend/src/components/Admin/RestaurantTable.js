import React from 'react';
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  IconButton,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { useTranslation } from 'react-i18next';

const RestaurantTable = ({
  restaurants,
  loading,
  handleOpenRestaurantModal,
  handleOpenModuleModal,
}) => {
  const { t } = useTranslation();

  return (
    <TableContainer component={Paper} sx={{ mt: 3 }}>
      <Button onClick={() => handleOpenRestaurantModal()}>
        {' '}
        {t('admin_dashboard.create_restaurant_tab')}{' '}
      </Button>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>{t('admin_dashboard.list_header_restaurant')}</TableCell>
            <TableCell>{t('admin_dashboard.list_header_owner')}</TableCell>
            <TableCell>{t('admin_dashboard.list_header_modules')}</TableCell>
            <TableCell align="right">{t('admin_dashboard.list_header_actions')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={4} align="center">
                <CircularProgress />
              </TableCell>
            </TableRow>
          ) : (
            restaurants.map((restaurant) => (
              <TableRow key={restaurant.id} hover>
                <TableCell>{restaurant.name}</TableCell>
                <TableCell>{restaurant.owner?.name || 'N/A'}</TableCell>
                <TableCell>
                  {(restaurant.modules || []).map((m) => m.displayName).join(', ')}
                </TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleOpenRestaurantModal(restaurant)}>
                    <EditIcon />
                  </IconButton>
                  <Button variant="outlined" onClick={() => handleOpenModuleModal(restaurant)}>
                    {t('admin_dashboard.manage_modules_button')}
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default RestaurantTable;
