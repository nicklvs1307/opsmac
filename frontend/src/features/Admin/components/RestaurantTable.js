import React from 'react';
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  IconButton,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const RestaurantTable = ({
  restaurants,
  loading,
  handleOpenModuleModal,
  canAddRestaurant,
  canEditRestaurant,
  canManageRestaurantModules,
  canDeleteRestaurant,
  onDeleteRestaurant,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleEditClick = (restaurantId) => {
    navigate(`/admin/restaurants/${restaurantId}/edit`);
  };

  return (
    <TableContainer component={Paper} sx={{ mt: 3 }}>
      {canAddRestaurant && (
        <Button onClick={() => navigate('/admin/restaurants/new')}>
          {' '}
          {t('admin_dashboard.create_restaurant_tab')}{' '}
        </Button>
      )}
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
                  {canEditRestaurant && (
                    <IconButton onClick={() => handleEditClick(restaurant.id)}>
                      <EditIcon />
                    </IconButton>
                  )}
                  {canManageRestaurantModules && (
                    <Button variant="outlined" onClick={() => handleOpenModuleModal(restaurant)}>
                      {t('admin_dashboard.manage_modules_button')}
                    </Button>
                  )}
                  {canDeleteRestaurant && (
                    <IconButton onClick={() => onDeleteRestaurant(restaurant.id)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  )}
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
