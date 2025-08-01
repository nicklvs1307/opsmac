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
  TextField,
  DialogContentText,
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
  DeleteForever as DeleteForeverIcon,
  Edit as EditIcon,
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
  const [clearCheckinsConfirmOpen, setClearCheckinsConfirmOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});

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

  const handleClearCheckins = async () => {
    try {
      setLoading(true);
      await axiosInstance.post(`/api/customers/${id}/clear-checkins`);
      toast.success('Check-ins do cliente limpos com sucesso!');
      setClearCheckinsConfirmOpen(false);
      // Atualizar o estado do cliente para refletir a mudança
      setCustomer(prev => ({ ...prev, checkins: [] }));
    } catch (err) {
      console.error('Error clearing checkins:', err);
      toast.error(err.response?.data?.message || 'Erro ao limpar check-ins.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = () => {
    setEditFormData({
      name: customer.name || '',
      email: customer.email || '',
      phone: customer.phone || '',
      birth_date: customer.birth_date ? format(new Date(customer.birth_date), 'yyyy-MM-dd') : '',
      gender: customer.gender || '',
      cpf: customer.cpf || '',
      whatsapp: customer.whatsapp || '',
      loyalty_points: customer.loyalty_points || 0,
      total_visits: customer.total_visits || 0,
      total_spent: customer.total_spent || 0,
      customer_segment: customer.customer_segment || '',
      status: customer.status || '',
      source: customer.source || '',
      referral_code: customer.referral_code || '',
      notes: customer.notes || '',
      tags: customer.tags || [],
      marketing_consent: customer.marketing_consent || false,
      email_verified: customer.email_verified || false,
      phone_verified: customer.phone_verified || false,
      gdpr_consent: customer.gdpr_consent || false,
    });
    setEditModalOpen(true);
  };

  const handleEditFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleEditSubmit = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.put(`/api/customers/${id}`, editFormData);
      setCustomer(response.data);
      toast.success('Cliente atualizado com sucesso!');
      setEditModalOpen(false);
    } catch (err) {
      console.error('Error updating customer:', err);
      toast.error(err.response?.data?.message || 'Erro ao atualizar cliente.');
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
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={handleEditClick}
          sx={{ ml: 3 }}
        >
          Editar Cliente
        </Button>
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
                  <strong>Preferências:</strong> {typeof customer.preferences === 'object' ? JSON.stringify(customer.preferences) : customer.preferences}
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
              <Button
                variant="outlined"
                color="warning"
                startIcon={<DeleteForeverIcon />}
                onClick={() => setClearCheckinsConfirmOpen(true)}
                sx={{ mt: 3, ml: 2 }}
              >
                Limpar Check-ins
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

      {/* Dialog de Confirmação de Limpeza de Check-ins */}
      <Dialog
        open={clearCheckinsConfirmOpen}
        onClose={() => setClearCheckinsConfirmOpen(false)}
      >
        <DialogTitle>Confirmar Limpeza de Check-ins</DialogTitle>
        <DialogContent>
          <Typography>Tem certeza que deseja limpar TODOS os check-ins para este cliente?</Typography>
          <Typography color="error">Esta ação não pode ser desfeita.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClearCheckinsConfirmOpen(false)}>Cancelar</Button>
          <Button onClick={handleClearCheckins} color="warning" variant="contained">
            Limpar Check-ins
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Edição de Cliente */}
      <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>Editar Cliente</DialogTitle>
        <DialogContent>
          <DialogContentText mb={3}>
            Preencha os campos abaixo para atualizar os dados do cliente.
          </DialogContentText>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                name="name"
                label="Nome"
                type="text"
                fullWidth
                variant="outlined"
                value={editFormData.name || ''}
                onChange={handleEditFormChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                name="email"
                label="Email"
                type="email"
                fullWidth
                variant="outlined"
                value={editFormData.email || ''}
                onChange={handleEditFormChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                name="phone"
                label="Telefone"
                type="text"
                fullWidth
                variant="outlined"
                value={editFormData.phone || ''}
                onChange={handleEditFormChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                name="whatsapp"
                label="WhatsApp"
                type="text"
                fullWidth
                variant="outlined"
                value={editFormData.whatsapp || ''}
                onChange={handleEditFormChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                name="cpf"
                label="CPF"
                type="text"
                fullWidth
                variant="outlined"
                value={editFormData.cpf || ''}
                onChange={handleEditFormChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                name="birth_date"
                label="Data de Nascimento"
                type="date"
                fullWidth
                variant="outlined"
                InputLabelProps={{
                  shrink: true,
                }}
                value={editFormData.birth_date || ''}
                onChange={handleEditFormChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                name="gender"
                label="Gênero"
                type="text"
                fullWidth
                variant="outlined"
                value={editFormData.gender || ''}
                onChange={handleEditFormChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                name="loyalty_points"
                label="Pontos de Fidelidade"
                type="number"
                fullWidth
                variant="outlined"
                value={editFormData.loyalty_points || 0}
                onChange={handleEditFormChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                name="total_visits"
                label="Total de Visitas"
                type="number"
                fullWidth
                variant="outlined"
                value={editFormData.total_visits || 0}
                onChange={handleEditFormChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                name="total_spent"
                label="Total Gasto"
                type="number"
                fullWidth
                variant="outlined"
                value={editFormData.total_spent || 0}
                onChange={handleEditFormChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                name="customer_segment"
                label="Segmento do Cliente"
                type="text"
                fullWidth
                variant="outlined"
                value={editFormData.customer_segment || ''}
                onChange={handleEditFormChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                name="status"
                label="Status"
                type="text"
                fullWidth
                variant="outlined"
                value={editFormData.status || ''}
                onChange={handleEditFormChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                name="source"
                label="Fonte"
                type="text"
                fullWidth
                variant="outlined"
                value={editFormData.source || ''}
                onChange={handleEditFormChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                name="referral_code"
                label="Código de Referência"
                type="text"
                fullWidth
                variant="outlined"
                value={editFormData.referral_code || ''}
                onChange={handleEditFormChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                name="notes"
                label="Notas"
                type="text"
                fullWidth
                multiline
                rows={3}
                variant="outlined"
                value={editFormData.notes || ''}
                onChange={handleEditFormChange}
              />
            </Grid>
            {/* Adicionar mais campos conforme necessário, como tags, consentimentos, etc. */}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditModalOpen(false)}>Cancelar</Button>
          <Button onClick={handleEditSubmit} color="primary" variant="contained">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CustomerDetail;
