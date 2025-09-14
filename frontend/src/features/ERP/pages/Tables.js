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
} from '@mui/material';
import { useQueryClient } from 'react-query';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '@/app/providers/contexts/AuthContext';
import QRCode from 'qrcode.react'; // For displaying QR code on frontend

import {
  useTables,
  useCreateTable,
  useUpdateTable,
  useDeleteTable,
  useGenerateQrCode,
} from '../api/tablesService';

const Tables = () => {
  const { user } = useAuth();
  const restaurantId = user?.restaurants?.[0]?.id;
  const queryClient = useQueryClient();

  const [openFormDialog, setOpenFormDialog] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [openQrDialog, setOpenQrDialog] = useState(false);
  const [currentQrCodeUrl, setCurrentQrCodeUrl] = useState('');

  const {
    data: tables,
    isLoading,
    isError,
  } = useTables(restaurantId, {
    onError: (error) => {
      // Handle error if needed
      console.error('Error loading tables:', error);
    },
  });

  const { control, handleSubmit, reset, setValue } = useForm();

  const createMutation = useCreateTable({
    onSuccess: () => {
      queryClient.invalidateQueries('tables');
      setOpenFormDialog(false);
      reset();
    },
    onError: (error) => {
      // Handle error if needed
      console.error('Error creating table:', error);
    },
  });

  const updateMutation = useUpdateTable({
    onSuccess: () => {
      queryClient.invalidateQueries('tables');
      setOpenFormDialog(false);
      setEditingTable(null);
      reset();
    },
    onError: (error) => {
      // Handle error if needed
      console.error('Error updating table:', error);
    },
  });

  const deleteMutation = useDeleteTable({
    onSuccess: () => {
      queryClient.invalidateQueries('tables');
    },
    onError: (error) => {
      // Handle error if needed
      console.error('Error deleting table:', error);
    },
  });

  const generateQrMutation = useGenerateQrCode({
    onSuccess: (data) => {
      setCurrentQrCodeUrl(data.data.qr_code_url);
      setOpenQrDialog(true);
    },
    onError: (error) => {
      // Handle error if needed
      console.error('Error generating QR code:', error);
    },
  });

  const onSubmit = (data) => {
    if (editingTable) {
      updateMutation.mutate({ id: editingTable.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleOpenFormDialog = (table = null) => {
    setEditingTable(table);
    if (table) {
      setValue('table_number', table.table_number);
    } else {
      reset();
    }
    setOpenFormDialog(true);
  };

  const handleCloseFormDialog = () => {
    setOpenFormDialog(false);
    setEditingTable(null);
    reset();
  };

  const handleDelete = (id) => {
    if (window.confirm('Tem certeza que deseja deletar esta mesa?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleGenerateQr = (tableId) => {
    generateQrMutation.mutate(tableId);
  };

  const handleCloseQrDialog = () => {
    setOpenQrDialog(false);
    setCurrentQrCodeUrl('');
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Gerenciar Mesas
      </Typography>

      <Button variant="contained" onClick={() => handleOpenFormDialog()} sx={{ mb: 2 }}>
        Nova Mesa
      </Button>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Número da Mesa</TableCell>
                <TableCell>URL do QR Code</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    <Alert severity="error">Erro ao carregar mesas.</Alert>
                  </TableCell>
                </TableRow>
              ) : (
                tables.map((table) => (
                  <TableRow key={table.id}>
                    <TableCell>{table.table_number}</TableCell>
                    <TableCell>
                      {table.qr_code_url ? (
                        <Button
                          size="small"
                          onClick={() => {
                            setCurrentQrCodeUrl(table.qr_code_url);
                            setOpenQrDialog(true);
                          }}
                        >
                          Ver QR Code
                        </Button>
                      ) : (
                        'Não gerado'
                      )}
                    </TableCell>
                    <TableCell>
                      <Button size="small" onClick={() => handleOpenFormDialog(table)}>
                        Editar
                      </Button>
                      <Button
                        size="small"
                        onClick={() => handleDelete(table.id)}
                        color="error"
                        sx={{ ml: 1 }}
                      >
                        Deletar
                      </Button>
                      <Button
                        size="small"
                        onClick={() => handleGenerateQr(table.id)}
                        sx={{ ml: 1 }}
                      >
                        Gerar QR
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Form Dialog */}
      <Dialog open={openFormDialog} onClose={handleCloseFormDialog}>
        <DialogTitle>{editingTable ? 'Editar Mesa' : 'Nova Mesa'}</DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Controller
              name="table_number"
              control={control}
              defaultValue=""
              rules={{ required: 'Número da mesa é obrigatório' }}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  label="Número da Mesa"
                  fullWidth
                  margin="normal"
                  type="number"
                  error={!!error}
                  helperText={error ? error.message : null}
                />
              )}
            />
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseFormDialog}>Cancelar</Button>
          <Button onClick={handleSubmit(onSubmit)} variant="contained">
            {editingTable ? 'Salvar' : 'Criar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* QR Code Display Dialog */}
      <Dialog open={openQrDialog} onClose={handleCloseQrDialog}>
        <DialogTitle>QR Code da Mesa</DialogTitle>
        <DialogContent
          sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2 }}
        >
          {currentQrCodeUrl ? (
            <QRCode value={currentQrCodeUrl} size={256} level="H" includeMargin={true} />
          ) : (
            <CircularProgress />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseQrDialog}>Fechar</Button>
          {currentQrCodeUrl && (
            <Button
              variant="contained"
              href={currentQrCodeUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Abrir Link
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Tables;
