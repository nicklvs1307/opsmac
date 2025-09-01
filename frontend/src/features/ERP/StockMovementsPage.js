import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '@/app/providers/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import {
  useStocks,
  useCreateStockMovement,
  useStockHistory,
} from './Stock/api/stockMovementsService';

const StockMovementsPage = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const restaurantId = user?.restaurants?.[0]?.id;

  const [openMovementDialog, setOpenMovementDialog] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [openHistoryDialog, setOpenHistoryDialog] = useState(false);

  const {
    data: stocks,
    isLoading: isLoadingStocks,
    isError: isErrorStocks,
  } = useStocks(restaurantId);
  const {
    data: stockHistory,
    isLoading: isLoadingHistory,
    isError: isErrorHistory,
  } = useStockHistory(restaurantId, selectedProductId);

  const { control, handleSubmit, reset } = useForm();

  const createMovementMutation = useCreateStockMovement();

  const onMovementSubmit = (data) => {
    createMovementMutation.mutate({
      restaurantId,
      movement: { ...data, product_id: selectedProductId },
    });
  };

  const handleOpenMovementDialog = (productId) => {
    setSelectedProductId(productId);
    setOpenMovementDialog(true);
  };

  const handleCloseMovementDialog = () => {
    setOpenMovementDialog(false);
    setSelectedProductId(null);
    reset();
  };

  const handleOpenHistoryDialog = (productId) => {
    setSelectedProductId(productId);
    setOpenHistoryDialog(true);
  };

  const handleCloseHistoryDialog = () => {
    setOpenHistoryDialog(false);
    setSelectedProductId(null);
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        {t('stock_movements.title')}
      </Typography>

      <Paper sx={{ mb: 3 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('stock_movements.table_header_product')}</TableCell>
                <TableCell>{t('stock_movements.table_header_sku')}</TableCell>
                <TableCell>{t('stock_movements.table_header_current_stock')}</TableCell>
                <TableCell>{t('stock_movements.table_header_actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoadingStocks ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : isErrorStocks ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Alert severity="error">{t('stock_movements.error_loading_stock')}</Alert>
                  </TableCell>
                </TableRow>
              ) : stocks && stocks.length > 0 ? (
                stocks.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.sku}</TableCell>
                    <TableCell>{product.quantity}</TableCell>
                    <TableCell>
                      <Button size="small" onClick={() => handleOpenMovementDialog(product.id)}>
                        {t('stock_movements.move_button')}
                      </Button>
                      <Button
                        size="small"
                        onClick={() => handleOpenHistoryDialog(product.id)}
                        sx={{ ml: 1 }}
                      >
                        {t('stock_movements.history_button')}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Typography>{t('stock_movements.no_products_found')}</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Dialog for Stock Movement */}
      <Dialog open={openMovementDialog} onClose={handleCloseMovementDialog}>
        <DialogTitle>{t('stock_movements.move_stock_dialog_title')}</DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit(onMovementSubmit)}>
            <FormControl fullWidth margin="normal">
              <InputLabel>{t('stock_movements.movement_type_label')}</InputLabel>
              <Controller
                name="type"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <Select {...field} label={t('stock_movements.movement_type_label')}>
                    <MenuItem value="in">{t('stock_movements.type_in')}</MenuItem>
                    <MenuItem value="out">{t('stock_movements.type_out')}</MenuItem>
                  </Select>
                )}
              />
            </FormControl>
            <Controller
              name="quantity"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t('stock_movements.quantity_label')}
                  fullWidth
                  margin="normal"
                  type="number"
                />
              )}
            />
            <Controller
              name="description"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t('stock_movements.description_label')}
                  fullWidth
                  margin="normal"
                  multiline
                  rows={2}
                />
              )}
            />
            <input type="hidden" {...control.register('product_id')} value={selectedProductId} />
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMovementDialog}>{t('common.cancel')}</Button>
          <Button
            onClick={handleSubmit(onMovementSubmit)}
            variant="contained"
            disabled={createMovementMutation.isLoading}
          >
            {createMovementMutation.isLoading ? (
              <CircularProgress size={20} />
            ) : (
              t('stock_movements.confirm_move_button')
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog for Stock History */}
      <Dialog open={openHistoryDialog} onClose={handleCloseHistoryDialog} maxWidth="md" fullWidth>
        <DialogTitle>{t('stock_movements.history_dialog_title')}</DialogTitle>
        <DialogContent>
          {isLoadingHistory ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100px">
              <CircularProgress />
            </Box>
          ) : isErrorHistory ? (
            <Alert severity="error">{t('stock_movements.error_loading_history')}</Alert>
          ) : stockHistory && stockHistory.length > 0 ? (
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>{t('stock_movements.table_header_date')}</TableCell>
                    <TableCell>{t('stock_movements.table_header_type')}</TableCell>
                    <TableCell>{t('stock_movements.table_header_quantity')}</TableCell>
                    <TableCell>{t('stock_movements.table_header_description')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stockHistory.map((movement) => (
                    <TableRow key={movement.id}>
                      <TableCell>{new Date(movement.movement_date).toLocaleString()}</TableCell>
                      <TableCell>
                        {t(
                          movement.type === 'in'
                            ? 'stock_movements.type_in'
                            : 'stock_movements.type_out'
                        )}
                      </TableCell>
                      <TableCell>{movement.quantity}</TableCell>
                      <TableCell>{movement.description || t('common.na')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography>{t('stock_movements.no_history_found')}</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseHistoryDialog}>{t('common.close')}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StockMovementsPage;
