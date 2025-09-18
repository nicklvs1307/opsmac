import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Avatar,
  Pagination,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem as SelectMenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Rating,
  LinearProgress,
} from '@mui/material';
import {
  Person as PersonIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  TrendingUp as TrendingUpIcon,
  Search as SearchIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '../../hooks/usePermissions';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import toast from 'react-hot-toast';
import CustomerTable from '../components/CustomerTable';
import {
  useCustomersList,
  useDeleteCustomer,
  useCreateCustomer,
  useUpdateCustomer,
} from '@/features/Customers/api/customerService';

const CustomersPage = () => {
  const { can } = usePermissions();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    segment: '',
    sort: 'created_at',
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [createDialog, setCreateDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const navigate = useNavigate();

  const {
    data: customersData,
    isLoading,
    isError,
    error,
  } = useCustomersList({
    page,
    limit: 10, // Assuming a default limit of 10 items per page
    ...filters,
  });

  const createCustomerMutation = useCreateCustomer();
  const updateCustomerMutation = useUpdateCustomer();
  const deleteCustomerMutation = useDeleteCustomer();

  const customers = customersData?.customers || [];
  const totalPages = customersData?.totalPages || 1;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      birth_date: '',
      preferences: '',
    },
  });

  useEffect(() => {
    if (!createDialog && !editDialog) {
      handleMenuClose();
    }
  }, [createDialog, editDialog]);

  const handleRowClick = (customerId) => {
    navigate(`/customers/${customerId}/details`);
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setPage(1);
  };

  const handleMenuOpen = (event, customer) => {
    setAnchorEl(event.currentTarget);
    setSelectedCustomer(customer);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCustomer(null);
  };

  const handleCreate = () => {
    reset();
    setCreateDialog(true);
  };

  const handleEdit = () => {
    reset(selectedCustomer);
    setEditDialog(true);
  };

  const handleDelete = () => {
    setDeleteDialog(true);
    handleMenuClose();
  };

  const onSubmit = async (data) => {
    try {
      const cleanData = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value !== '' && value !== null)
      );

      if (editDialog) {
        await updateCustomerMutation.mutateAsync({ id: selectedCustomer.id, data: cleanData });
        toast.success('Cliente atualizado com sucesso!');
      } else {
        await createCustomerMutation.mutateAsync(cleanData);
        toast.success('Cliente criado com sucesso!');
      }

      setCreateDialog(false);
      setEditDialog(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erro ao salvar cliente');
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteCustomerMutation.mutateAsync(selectedCustomer.id);

      toast.success('Cliente excluído com sucesso!');
      setDeleteDialog(false);
    } catch (err) {
      toast.error('Erro ao excluir cliente');
    }
  };



  if (isLoading && customers.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Clientes
        </Typography>
        {can('customers', 'create') && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
            Novo Cliente
          </Button>
        )}
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Filtros
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Buscar"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Nome, email ou telefone..."
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Segmento</InputLabel>
              <Select
                value={filters.segment}
                label="Segmento"
                onChange={(e) => handleFilterChange('segment', e.target.value)}
              >
                <SelectMenuItem value="">Todos</SelectMenuItem>
                <SelectMenuItem value="vip">VIP</SelectMenuItem>
                <SelectMenuItem value="regular">Regular</SelectMenuItem>
                <SelectMenuItem value="new">Novo</SelectMenuItem>
                <SelectMenuItem value="inactive">Inativo</SelectMenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Ordenar por</InputLabel>
              <Select
                value={filters.sort}
                label="Ordenar por"
                onChange={(e) => handleFilterChange('sort', e.target.value)}
              >
                <SelectMenuItem value="created_at">Data de Cadastro</SelectMenuItem>
                <SelectMenuItem value="name">Nome</SelectMenuItem>
                <SelectMenuItem value="total_visits">Visitas</SelectMenuItem>
                <SelectMenuItem value="average_rating">Avaliação Média</SelectMenuItem>
                <SelectMenuItem value="last_visit">Última Visita</SelectMenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error?.message || 'Erro ao carregar clientes'}
        </Alert>
      )}

      {/* Customers Table */}
      <CustomerTable
        customers={customers}
        isLoading={isLoading}
        isError={isError}
        error={error}
        handleRowClick={handleRowClick}
        handleMenuOpen={handleMenuOpen}
      />

      {customers.length === 0 && !isLoading && (
        <Box textAlign="center" py={4}>
          <PersonIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Nenhum cliente encontrado
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
            Cadastrar Primeiro Cliente
          </Button>
        </Box>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(e, value) => setPage(value)}
            color="primary"
          />
        </Box>
      )}

      {/* Action Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        {can('customers', 'update') && (
          <MenuItem onClick={handleEdit}>
            <EditIcon sx={{ mr: 1 }} />
            Editar
          </MenuItem>
        )}
        {can('customers', 'delete') && (
          <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
            <DeleteIcon sx={{ mr: 1 }} />
            Excluir
          </MenuItem>
        )}
      </Menu>

      {/* Create/Edit Dialog */}
      <Dialog
        open={createDialog || editDialog}
        onClose={() => {
          setCreateDialog(false);
          setEditDialog(false);
          handleMenuClose();
        }}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            overflow: 'hidden',
          },
        }}
        TransitionProps={{
          timeout: 400,
        }}
      >
        <DialogTitle
          sx={{
            background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
            color: 'white',
            py: 2.5,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
            {editDialog ? <EditIcon /> : <PersonIcon />}
          </Avatar>
          <Typography variant="h6">{editDialog ? 'Editar Cliente' : 'Novo Cliente'}</Typography>
        </DialogTitle>
        <DialogContent sx={{ p: { xs: 2, md: 3 }, mt: 1 }}>
          <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mt: 0 }}>
            <Grid item xs={12} md={6}>
              <Controller
                name="name"
                control={control}
                rules={{ required: 'Nome é obrigatório' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Nome Completo"
                    fullWidth
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    variant="outlined"
                    InputProps={{
                      startAdornment: <PersonIcon sx={{ mr: 1, color: 'action.active' }} />,
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        transition: 'all 0.3s',
                        '&:hover': {
                          boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.1)',
                        },
                        '&.Mui-focused': {
                          boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)',
                        },
                      },
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="email"
                control={control}
                rules={{
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Email inválido',
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Email"
                    type="email"
                    fullWidth
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    variant="outlined"
                    InputProps={{
                      startAdornment: <EmailIcon sx={{ mr: 1, color: 'action.active' }} />,
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        transition: 'all 0.3s',
                        '&:hover': {
                          boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.1)',
                        },
                        '&.Mui-focused': {
                          boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)',
                        },
                      },
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Telefone"
                    fullWidth
                    placeholder="(11) 99999-9999"
                    variant="outlined"
                    InputProps={{
                      startAdornment: <PhoneIcon sx={{ mr: 1, color: 'action.active' }} />,
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        transition: 'all 0.3s',
                        '&:hover': {
                          boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.1)',
                        },
                        '&.Mui-focused': {
                          boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)',
                        },
                      },
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="birth_date"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Data de Nascimento"
                    type="date"
                    fullWidth
                    variant="outlined"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        transition: 'all 0.3s',
                        '&:hover': {
                          boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.1)',
                        },
                        '&.Mui-focused': {
                          boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)',
                        },
                      },
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="preferences"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Preferências"
                    multiline
                    rows={3}
                    fullWidth
                    placeholder="Preferências alimentares, restrições, etc..."
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        transition: 'all 0.3s',
                        '&:hover': {
                          boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.1)',
                        },
                        '&.Mui-focused': {
                          boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)',
                        },
                      },
                    }}
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions
          sx={{
            px: 3,
            py: 2.5,
            borderTop: '1px solid',
            borderColor: 'divider',
            justifyContent: 'space-between',
          }}
        >
          <Button
            onClick={() => {
              setCreateDialog(false);
              setEditDialog(false);
            }}
            variant="outlined"
            sx={{ borderRadius: 2, px: 3 }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            variant="contained"
            sx={{
              borderRadius: 2,
              px: 3,
              boxShadow: '0 4px 10px rgba(25, 118, 210, 0.3)',
              '&:hover': {
                boxShadow: '0 6px 15px rgba(25, 118, 210, 0.4)',
              },
            }}
          >
            {editDialog ? 'Atualizar' : 'Criar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir o cliente "{selectedCustomer?.name}"? Esta ação não pode
            ser desfeita e todos os dados relacionados serão perdidos.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Cancelar</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Customers;
