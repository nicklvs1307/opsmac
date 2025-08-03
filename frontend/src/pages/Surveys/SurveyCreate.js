import React, { useState } from 'react';
import { Box, Typography, Button, Paper, Stepper, Step, StepLabel, StepContent, CircularProgress, Select, MenuItem, FormControl, InputLabel, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import axiosInstance from '../../api/axiosInstance';
import toast from 'react-hot-toast';

const createSurvey = async (surveyData) => {
  const { data } = await axiosInstance.post('/api/surveys', surveyData);
  return data;
};

const fetchRewards = async () => {
    const { data } = await axiosInstance.get('/api/rewards?is_active=true');
    return data;
};

const SurveyCreate = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [surveyType, setSurveyType] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rewardId, setRewardId] = useState('');
  const [couponValidityDays, setCouponValidityDays] = useState('');
  const [questions, setQuestions] = useState([]);
  const [createdSurveyId, setCreatedSurveyId] = useState(null);
  const [openQrCodeDialog, setOpenQrCodeDialog] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: rewards, isLoading: isLoadingRewards } = useQuery('rewards', fetchRewards);

  const mutation = useMutation(createSurvey, {
    onSuccess: (data) => {
      queryClient.invalidateQueries('surveys');
      toast.success('Pesquisa criada com sucesso!');
      setCreatedSurveyId(data.id); // Armazena o ID da pesquisa criada
      setActiveStep(3); // Avança para um novo passo para exibir as opções
    },
    onError: (error) => {
      toast.error(`Erro ao criar pesquisa: ${error.response.data.msg || error.message}`);
    }
  });

  const handleNext = () => {
    if (activeStep === 0 && !surveyType) {
        toast.error('Por favor, selecione um tipo de pesquisa.');
        return;
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleCreate = () => {
    const surveyData = {
        type: surveyType,
        title,
        description,
        reward_id: rewardId || null,
        coupon_validity_days: couponValidityDays ? parseInt(couponValidityDays, 10) : null,
        questions
    };
    mutation.mutate(surveyData);
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Tipo de Pesquisa</InputLabel>
            <Select value={surveyType} label="Tipo de Pesquisa" onChange={(e) => setSurveyType(e.target.value)}>
              <MenuItem value="custom">Personalizada</MenuItem>
              <MenuItem value="delivery_csat">Delivery (CSAT)</MenuItem>
              <MenuItem value="menu_feedback">Feedback do Cardápio</MenuItem>
              <MenuItem value="customer_profile">Perfil do Cliente</MenuItem>
              <MenuItem value="nps_only">NPS (Apenas)</MenuItem>
              <MenuItem value="salon_ratings">Salão (Ratings)</MenuItem>
              <MenuItem value="salon_like_dislike">Salão (Like/Dislike)</MenuItem>
            </Select>
          </FormControl>
        );
      case 1:
        return (
            <Box sx={{ mb: 3 }}>
                <TextField fullWidth label="Título" value={title} onChange={(e) => setTitle(e.target.value)} sx={{ mb: 2 }} />
                <TextField fullWidth label="Descrição" value={description} onChange={(e) => setDescription(e.target.value)} multiline rows={3} sx={{ mb: 2 }} />
                <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Recompensa (Opcional)</InputLabel>
                    <Select value={rewardId} label="Recompensa (Opcional)" onChange={(e) => setRewardId(e.target.value)}>
                        <MenuItem value=""><em>Nenhuma</em></MenuItem>
                        {isLoadingRewards ? (
                            <MenuItem disabled>Carregando recompensas...</MenuItem>
                        ) : (
                            rewards?.map((reward) => (
                                <MenuItem key={reward.id} value={reward.id}>{reward.title}</MenuItem>
                            ))
                        )}
                    </Select>
                </FormControl>
                <TextField
                    fullWidth
                    label="Dias de Validade do Cupom (Opcional)"
                    type="number"
                    value={couponValidityDays}
                    onChange={(e) => setCouponValidityDays(e.target.value)}
                    sx={{ mb: 2 }}
                    InputProps={{
                        inputProps: { min: 1 }
                    }}
                />
                {/* A lógica para adicionar perguntas personalizadas será adicionada aqui */}
            </Box>
        )
      case 2:
        return <Typography>Revise os detalhes da sua pesquisa antes de criá-la.</Typography>;
      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Pesquisa Criada com Sucesso!</Typography>
            {createdSurveyId && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="body1">ID da Pesquisa: <strong>{createdSurveyId}</strong></Typography>
                <Typography variant="body1">Link Público: <a href={`/public/surveys/${createdSurveyId}`} target="_blank" rel="noopener noreferrer">{`/public/surveys/${createdSurveyId}`}</a></Typography>
                <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                  <Button variant="outlined" onClick={handleCopyLink}>Copiar Link</Button>
                  <Button variant="outlined" onClick={() => setOpenQrCodeDialog(true)}>Gerar QR Code</Button>
                  <Button variant="outlined" onClick={() => navigate(`/surveys/edit/${createdSurveyId}`)}>Editar Pesquisa</Button>
                  <Button variant="outlined" color="error" onClick={handleDeleteSurvey}>Apagar Pesquisa</Button>
                </Box>
              </Box>
            )}
            <Button variant="contained" onClick={() => navigate('/surveys')} sx={{ mt: 2 }}>Ver Todas as Pesquisas</Button>

            {/* QR Code Dialog */}
            <Dialog open={openQrCodeDialog} onClose={() => setOpenQrCodeDialog(false)}>
              <DialogTitle>QR Code da Pesquisa</DialogTitle>
              <DialogContent>
                <Typography variant="body1" sx={{ mb: 2 }}>Escaneie o QR Code para acessar a pesquisa:</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  {/* Seu componente de QR Code vai aqui. Ex: <QRCode value={`http://localhost:3000/public/surveys/${createdSurveyId}`} size={256} /> */}
                  <Paper elevation={3} sx={{ p: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', width: 256, height: 256 }}>
                    <Typography variant="caption" color="text.secondary">Integrar seu módulo de QR Code aqui</Typography>
                  </Paper>
                </Box>
                <Typography variant="body2" textAlign="center">Link: <a href={`/public/surveys/${createdSurveyId}`} target="_blank" rel="noopener noreferrer">{`/public/surveys/${createdSurveyId}`}</a></Typography>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpenQrCodeDialog(false)}>Fechar</Button>
              </DialogActions>
            </Dialog>
          </Box>
        );
      default:
        return <Typography>Passo desconhecido</Typography>;
    }
  };

  const deleteMutation = useMutation((id) => axiosInstance.delete(`/api/surveys/${id}`), {
    onSuccess: () => {
      queryClient.invalidateQueries('surveys');
      toast.success('Pesquisa apagada com sucesso!');
      navigate('/surveys');
    },
    onError: (error) => {
      toast.error(`Erro ao apagar pesquisa: ${error.response.data.msg || error.message}`);
    }
  });

  const handleDeleteSurvey = () => {
    if (window.confirm('Tem certeza que deseja apagar esta pesquisa? Esta ação é irreversível.')) {
      deleteMutation.mutate(createdSurveyId);
    }
  };

  const handleCopyLink = () => {
    const publicLink = `${window.location.origin}/public/surveys/${createdSurveyId}`;
    navigator.clipboard.writeText(publicLink)
      .then(() => {
        toast.success('Link copiado para a área de transferência!');
      })
      .catch((err) => {
        toast.error('Erro ao copiar o link.');
        console.error('Erro ao copiar o link:', err);
      });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Criar Nova Pesquisa</Typography>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Stepper activeStep={activeStep} orientation="vertical" sx={{ mt: 2 }}>
            {['Escolha o Tipo', 'Configure', 'Revise e Crie', 'Ações da Pesquisa'].map((label, index) => (
                <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                    <StepContent>
                        {renderStepContent(index)}
                        <Box sx={{ mt: 2 }}>
                            <Button disabled={activeStep === 0} onClick={handleBack} sx={{ mr: 1 }}>Voltar</Button>
                            <Button variant="contained" onClick={activeStep === 2 ? handleCreate : handleNext}>
                                {activeStep === 2 ? 'Criar Pesquisa' : 'Próximo'}
                            </Button>
                        </Box>
                    </StepContent>
                </Step>
            ))}
        </Stepper>
        {mutation.isLoading && <CircularProgress sx={{ mt: 2 }} />}
      </Paper>
    </Box>
  );
};

export default SurveyCreate;