import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, Stepper, Step, StepLabel, StepContent, CircularProgress, Select, MenuItem, FormControl, InputLabel, TextField, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, List, ListItem, ListItemText } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import axiosInstance from '../../../api/axiosInstance';
import toast from 'react-hot-toast';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';

// Funções da API
const createSurvey = async (surveyData) => {
  const { data } = await axiosInstance.post('/api/surveys', surveyData);
  return data;
};

const fetchRewards = async () => {
    const { data } = await axiosInstance.get('/api/rewards?is_active=true');
    return data;
};

const fetchNpsCriteria = async () => {
    const { data } = await axiosInstance.get('/api/nps-criteria');
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
  const [createdSurveySlug, setCreatedSurveySlug] = useState(null);
  const [openQrCodeDialog, setOpenQrCodeDialog] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: rewards, isLoading: isLoadingRewards } = useQuery('rewards', fetchRewards);
  const { data: npsCriteria, isLoading: isLoadingNpsCriteria } = useQuery('npsCriteria', fetchNpsCriteria);

  const mutation = useMutation(createSurvey, {
    onSuccess: (data) => {
      queryClient.invalidateQueries('surveys');
      toast.success('Pesquisa criada com sucesso!');
      setCreatedSurveyId(data.id);
      setCreatedSurveySlug(data.slug);
      setActiveStep(3);
    },
    onError: (error) => {
      toast.error(`Erro ao criar pesquisa: ${error.response?.data?.msg || error.message}`);
    }
  });

  // Efeito para pré-popular as perguntas com base no tipo de pesquisa
  useEffect(() => {
    if (surveyType === 'nps_only') {
      if (npsCriteria && npsCriteria.length > 0) {
        const npsQuestions = npsCriteria.map((criterion, index) => ({
          question_text: `Qual sua nota para ${criterion.name}?`,
          question_type: 'nps',
          order: index + 1,
          nps_criterion_id: criterion.id
        }));
        setQuestions(npsQuestions);
      } else {
        setQuestions([]);
      }
    } else {
      setQuestions([]); // Limpa para outros tipos de pesquisa
    }
  }, [surveyType, npsCriteria]);

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
    if (!title.trim()) {
        toast.error('O título da pesquisa é obrigatório.');
        return;
    }
    if (surveyType === 'nps_only' && questions.length === 0) {
        toast.error('Não há critérios de NPS cadastrados. Adicione critérios nas configurações de satisfação antes de criar uma pesquisa de NPS.');
        return;
    }
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
              <MenuItem value="nps_only">NPS (Dinâmico)</MenuItem>
              <MenuItem value="custom">Personalizada (Em breve)</MenuItem>
              <MenuItem value="delivery_csat">Delivery (CSAT)</MenuItem>
              <MenuItem value="menu_feedback">Feedback do Cardápio</MenuItem>
              <MenuItem value="customer_profile">Perfil do Cliente</MenuItem>
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
                            <MenuItem disabled>Carregando...</MenuItem>
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
                    InputProps={{ inputProps: { min: 1 } }}
                />
                {surveyType === 'nps_only' && (
                    <Box mt={2}> 
                        <Typography variant="h6">Perguntas de NPS (geradas automaticamente)</Typography>
                        {isLoadingNpsCriteria ? <CircularProgress size={24} /> : 
                            <List>
                                {questions.length > 0 ? questions.map(q => (
                                    <ListItem key={q.nps_criterion_id}>
                                        <ListItemText primary={q.question_text} />
                                    </ListItem>
                                )) : <Typography variant="body2" color="text.secondary">Nenhum critério de NPS encontrado. Adicione-os nas configurações.</Typography>}
                            </List>
                        }
                    </Box>
                )}
            </Box>
        )
      case 2:
        return <Typography>Revise os detalhes da sua pesquisa antes de criá-la.</Typography>;
      case 3: // ... (código do passo 3 permanece o mesmo)
        return (
            <Box>
              <Typography variant="h6" gutterBottom>Pesquisa Criada com Sucesso!</Typography>
              {createdSurveyId && createdSurveySlug && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body1">Link Público: <a href={`/public/surveys/${createdSurveySlug}`} target="_blank" rel="noopener noreferrer">{`/public/surveys/${createdSurveySlug}`}</a></Typography>
                  <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                    <Button variant="outlined" onClick={() => navigator.clipboard.writeText(`${window.location.origin}/public/surveys/${createdSurveySlug}`).then(() => toast.success('Link copiado!'))}>Copiar Link</Button>
                    <Button variant="outlined" onClick={() => setOpenQrCodeDialog(true)}>Gerar QR Code</Button>
                    <Button variant="outlined" onClick={() => navigate(`/fidelity/surveys/edit/${createdSurveyId}`)}>Editar Pesquisa</Button>
                  </Box>
                </Box>
              )}
              <Button variant="contained" onClick={() => navigate('/satisfaction/surveys')} sx={{ mt: 2 }}>Ver Todas as Pesquisas</Button>
              <Dialog open={openQrCodeDialog} onClose={() => setOpenQrCodeDialog(false)}>
                <DialogTitle>QR Code da Pesquisa</DialogTitle>
                <DialogContent sx={{ display: 'flex', justifyContent: 'center' }}>
                  {/* Integrar QR Code aqui */}
                  <Paper elevation={3} sx={{ p: 2, width: 256, height: 256, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                     <Typography variant="caption">QR Code</Typography>
                  </Paper>
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

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Criar Nova Pesquisa</Typography>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Stepper activeStep={activeStep} orientation="vertical" sx={{ mt: 2 }}>
            {['Escolha o Tipo', 'Configure Detalhes e Perguntas', 'Revise e Crie', 'Ações'].map((label, index) => (
                <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                    <StepContent>
                        {renderStepContent(index)}
                        <Box sx={{ mt: 2 }}>
                            <Button disabled={activeStep === 0} onClick={handleBack} sx={{ mr: 1 }}>Voltar</Button>
                            <Button variant="contained" onClick={activeStep === 2 ? handleCreate : handleNext} disabled={mutation.isLoading}>
                                {mutation.isLoading ? <CircularProgress size={24}/> : (activeStep === 2 ? 'Criar Pesquisa' : 'Próximo')}
                            </Button>
                        </Box>
                    </StepContent>
                </Step>
            ))}
        </Stepper>
      </Paper>
    </Box>
  );
};

export default SurveyCreate;