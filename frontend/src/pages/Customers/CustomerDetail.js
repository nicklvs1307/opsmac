import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Avatar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Email as EmailIcon,
  Phone as PhoneIcon,
  Cake as CakeIcon,
  AccessTime as AccessTimeIcon,
  CheckCircle as CheckCircleIcon,
  Feedback as FeedbackIcon,
  Redeem as RedeemIcon,
  Poll as PollIcon,
  RotateLeft as ResetIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import axiosInstance from '../../api/axiosInstance';
import toast from 'react-hot-toast';

const CustomerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  useEffect(() => {
    const fetchCustomerDetails = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/api/customers/${id}/details`);
        setCustomer(response.data);
      } catch (err) {
        console.error('Error fetching customer details:', err);
        setError('Erro ao carregar detalhes do cliente.');
        toast.error('Erro ao carregar detalhes do cliente.');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerDetails();
  }, [id]);

  const handleResetVisits = async () => {
    try {
      setLoading(true);
      await axiosInstance.post(`/api/customers/${id}/reset-visits`);
      toast.success('Visitas do cliente resetadas com sucesso!');
      setResetConfirmOpen(false);
      // Atualizar o estado do cliente para refletir a mudança
      setCustomer(prev => ({ ...prev, total_visits: 0 }));
    } catch (err) {
      console.error('Error resetting visits:', err);
      toast.error(err.response?.data?.message || 'Erro ao resetar visitas.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 4, mt: 5, textAlign: 'center' }}>
        <Typography variant="h6" color="error">{error}</Typography>
        <Button variant="contained" onClick={() => navigate(-1)} sx={{ mt: 2 }}>Voltar</Button>
      </Paper>
    );
  }

  if (!customer) {
    return (
      <Paper sx={{ p: 4, mt: 5, textAlign: 'center' }}>
        <Typography variant="h6">Cliente não encontrado.</Typography>
        <Button variant="contained" onClick={() => navigate(-1)} sx={{ mt: 2 }}>Voltar</Button>
      </Paper>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Detalhes do Cliente: {customer.name}
      </Typography>

      <Grid container spacing={3} mt={2}>
        {/* Informações Básicas */}
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 60, height: 60 }}>
                  {customer.name?.charAt(0) || 'C'}
                </Avatar>
                <Box>
                  <Typography variant="h5">{customer.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Cliente desde {format(new Date(customer.createdAt), 'dd/MM/yyyy', { locale: ptBR })}
                  </Typography>
                </Box>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body1" gutterBottom>
                <EmailIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                Email: {customer.email || 'N/A'}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <PhoneIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                Telefone: {customer.phone || 'N/A'}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <CakeIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                Nascimento: {customer.birth_date ? format(new Date(customer.birth_date), 'dd/MM/yyyy', { locale: ptBR }) : 'N/A'}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <AccessTimeIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                Última Visita: {customer.last_visit ? format(new Date(customer.last_visit), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : 'Nunca'}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Pontos de Fidelidade:</strong> {customer.loyalty_points || 0}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Total de Visitas:</strong> {customer.total_visits || 0}
              </Typography>
              {customer.preferences && (
                <Typography variant="body1" gutterBottom>
                  <strong>Preferências:</strong> {customer.preferences}
                </Typography>
              )}
              <Button
                variant="outlined"
                color="error"
                startIcon={<ResetIcon />}
                onClick={() => setResetConfirmOpen(true)}
                sx={{ mt: 3 }}
              >
                Resetar Visitas
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Histórico de Check-ins */}
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                <CheckCircleIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                Histórico de Check-ins
              </Typography>
              <Divider sx={{ my: 2 }} />
              {customer.checkins && customer.checkins.length > 0 ? (
                <List>
                  {customer.checkins.map((checkin) => (
                    <ListItem key={checkin.id} disablePadding>
                      <ListItemText
                        primary={`Check-in em ${format(new Date(checkin.checkin_time), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`}
                        secondary={`Status: ${checkin.status}`}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">Nenhum check-in registrado.</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Histórico de Feedbacks */}
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                <FeedbackIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                Histórico de Feedbacks
              </Typography>
              <Divider sx={{ my: 2 }} />
              {customer.feedbacks && customer.feedbacks.length > 0 ? (
                <List>
                  {customer.feedbacks.map((feedback) => (
                    <ListItem key={feedback.id} disablePadding>
                      <ListItemText
                        primary={`Feedback em ${format(new Date(feedback.created_at), 'dd/MM/yyyy', { locale: ptBR })}`}
                        secondary={`Avaliação: ${feedback.rating || 'N/A'} - ${feedback.comment?.substring(0, 50) || ''}...`}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">Nenhum feedback registrado.</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Cupons Resgatados */}
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                <RedeemIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                Cupons Resgatados
              </Typography>
              <Divider sx={{ my: 2 }} />
              {customer.coupons && customer.coupons.length > 0 ? (
                <List>
                  {customer.coupons.map((coupon) => (
                    <ListItem key={coupon.id} disablePadding>
                      <ListItemText
                        primary={`${coupon.title} (Código: ${coupon.code})`}
                        secondary={`Resgatado em: ${format(new Date(coupon.updatedAt), 'dd/MM/yyyy', { locale: ptBR })}`}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">Nenhum cupom resgatado.</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Respostas de Pesquisas */}
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                <PollIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                Respostas de Pesquisas
              </Typography>
              <Divider sx={{ my: 2 }} />
              {customer.survey_responses && customer.survey_responses.length > 0 ? (
                <List>
                  {customer.survey_responses.map((response) => (
                    <ListItem key={response.id} disablePadding>
                      <ListItemText
                        primary={`Pesquisa: ${response.Survey?.title || 'N/A'}`}
                        secondary={`Respondido em: ${format(new Date(response.created_at), 'dd/MM/yyyy', { locale: ptBR })}`}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">Nenhuma resposta de pesquisa.</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dialog de Confirmação de Reset */}
      <Dialog
        open={resetConfirmOpen}
        onClose={() => setResetConfirmOpen(false)}
      >
        <DialogTitle>Confirmar Reset de Visitas</DialogTitle>
        <DialogContent>
          <Typography>Tem certeza que deseja resetar o total de visitas para este cliente para 0?</Typography>
          <Typography color="error">Esta ação não pode ser desfeita.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetConfirmOpen(false)}>Cancelar</Button>
          <Button onClick={handleResetVisits} color="error" variant="contained">
            Resetar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CustomerDetail;
