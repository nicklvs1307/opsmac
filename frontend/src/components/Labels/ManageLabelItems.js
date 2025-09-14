import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Typography,
} from '@mui/material';
import EditLabelItemModal from '@/components/Labels/EditLabelItemModal';
import { useLabelItems, useUpdateLabelItem } from '@/features/ValidityControl/api/labelQueries';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const ManageLabelItems = () => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const {
    data: items,
    isLoading,
    isError,
    error,
  } = useLabelItems({
    onError: (err) => {
      toast.error(t('label_management.fetch_error'));
      console.error(err);
    },
  });

  const updateLabelItemMutation = useUpdateLabelItem();

  const handleOpenModal = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  const handleSave = async (updatedItem) => {
    try {
      await updateLabelItemMutation.mutateAsync(updatedItem);
      toast.success(t('label_management.update_success'));
      handleCloseModal();
    } catch (err) {
      toast.error(err.response?.data?.msg || t('label_management.update_error'));
      console.error('Failed to update item', err);
    }
  };

  if (isLoading) {
    return <CircularProgress />;
  }

  if (isError) {
    return <Alert severity="error">{error?.message || t('common.error_loading_data')}</Alert>;
  }

  return (
    <>
      <Typography variant="h5" gutterBottom>
        {t('label_management.title')}
      </Typography>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label={t('label_management.table_aria_label')}>
          <TableHead>
            <TableRow>
              <TableCell>{t('label_management.table_header_name')}</TableCell>
              <TableCell>{t('label_management.table_header_type')}</TableCell>
              <TableCell align="right">{t('label_management.table_header_default_expiration')}</TableCell>
              <TableCell>{t('label_management.table_header_default_status')}</TableCell>
              <TableCell align="center">{t('label_management.table_header_actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items?.map((item) => (
              <TableRow key={`${item.type}-${item.id}`}>
                <TableCell component="th" scope="row">
                  {item.name}
                </TableCell>
                <TableCell>{item.type}</TableCell>
                <TableCell align="right">{item.default_expiration_days || t('common.not_set')}</TableCell>
                <TableCell>{item.default_label_status || t('common.not_set')}</TableCell>
                <TableCell align="center">
                  <Button variant="contained" size="small" onClick={() => handleOpenModal(item)}>
                    {t('common.edit')}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <EditLabelItemModal
        open={isModalOpen}
        onClose={handleCloseModal}
        item={selectedItem}
        onSave={handleSave}
      />
    </>
  );
};

export default ManageLabelItems;
