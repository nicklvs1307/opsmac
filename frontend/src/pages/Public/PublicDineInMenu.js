import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, CircularProgress, Alert, Card, CardContent, CardMedia, Grid, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import { useQuery, useMutation } from 'react-query';
import axiosInstance from '../../api/axiosInstance';

const fetchDineInMenu = async (tableId) => {
  const { data } = await axiosInstance.get(`/public/menu/dine-in/${tableId}`);
  return data;
};

const startTableSession = async (tableId) => {
  const { data } = await axiosInstance.post(`/public/menu/dine-in/${tableId}/start-session`);
  return data;
};

const callWaiter = async ({ sessionId, description }) => {
  const { data } = await axiosInstance.post(`/public/menu/dine-in/${sessionId}/call-waiter`, { description });
  return data;
};

const requestBill = async (sessionId) => {
  const { data } = await axiosInstance.post(`/public/menu/dine-in/${sessionId}/request-bill`);
  return data;
};

const getSessionStatus = async (sessionId) => {
  const { data } = await axiosInstance.get(`/public/menu/dine-in/${sessionId}/status`);
  return data;
};

const PublicDineInMenu = () => {
  const { tableId } = useParams();
  const [sessionId, setSessionId] = useState(localStorage.getItem(`tableSession_${tableId}`));
  const [openWaiterDialog, setOpenWaiterDialog] = useState(false);
  const [waiterCallDescription, setWaiterCallDescription] = useState('');

  // Query for menu items
  const { data: menuItems, isLoading: isLoadingMenu, isError: isErrorMenu } = useQuery(
    ['dineInMenu', tableId],
    () => fetchDineInMenu(tableId),
    {
      enabled: !!tableId,
    }
  );

  // Mutation to start session
  const sessionMutation = useMutation(() => startTableSession(tableId), {
    onSuccess: (data) => {
      setSessionId(data.session.id);
      localStorage.setItem(`tableSession_${tableId}`, data.session.id);
    },
    onError: (error) => {
      console.error('Error starting session:', error);
      // Handle error, maybe show a toast
    }
  });

  // Query for session status (polling)
  const { data: sessionStatus, refetch: refetchSessionStatus } = useQuery(
    ['sessionStatus', sessionId],
    () => getSessionStatus(sessionId),
    {
      enabled: !!sessionId,
      refetchInterval: 5000, // Poll every 5 seconds
    }
  );

  // Mutation to call waiter
  const callWaiterMutation = useMutation(callWaiter, {
    onSuccess: () => {
      alert('Chamada para o garçom enviada!');
      setOpenWaiterDialog(false);
      setWaiterCallDescription('');
      refetchSessionStatus(); // Refetch status to update UI
    },
    onError: (error) => {
      console.error('Error calling waiter:', error);
      alert('Erro ao chamar o garçom.');
    }
  });

  // Mutation to request bill
  const requestBillMutation = useMutation(requestBill, {
    onSuccess: () => {
      alert('Solicitação de conta enviada!');
      refetchSessionStatus(); // Refetch status to update UI
    },
    onError: (error) => {
      console.error('Error requesting bill:', error);
      alert('Erro ao solicitar a conta.');
    }
  });

  useEffect(() => {
    if (tableId && !sessionId) {
      sessionMutation.mutate();
    }
  }, [tableId, sessionId, sessionMutation]);

  if (isLoadingMenu) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (isErrorMenu) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Alert severity="error">Erro ao carregar o cardápio. Verifique o link ou tente novamente mais tarde.</Alert>
      </Box>
    );
  }

  if (!menuItems || menuItems.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography variant="h6">Nenhum item encontrado para este cardápio de salão.</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom align="center">
        Cardápio da Mesa
      </Typography>

      {sessionId && (
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button variant="contained" onClick={() => setOpenWaiterDialog(true)}>
            Chamar Garçom
          </Button>
          <Button variant="contained" onClick={() => requestBillMutation.mutate(sessionId)}>
            Solicitar Conta
          </Button>
        </Box>
      )}

      {sessionStatus && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Status da Sessão: {sessionStatus.status.replace(/_/g, ' ')}
          {sessionStatus.pending_calls && sessionStatus.pending_calls.length > 0 && (
            <>
              <br />
              Chamadas Pendentes: {sessionStatus.pending_calls.map(call => call.type).join(', ')}
            </>
          )}
        </Alert>
      )}

      <Grid container spacing={3}>
        {menuItems.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.id}>
            <Card>
              {/* You might add an image here if product has an image field */}
              {/* <CardMedia
                component="img"
                height="140"
                image={item.imageUrl || '/placeholder.png'}
                alt={item.name}
              /> */}
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  {item.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.description}
                </Typography>
                <Typography variant="h6" color="primary" mt={2}>
                  R$ {Number(item.price).toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Dialog for Call Waiter */}
      <Dialog open={openWaiterDialog} onClose={() => setOpenWaiterDialog(false)}>
        <DialogTitle>Chamar Garçom</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Mensagem (opcional)"
            type="text"
            fullWidth
            variant="standard"
            value={waiterCallDescription}
            onChange={(e) => setWaiterCallDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenWaiterDialog(false)}>Cancelar</Button>
          <Button onClick={() => callWaiterMutation.mutate({ sessionId, description: waiterCallDescription })}>
            Enviar Chamada
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PublicDineInMenu;