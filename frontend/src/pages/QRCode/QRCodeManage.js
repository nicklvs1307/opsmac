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
  CardActions,
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
} from '@mui/material';
import {
  Add as AddIcon,
  QrCode as QrCodeIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Visibility as ViewIcon,
  ContentCopy as CopyIcon,
  Analytics as AnalyticsIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import QRCode from 'qrcode.react';
import axiosInstance from 'api/axiosInstance';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

const QRCodeManage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const restaurantId = user?.restaurants?.[0]?.id; // Acessa o ID do primeiro restaurante do usuário
  const [qrCodes, setQrCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedQRCode, setSelectedQRCode] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [analyticsDialog, setAnalyticsDialog] = useState(false);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    fetchQRCodes();
  }, [page, filters]);

  const fetchQRCodes = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = {
        page,
        limit: 12,
        ...filters,
      };
      
      const response = await axiosInstance.get(`/api/qrcode/restaurant/${restaurantId}`, { params });
      
      setQrCodes(response.data.qrcodes);
      setTotalPages(response.data.pagination.total_pages);
    } catch (err) {
      console.error('Error fetching QR codes:', err);
      setError('Erro ao carregar QR codes');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async (qrCodeId) => {
    try {
      const response = await axiosInstance.get(`/api/qrcode/${qrCodeId}/analytics`);
      setAnalytics(response.data);
      setAnalyticsDialog(true);
    } catch (err) {
      toast.error('Erro ao carregar analytics');
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(1);
  };

  const handleMenuOpen = (event, qrCode) => {
    setAnchorEl(event.currentTarget);
    setSelectedQRCode(qrCode);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedQRCode(null);
  };

  const handleView = () => {
    setViewDialog(true);
    handleMenuClose();
  };

  const handleEdit = () => {
    navigate(`/qrcode/edit/${selectedQRCode.id}`);
    handleMenuClose();
  };

  const handleDelete = () => {
    setDeleteDialog(true);
    handleMenuClose();
  };

  const handleDownload = async () => {
    try {
      const response = await axiosInstance.get(`/api/qrcode/${selectedQRCode.id}/image`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `qrcode-${selectedQRCode.name}.png`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('QR Code baixado com sucesso!');
    } catch (err) {
      toast.error('Erro ao baixar QR Code');
    }
    handleMenuClose();
  };

  const handlePrint = async () => {
    try {
      const response = await axiosInstance.post(`/api/qrcode/${selectedQRCode.id}/print`);
      toast.success('QR Code enviado para impressão!');
    } catch (err) {
      toast.error('Erro ao imprimir QR Code');
    }
    handleMenuClose();
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(selectedQRCode.url);
    toast.success('URL copiada para a área de transferência!');
    handleMenuClose();
  };

  const handleAnalytics = () => {
    fetchAnalytics(selectedQRCode.id);
    handleMenuClose();
  };

  const confirmDelete = async () => {
    try {
      await axiosInstance.delete(`/api/qrcode/${selectedQRCode.id}`);
      
      toast.success('QR Code excluído com sucesso!');
      setDeleteDialog(false);
      fetchQRCodes();
    } catch (err) {
      toast.error('Erro ao excluir QR Code');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'error';
      case 'expired': return 'warning';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'inactive': return 'Inativo';
      case 'expired': return 'Expirado';
      default: return status;
    }
  };

  if (loading && qrCodes.length === 0) {
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
          Gerenciar QR Codes
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/qrcode/generate')}
        >
          Gerar QR Code
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Filtros
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Buscar"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Nome, localização ou mesa..."
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                label="Status"
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <SelectMenuItem value="">Todos</SelectMenuItem>
                <SelectMenuItem value="available">Disponível</SelectMenuItem>
                <SelectMenuItem value="occupied">Ocupado</SelectMenuItem>
                <SelectMenuItem value="reserved">Reservado</SelectMenuItem>
                <SelectMenuItem value="maintenance">Manutenção</SelectMenuItem>
                <SelectMenuItem value="inactive">Inativo</SelectMenuItem>
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

      {/* QR Codes Grid */}
      <Grid container spacing={3}>
        {qrCodes.map((qrCode) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={qrCode.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <QrCodeIcon />
                  </Avatar>
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, qrCode)}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </Box>
                
                <Typography variant="h6" gutterBottom noWrap>
                  {qrCode.name}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {qrCode.location}
                </Typography>
                
                {qrCode.table_number && (
                  <Typography variant="body2" gutterBottom>
                    Mesa: {qrCode.table_number}
                  </Typography>
                )}
                
                <Box display="flex" gap={1} mb={2}>
                  <Chip
                    label={getStatusLabel(qrCode.status)}
                    color={getStatusColor(qrCode.status)}
                    size="small"
                  />
                </Box>
                
                <Typography variant="caption" color="text.secondary">
                  Criado: {qrCode.created_at ? format(new Date(qrCode.created_at), 'dd/MM/yyyy', { locale: ptBR }) : ''}
                </Typography>
                
                {qrCode.scan_count !== undefined && (
                  <Typography variant="caption" display="block" color="text.secondary">
                    Escaneamentos: {qrCode.scan_count}
                  </Typography>
                )}
              </CardContent>
              
              <CardActions>
                <Button
                  size="small"
                  onClick={() => {
                    setSelectedQRCode(qrCode);
                    setViewDialog(true);
                  }}
                >
                  Ver QR
                </Button>
                <Button
                  size="small"
                  onClick={() => navigate(`/qrcode/edit/${qrCode.id}`)}
                >
                  Editar
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {qrCodes.length === 0 && !loading && (
        <Box textAlign="center" py={4}>
          <QrCodeIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Nenhum QR Code encontrado
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/qrcode/generate')}
          >
            Gerar Primeiro QR Code
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
          Ver QR Code
        </MenuItem>
        <MenuItem onClick={handleEdit}>
          <EditIcon sx={{ mr: 1 }} />
          Editar
        </MenuItem>
        <MenuItem onClick={handleDownload}>
          <DownloadIcon sx={{ mr: 1 }} />
          Baixar
        </MenuItem>
        <MenuItem onClick={handlePrint}>
          <PrintIcon sx={{ mr: 1 }} />
          Imprimir
        </MenuItem>
        <MenuItem onClick={handleCopyUrl}>
          <CopyIcon sx={{ mr: 1 }} />
          Copiar URL
        </MenuItem>
        <MenuItem onClick={handleAnalytics}>
          <AnalyticsIcon sx={{ mr: 1 }} />
          Analytics
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} />
          Excluir
        </MenuItem>
      </Menu>

      {/* View QR Code Dialog */}
      <Dialog open={viewDialog} onClose={() => setViewDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>QR Code - {selectedQRCode?.name}</DialogTitle>
        <DialogContent>
          {selectedQRCode && (
            <Box textAlign="center">
              <QRCode
                value={selectedQRCode.url}
                size={256}
                level="M"
                includeMargin
              />
              <Typography variant="body2" color="text.secondary" mt={2}>
                {selectedQRCode.url}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog(false)}>Fechar</Button>
          <Button onClick={handleDownload} variant="contained">
            Baixar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Analytics Dialog */}
      <Dialog open={analyticsDialog} onClose={() => setAnalyticsDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Analytics - {selectedQRCode?.name}</DialogTitle>
        <DialogContent>
          {analytics && (
            <Grid container spacing={2}>
              <Grid item xs={6} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">
                    {analytics.total_scans}
                  </Typography>
                  <Typography variant="body2">
                    Total de Escaneamentos
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={6} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">
                    {analytics.unique_scans}
                  </Typography>
                  <Typography variant="body2">
                    Escaneamentos Únicos
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={6} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">
                    {analytics.feedbacks_generated}
                  </Typography>
                  <Typography variant="body2">
                    Feedbacks Gerados
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={6} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">
                    {analytics.conversion_rate}%
                  </Typography>
                  <Typography variant="body2">
                    Taxa de Conversão
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAnalyticsDialog(false)}>Fechar</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir o QR Code "{selectedQRCode?.name}"? Esta ação não pode ser desfeita.
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

export default QRCodeManage;