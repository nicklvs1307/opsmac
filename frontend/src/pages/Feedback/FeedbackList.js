import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Rating,
  Avatar,
  IconButton,
  Menu,
  MenuItem as MenuItemComponent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  Pagination,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  Reply as ReplyIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';



const FeedbackList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const restaurantId = user?.restaurants?.[0]?.id; // Acessa o ID do primeiro restaurante do usuário
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    rating: '',
    type: '',
    status: '',
    source: '',
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [replyDialog, setReplyDialog] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [deleteDialog, setDeleteDialog] = useState(false);

  useEffect(() => {
    fetchFeedbacks();
  }, [page, filters]);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = {
        page,
        limit: 10,
      };

      // Adicionar filtros apenas se tiverem valor
      for (const key in filters) {
        if (filters[key] !== '' && filters[key] !== null && filters[key] !== undefined) {
          params[key] = filters[key];
        }
      }
      
      const response = await axiosInstance.get(`/api/feedback/restaurant/${restaurantId}`, { params });
      
      setFeedbacks(response.data.feedbacks);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      console.error('Error fetching feedbacks:', err);
      setError('Erro ao carregar feedbacks');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(1);
  };

  const handleMenuOpen = (event, feedback) => {
    setAnchorEl(event.currentTarget);
    setSelectedFeedback(feedback);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedFeedback(null);
  };

  const handleReply = () => {
    setReplyDialog(true);
    handleMenuClose();
  };

  const handleView = () => {
    navigate(`/feedback/${selectedFeedback.id}`);
    handleMenuClose();
  };

  const handleDelete = () => {
    setDeleteDialog(true);
    handleMenuClose();
  };

  const submitReply = async () => {
    try {
      await axiosInstance.post(`/api/feedback/${selectedFeedback.id}/reply`, {
        response: replyText,
      });
      
      toast.success('Resposta enviada com sucesso!');
      setReplyDialog(false);
      setReplyText('');
      fetchFeedbacks();
    } catch (err) {
      toast.error('Erro ao enviar resposta');
    }
  };

  const confirmDelete = async () => {
    try {
      await axiosInstance.delete(`/api/feedback/${selectedFeedback.id}`);
      
      toast.success('Feedback excluído com sucesso!');
      setDeleteDialog(false);
      fetchFeedbacks();
    } catch (err) {
      toast.error('Erro ao excluir feedback');
    }
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive': return 'success';
      case 'negative': return 'error';
      case 'neutral': return 'warning';
      default: return 'default';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'compliment': return 'success';
      case 'complaint': return 'error';
      case 'suggestion': return 'info';
      case 'criticism': return 'warning';
      default: return 'default';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'compliment': return 'Elogio';
      case 'complaint': return 'Reclamação';
      case 'suggestion': return 'Sugestão';
      case 'criticism': return 'Crítica';
      default: return type;
    }
  };

  const getSourceLabel = (source) => {
    switch (source) {
      case 'qr_code': return 'QR Code';
      case 'whatsapp': return 'WhatsApp';
      case 'manual': return 'Manual';
      case 'website': return 'Website';
      default: return source;
    }
  };

  if (loading && feedbacks.length === 0) {
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
          Feedbacks
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/feedback/new')}
        >
          Novo Feedback
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Filtros
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Buscar"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Avaliação</InputLabel>
              <Select
                value={filters.rating}
                label="Avaliação"
                onChange={(e) => handleFilterChange('rating', e.target.value)}
              >
                <MenuItem value="">Todas</MenuItem>
                <MenuItem value="5">5 estrelas</MenuItem>
                <MenuItem value="4">4 estrelas</MenuItem>
                <MenuItem value="3">3 estrelas</MenuItem>
                <MenuItem value="2">2 estrelas</MenuItem>
                <MenuItem value="1">1 estrela</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Tipo</InputLabel>
              <Select
                value={filters.type}
                label="Tipo"
                onChange={(e) => handleFilterChange('type', e.target.value)}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="compliment">Elogio</MenuItem>
                <MenuItem value="complaint">Reclamação</MenuItem>
                <MenuItem value="suggestion">Sugestão</MenuItem>
                <MenuItem value="criticism">Crítica</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                label="Status"
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="pending">Pendente</MenuItem>
                <MenuItem value="responded">Respondido</MenuItem>
                <MenuItem value="resolved">Resolvido</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Origem</InputLabel>
              <Select
                value={filters.source}
                label="Origem"
                onChange={(e) => handleFilterChange('source', e.target.value)}
              >
                <MenuItem value="">Todas</MenuItem>
                <MenuItem value="qrcode">QR Code</MenuItem>
                <MenuItem value="whatsapp">WhatsApp</MenuItem>
                <MenuItem value="manual">Manual</MenuItem>
                <MenuItem value="website">Website</MenuItem>
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

      {/* Feedback List */}
      <Grid container spacing={2}>
        {feedbacks.map((feedback) => (
          <Grid item xs={12} key={feedback.id}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Box display="flex" gap={2} flex={1}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      {feedback.customer?.name?.charAt(0) || 'A'}
                    </Avatar>
                    <Box flex={1}>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Typography variant="h6">
                          {feedback.customer?.name || 'Cliente Anônimo'}
                        </Typography>
                        <Rating value={feedback.rating} readOnly size="small" />
                        <Typography variant="body2" color="text.secondary">
                          ({feedback.rating}/5)
                        </Typography>
                      </Box>
                      
                      <Box display="flex" gap={1} mb={2}>
                        <Chip
                          label={getTypeLabel(feedback.feedback_type)}
                          color={getTypeColor(feedback.feedback_type)}
                          size="small"
                        />
                        <Chip
                          label={feedback.sentiment}
                          color={getSentimentColor(feedback.sentiment)}
                          size="small"
                        />
                        <Chip
                          label={getSourceLabel(feedback.source)}
                          variant="outlined"
                          size="small"
                        />
                        {feedback.table_number && (
                          <Chip
                            label={`Mesa ${feedback.table_number}`}
                            variant="outlined"
                            size="small"
                          />
                        )}
                      </Box>
                      
                      <Typography variant="body1" paragraph>
                        {feedback.comment}
                      </Typography>
                      
                      {feedback.response && (
                        <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1, mt: 2 }}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            <strong>Resposta:</strong>
                          </Typography>
                          <Typography variant="body2">
                            {feedback.response}
                          </Typography>
                        </Box>
                      )}
                      
                      <Typography variant="caption" color="text.secondary">
                        {feedback.created_at ? format(new Date(feedback.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : ''}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <IconButton
                    onClick={(e) => handleMenuOpen(e, feedback)}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {feedbacks.length === 0 && !loading && (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="text.secondary">
            Nenhum feedback encontrado
          </Typography>
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
        <MenuItemComponent onClick={handleView}>
          <ViewIcon sx={{ mr: 1 }} />
          Ver Detalhes
        </MenuItemComponent>
        {!selectedFeedback?.response && (
          <MenuItemComponent onClick={handleReply}>
            <ReplyIcon sx={{ mr: 1 }} />
            Responder
          </MenuItemComponent>
        )}
        <MenuItemComponent onClick={handleDelete} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} />
          Excluir
        </MenuItemComponent>
      </Menu>

      {/* Reply Dialog */}
      <Dialog open={replyDialog} onClose={() => setReplyDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Responder Feedback</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Sua resposta"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReplyDialog(false)}>Cancelar</Button>
          <Button onClick={submitReply} variant="contained" disabled={!replyText.trim()}>
            Enviar Resposta
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir este feedback? Esta ação não pode ser desfeita.
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

export default FeedbackList;