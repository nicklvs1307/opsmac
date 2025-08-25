import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useForm, Controller } from 'react-hook-form';
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
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '@/app/providers/contexts/AuthContext';
import toast from 'react-hot-toast';

const fetchSuppliers = async (restaurantId) => {
  const { data } = await axiosInstance.get(`/api/suppliers?restaurant_id=${restaurantId}`);
  return data;
};

const createSupplier = (newSupplier) => {
  return axiosInstance.post('/api/suppliers', newSupplier);
};

const updateSupplier = ({ id, updatedSupplier }) => {
  return axiosInstance.put(`/api/suppliers/${id}`, updatedSupplier);
};

const deleteSupplier = (id) => {
  return axiosInstance.delete(`/api/suppliers/${id}`);
};

const SuppliersTab = () => {
  const { user } = useAuth();
  const restaurantId = user?.restaurants?.[0]?.id;
  const queryClient = useQueryClient();

  const [openDialog, setOpenDialog] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);

  const {
    data: suppliers,
    isLoading,
    isError,
  } = useQuery(['suppliers', restaurantId], () => fetchSuppliers(restaurantId), {
    enabled: !!restaurantId,
  });

  const { control, handleSubmit, reset, setValue } = useForm();

  const createMutation = useMutation(createSupplier, {
    onSuccess: () => {
      queryClient.invalidateQueries('suppliers');
      toast.success('Fornecedor criado com sucesso!');
      setOpenDialog(false);
      reset();
    },
    onError: (error) => {
      toast.error(`Erro ao criar fornecedor: ${error.response?.data?.msg || error.message}`);
    },
  });

  const updateMutation = useMutation(updateSupplier, {
    onSuccess: () => {
      queryClient.invalidateQueries('suppliers');
      toast.success('Fornecedor atualizado com sucesso!');
      setOpenDialog(false);
      setEditingSupplier(null);
      reset();
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar fornecedor: ${error.response?.data?.msg || error.message}`);
    },
  });

  const deleteMutation = useMutation(deleteSupplier, {
    onSuccess: () => {
      queryClient.invalidateQueries('suppliers');
      toast.success('Fornecedor excluído com sucesso!');
    },
    onError: (error) => {
      toast.error(`Erro ao excluir fornecedor: ${error.response?.data?.msg || error.message}`);
    },
  });

  const handleOpenDialog = (supplier = null) => {
    setEditingSupplier(supplier);
    if (supplier) {
      setValue('name', supplier.name);
      setValue('contact_person', supplier.contact_person);
      setValue('phone', supplier.phone);
      setValue('email', supplier.email);
      setValue('address', supplier.address);
    } else {
      reset();
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingSupplier(null);
    reset();
  };

  const onSubmit = (data) => {
    if (editingSupplier) {
      updateMutation.mutate({
        id: editingSupplier.id,
        updatedSupplier: { ...data, restaurant_id: restaurantId },
      });
    } else {
      createMutation.mutate({ ...data, restaurant_id: restaurantId });
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Gerenciamento de Fornecedores
      </Typography>

      <Button variant="contained" color="primary" onClick={() => handleOpenDialog()} sx={{ mb: 3 }}>
        Adicionar Fornecedor
      </Button>

      <Paper sx={{ mb: 3 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Pessoa de Contato</TableCell>
                <TableCell>Telefone</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Endereço</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Alert severity="error">Erro ao carregar fornecedores.</Alert>
                  </TableCell>
                </TableRow>
              ) : suppliers && suppliers.length > 0 ? (
                suppliers.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell>{supplier.name}</TableCell>
                    <TableCell>{supplier.contact_person}</TableCell>
                    <TableCell>{supplier.phone}</TableCell>
                    <TableCell>{supplier.email}</TableCell>
                    <TableCell>{supplier.address}</TableCell>
                    <TableCell>
                      <Button size="small" onClick={() => handleOpenDialog(supplier)}>
                        Editar
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        onClick={() => deleteMutation.mutate(supplier.id)}
                        sx={{ ml: 1 }}
                      >
                        Excluir
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography>Nenhum fornecedor encontrado.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {editingSupplier ? 'Editar Fornecedor' : 'Adicionar Novo Fornecedor'}
        </DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Controller
              name="name"
              control={control}
              defaultValue=""
              rules={{ required: 'Nome é obrigatório' }}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  label="Nome"
                  fullWidth
                  margin="normal"
                  error={!!error}
                  helperText={error ? error.message : null}
                />
              )}
            />
            <Controller
              name="contact_person"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField {...field} label="Pessoa de Contato" fullWidth margin="normal" />
              )}
            />
            <Controller
              name="phone"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField {...field} label="Telefone" fullWidth margin="normal" />
              )}
            />
            <Controller
              name="email"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField {...field} label="Email" fullWidth margin="normal" />
              )}
            />
            <Controller
              name="address"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Endereço"
                  fullWidth
                  margin="normal"
                  multiline
                  rows={2}
                />
              )}
            />
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit(onSubmit)} variant="contained">
            {editingSupplier ? 'Salvar Alterações' : 'Adicionar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SuppliersTab;
