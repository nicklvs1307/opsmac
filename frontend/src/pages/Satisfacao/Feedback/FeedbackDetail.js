import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Rating,
  Chip,
  Avatar,
  Grid,
  Card,
  CardContent,
  Divider,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Reply as ReplyIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  QrCode as QrCodeIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import axiosInstance from '../../../api/axiosInstance';
import toast from 'react-hot-toast';

const FeedbackDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [replyDialog, setReplyDialog] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);

  useEffect(() => {
    fetchFeedback();
  }, [id]);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axiosInstance.get(`/api/feedback/${id}`);
      setFeedback(response.data);
    } catch (err) {
      console.error('Error fetching feedback:', err);
      setError('Erro ao carregar feedback');
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async () => {
    try {
      setReplyLoading(true);
      
      await axiosInstance.post(`/api/feedback/${id}/reply`, {
        response: replyText,
      });
      
      toast.success('Resposta enviada com sucesso!');
      setReplyDialog(false);
      setReplyText('');
      fetchFeedback();
    } catch (err) {
      toast.error('Erro ao enviar resposta');
    } finally {
      setReplyLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`/api/feedback/${id}`);
      
      toast.success('Feedback excluído com sucesso!');
      navigate('/feedback');
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

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'responded': return 'Respondido';
      case 'resolved': return 'Resolvido';
      default: return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'responded': return 'info';
      case 'resolved': return 'success';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error || !feedback) {
    return (
      <Box>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/satisfaction/feedback')}
          sx={{ mb: 2 }}
        >
          Voltar
        </Button>
        <Alert severity="error">
          {error || 'Feedback não encontrado'}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/satisfaction/feedback')}
          >
            Voltar
          </Button>
          <Typography variant="h4" component="h1">
            Detalhes do Feedback
          </Typography>
        </Box>
        
        <Box display="flex" gap={1}>
          {!feedback.response && (
            <Button
              variant="contained"
              startIcon={<ReplyIcon />}
              onClick={() => setReplyDialog(true)}
            >
              Responder
            </Button>
          )}
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/satisfaction/feedback/${id}/edit`)}
          >
            Editar
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => setDeleteDialog(true)}
          >
            Excluir
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Main Feedback Card */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3 }}>
            {/* Customer Info */}
            <Box display="flex" alignItems="center" gap={2} mb={3}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                {feedback.customer?.name?.charAt(0) || 'A'}
              </Avatar>
              <Box>
                <Typography variant="h5">
                  {feedback.customer?.name || 'Cliente Anônimo'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feedback.customer?.email || feedback.customer?.phone || 'Sem contato'}
                </Typography>
              </Box>
            </Box>

            {/* Rating and Tags */}
            <Box mb={3}>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Rating value={feedback.rating} readOnly size="large" />
                <Typography variant="h6">
                  {feedback.rating}/5
                </Typography>
              </Box>
              
              <Box display="flex" gap={1} flexWrap="wrap">
                <Chip
                  label={getTypeLabel(feedback.feedback_type)}
                  color={getTypeColor(feedback.feedback_type)}
                />
                <Chip
                  label={feedback.sentiment}
                  color={getSentimentColor(feedback.sentiment)}
                />
                <Chip
                  label={getSourceLabel(feedback.source)}
                  variant="outlined"
                />
                <Chip
                  label={getStatusLabel(feedback.status)}
                  color={getStatusColor(feedback.status)}
                />
                {feedback.table_number && (
                  <Chip
                    label={`Mesa ${feedback.table_number}`}
                    variant="outlined"
                  />
                )}
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Comment */}
            <Box mb={3}>
              <Typography variant="h6" gutterBottom>
                Comentário
              </Typography>
              <Typography variant="body1" paragraph>
                {feedback.comment}
              </Typography>
            </Box>

            {/* Response */}
            {feedback.response && (
              <Box>
                <Divider sx={{ my: 3 }} />
                <Typography variant="h6" gutterBottom>
                  Resposta
                </Typography>
                <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
                  <Typography variant="body1">
                    {feedback.response}
                  </Typography>
                  {feedback.response_date && (
                    <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                      Respondido em {format(new Date(feedback.response_date), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </Typography>
                  )}
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} lg={4}>
          {/* Timeline */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <ScheduleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Timeline
              </Typography>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  <strong>Criado:</strong> {format(new Date(feedback.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                </Typography>
                {feedback.updated_at && feedback.updated_at !== feedback.created_at && (
                  <Typography variant="body2" color="text.secondary">
                    <strong>Atualizado:</strong> {format(new Date(feedback.updated_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                  </Typography>
                )}
                {feedback.response_date && (
                  <Typography variant="body2" color="text.secondary">
                    <strong>Respondido:</strong> {format(new Date(feedback.response_date), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                  </Typography>
                )}
                {feedback.visit_date && (
                  <Typography variant="body2" color="text.secondary">
                    <strong>Data da Visita:</strong> {format(new Date(feedback.visit_date), 'dd/MM/yyyy', { locale: ptBR })}
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>

          {/* Customer Details */}
          {feedback.customer && (
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Detalhes do Cliente
                </Typography>
                <Box>
                  <Typography variant="body2">
                    <strong>Nome:</strong> {feedback.customer.name}
                  </Typography>
                  {feedback.customer.email && (
                    <Typography variant="body2" display="flex" alignItems="center" gap={1}>
                      <EmailIcon fontSize="small" />
                      {feedback.customer.email}
                    </Typography>
                  )}
                  {feedback.customer.phone && (
                    <Typography variant="body2" display="flex" alignItems="center" gap={1}>
                      <PhoneIcon fontSize="small" />
                      {feedback.customer.phone}
                    </Typography>
                  )}
                  {feedback.customer.total_visits && (
                    <Typography variant="body2">
                      <strong>Total de Visitas:</strong> {feedback.customer.total_visits}
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          )}

          {/* QR Code Details */}
          {feedback.qr_code && (
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <QrCodeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  QR Code
                </Typography>
                <Box>
                  <Typography variant="body2">
                    <strong>Nome:</strong> {feedback.qr_code.name}
                  </Typography>
                  {feedback.qr_code.location && (
                    <Typography variant="body2" display="flex" alignItems="center" gap={1}>
                      <LocationIcon fontSize="small" />
                      {feedback.qr_code.location}
                    </Typography>
                  )}
                  {feedback.qr_code.table_number && (
                    <Typography variant="body2">
                      <strong>Mesa:</strong> {feedback.qr_code.table_number}
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Analytics */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Estatísticas
              </Typography>
              <Box>
                <Typography variant="body2">
                  <strong>ID:</strong> #{feedback.id}
                </Typography>
                <Typography variant="body2">
                  <strong>Origem:</strong> {getSourceLabel(feedback.source)}
                </Typography>
                <Typography variant="body2">
                  <strong>Status:</strong> {getStatusLabel(feedback.status)}
                </Typography>
                {feedback.nps_score !== undefined && (
                  <Typography variant="body2">
                    <strong>NPS:</strong> {feedback.nps_score}
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

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
            placeholder="Digite sua resposta ao cliente..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReplyDialog(false)}>Cancelar</Button>
          <Button
            onClick={handleReply}
            variant="contained"
            disabled={!replyText.trim() || replyLoading}
            startIcon={replyLoading ? <CircularProgress size={20} /> : null}
          >
            {replyLoading ? 'Enviando...' : 'Enviar Resposta'}
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
          <Button onClick={handleDelete} color="error" variant="contained">
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FeedbackDetail;