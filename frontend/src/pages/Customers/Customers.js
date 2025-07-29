import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
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
  Visibility as ViewIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  Search as SearchIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import axiosInstance from '../../api/axiosInstance';
import toast from 'react-hot-toast';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
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
  const [detailDialog, setDetailDialog] = useState(false);
  const [customerDetails, setCustomerDetails] = useState(null);

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
    fetchCustomers();
  }, [page, filters]);

  useEffect(() => {
    if (!createDialog && !editDialog) {
      handleMenuClose();
    }
  }, [createDialog, editDialog]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = {
        page,
        limit: 10,
        ...filters,
      };
      
      const response = await axiosInstance.get('/api/customers', { params });
      
      setCustomers(response.data.customers);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError('Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerDetails = async (customerId) => {
    try {
      const response = await axiosInstance.get(`/customers/${customerId}`);
      setCustomerDetails(response.data);
      setDetailDialog(true);
    } catch (err) {
      toast.error('Erro ao carregar detalhes do cliente');
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
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
    console.log('handleEdit chamado. selectedCustomer:', selectedCustomer);
    reset(selectedCustomer);
    setEditDialog(true);
  };

  const handleDelete = () => {
    setDeleteDialog(true);
    handleMenuClose();
  };

  const handleView = () => {
    fetchCustomerDetails(selectedCustomer.id);
    handleMenuClose();
  };

  const onSubmit = async (data) => {
    console.log('onSubmit chamado. editDialog:', editDialog, 'data:', data);
    try {
      const cleanData = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value !== '' && value !== null)
      );
      
      if (editDialog) {
        console.log('Tentando PUT para /api/customers/' + selectedCustomer.id, cleanData);
        await axiosInstance.put(`/customers/${selectedCustomer.id}`, cleanData);
        toast.success('Cliente atualizado com sucesso!');
      } else {
        await axiosInstance.post('/api/customers', cleanData);
        toast.success('Cliente criado com sucesso!');
      }
      
      setCreateDialog(false);
      setEditDialog(false);
      fetchCustomers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erro ao salvar cliente');
    }
  };

  const confirmDelete = async () => {
    try {
      await axiosInstance.delete(`/api/customers/${selectedCustomer.id}`);
      
      toast.success('Cliente excluído com sucesso!');
      setDeleteDialog(false);
      fetchCustomers();
    } catch (err) {
      toast.error('Erro ao excluir cliente');
    }
  };

  const getSegmentColor = (segment) => {
    switch (segment) {
      case 'vip': return 'error';
      case 'regular': return 'primary';
      case 'new': return 'success';
      case 'inactive': return 'default';
      default: return 'default';
    }
  };

  const getSegmentLabel = (segment) => {
    switch (segment) {
      case 'vip': return 'VIP';
      case 'regular': return 'Regular';
      case 'new': return 'Novo';
      case 'inactive': return 'Inativo';
      default: return segment;
    }
  };

  const calculateLoyaltyProgress = (visits) => {
    const maxVisits = 10; // Para ser VIP
    return Math.min((visits / maxVisits) * 100, 100);
  };

  if (loading && customers.length === 0) {
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
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreate}
        >
          Novo Cliente
        </Button>
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

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Customers Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Cliente</TableCell>
              <TableCell>Contato</TableCell>
              <TableCell>Segmento</TableCell>
              <TableCell>Visitas</TableCell>
              <TableCell>Avaliação Média</TableCell>
              <TableCell>Fidelidade</TableCell>
              <TableCell>Última Visita</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id} hover>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      {customer.name?.charAt(0) || 'C'}
                    </Avatar>
                    <Box>
                      <Typography variant="body1" fontWeight="medium">
                        {customer.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ID: #{customer.id}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    {customer.email && (
                      <Box display="flex" alignItems="center" gap={1}>
                        <EmailIcon fontSize="small" color="action" />
                        <Typography variant="body2">{customer.email}</Typography>
                      </Box>
                    )}
                    {customer.phone && (
                      <Box display="flex" alignItems="center" gap={1}>
                        <PhoneIcon fontSize="small" color="action" />
                        <Typography variant="body2">{customer.phone}</Typography>
                      </Box>
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={getSegmentLabel(customer.segment)}
                    color={getSegmentColor(customer.segment)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <TrendingUpIcon fontSize="small" color="action" />
                    <Typography variant="body2">
                      {customer.total_visits || 0}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  {customer.average_rating ? (
                    <Box display="flex" alignItems="center" gap={1}>
                      <Rating
                        value={customer.average_rating}
                        readOnly
                        size="small"
                        precision={0.1}
                      />
                      <Typography variant="body2">
                        ({customer.average_rating.toFixed(1)})
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Sem avaliações
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Box sx={{ width: 100 }}>
                    <LinearProgress
                      variant="determinate"
                      value={calculateLoyaltyProgress(customer.total_visits || 0)}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {Math.round(calculateLoyaltyProgress(customer.total_visits || 0))}%
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  {customer.last_visit ? (
                    <Typography variant="body2">
                      {format(new Date(customer.last_visit), 'dd/MM/yyyy', { locale: ptBR })}
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Nunca visitou
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, customer)}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {customers.length === 0 && !loading && (
        <Box textAlign="center" py={4}>
          <PersonIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Nenhum cliente encontrado
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreate}
          >
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
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleView}>
          <ViewIcon sx={{ mr: 1 }} />
          Ver Detalhes
        </MenuItem>
        <MenuItem onClick={handleEdit}>
          <EditIcon sx={{ mr: 1 }} />
          Editar
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} />
          Excluir
        </MenuItem>
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
            overflow: 'hidden'
          }
        }}
        TransitionProps={{
          timeout: 400
        }}
      >
        <DialogTitle sx={{
          background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
          color: 'white',
          py: 2.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5
        }}>
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
            {editDialog ? <EditIcon /> : <PersonIcon />}
          </Avatar>
          <Typography variant="h6">
            {editDialog ? 'Editar Cliente' : 'Novo Cliente'}
          </Typography>
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
                          boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.1)'
                        },
                        '&.Mui-focused': {
                          boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)'
                        }
                      }
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
                          boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.1)'
                        },
                        '&.Mui-focused': {
                          boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)'
                        }
                      }
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
                          boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.1)'
                        },
                        '&.Mui-focused': {
                          boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)'
                        }
                      }
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
                          boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.1)'
                        },
                        '&.Mui-focused': {
                          boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)'
                        }
                      }
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
                          boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.1)'
                        },
                        '&.Mui-focused': {
                          boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)'
                        }
                      }
                    }}
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2.5, borderTop: '1px solid', borderColor: 'divider', justifyContent: 'space-between' }}>
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
                boxShadow: '0 6px 15px rgba(25, 118, 210, 0.4)'
              }
            }}
          >
            {editDialog ? 'Atualizar' : 'Criar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Customer Details Dialog */}
      <Dialog
        open={detailDialog}
        onClose={() => setDetailDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Detalhes do Cliente</DialogTitle>
        <DialogContent>
          {customerDetails && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                        {customerDetails.name?.charAt(0) || 'C'}
                      </Avatar>
                      <Box>
                        <Typography variant="h6">{customerDetails.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Cliente desde {format(new Date(customerDetails.created_at), 'MMMM yyyy', { locale: ptBR })}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box>
                      {customerDetails.email && (
                        <Typography variant="body2" gutterBottom>
                          <EmailIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                          {customerDetails.email}
                        </Typography>
                      )}
                      {customerDetails.phone && (
                        <Typography variant="body2" gutterBottom>
                          <PhoneIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                          {customerDetails.phone}
                        </Typography>
                      )}
                      {customerDetails.birth_date && (
                        <Typography variant="body2" gutterBottom>
                          <strong>Nascimento:</strong> {format(new Date(customerDetails.birth_date), 'dd/MM/yyyy', { locale: ptBR })}
                        </Typography>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Estatísticas
                    </Typography>
                    <Box>
                      <Typography variant="body2" gutterBottom>
                        <strong>Total de Visitas:</strong> {customerDetails.total_visits || 0}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        <strong>Total de Feedbacks:</strong> {customerDetails.total_feedbacks || 0}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        <strong>Avaliação Média:</strong> {customerDetails.average_rating?.toFixed(1) || 'N/A'}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        <strong>Pontos de Fidelidade:</strong> {customerDetails.loyalty_points || 0}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        <strong>Última Visita:</strong> {customerDetails.last_visit ? format(new Date(customerDetails.last_visit), 'dd/MM/yyyy', { locale: ptBR }) : 'Nunca'}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              {customerDetails.preferences && (
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Preferências
                      </Typography>
                      <Typography variant="body2">
                        {customerDetails.preferences}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialog(false)}>Fechar</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir o cliente "{selectedCustomer?.name}"? Esta ação não pode ser desfeita e todos os dados relacionados serão perdidos.
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