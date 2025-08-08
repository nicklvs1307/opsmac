import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, Stepper, Step, StepLabel, StepContent, CircularProgress, Select, MenuItem, FormControl, InputLabel, TextField, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, List, ListItem, ListItemText, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import axiosInstance from '../../../api/axiosInstance';
import toast from 'react-hot-toast';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../contexts/AuthContext'; // Importar useAuth

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
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [rewardId, setRewardId] = useState('');
  const [couponValidityDays, setCouponValidityDays] = useState('');
  const [questions, setQuestions] = useState([]);
  const [createdSurveyId, setCreatedSurveyId] = useState(null);
  const [createdSurveySlug, setCreatedSurveySlug] = useState(null);
  const [openQrCodeDialog, setOpenQrCodeDialog] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { user } = useAuth(); // Obter usuário para acessar enabled_modules
  const enabledModules = user?.restaurants?.[0]?.settings?.enabled_modules || [];

  // Verifica se o módulo de pesquisas/feedback está habilitado
  if (!enabledModules.includes('surveys_feedback')) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="warning">
          {t('common.module_not_enabled', { moduleName: t('modules.surveys_feedback') })}
        </Alert>
      </Box>
    );
  }

  const { data: rewards, isLoading: isLoadingRewards } = useQuery('rewards', fetchRewards);
  const { data: npsCriteria, isLoading: isLoadingNpsCriteria } = useQuery('npsCriteria', fetchNpsCriteria);

  const mutation = useMutation(createSurvey, {
    onSuccess: (data) => {
      queryClient.invalidateQueries('surveys');
      toast.success(t('survey_create.success_message'));
      setCreatedSurveyId(data.id);
      setCreatedSurveySlug(data.slug);
      setActiveStep(3);
    },
    onError: (error) => {
      toast.error(t('survey_create.error_message', { message: error.response?.data?.msg || error.message }));
    }
  });

  // Efeito para pré-popular as perguntas com base no tipo de pesquisa
  useEffect(() => {
    if (surveyType === 'nps_only') {
      if (npsCriteria && npsCriteria.length > 0) {
        const npsQuestions = npsCriteria.map((criterion, index) => ({
          question_text: t('survey_create.nps_question_text', { name: criterion.name }),
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
        toast.error(t('survey_create.select_type_error'));
        return;
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleCreate = () => {
    if (!title.trim()) {
        toast.error(t('survey_create.title_required_error'));
        return;
    }
    if (surveyType === 'nps_only' && questions.length === 0) {
        toast.error(t('survey_create.no_nps_criteria_error'));
        return;
    }
    const surveyData = {
        type: surveyType,
        title,
        slug,
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
            <InputLabel>{t('survey_create.survey_type_label')}</InputLabel>
            <Select value={surveyType} label={t('survey_create.survey_type_label')} onChange={(e) => setSurveyType(e.target.value)}>
              <MenuItem value="nps_only">{t('survey_create.type_nps_dynamic')}</MenuItem>
              <MenuItem value="custom">{t('survey_create.type_custom_soon')}</MenuItem>
              <MenuItem value="delivery_csat">{t('survey_create.type_delivery_csat')}</MenuItem>
              <MenuItem value="menu_feedback">{t('survey_create.type_menu_feedback')}</MenuItem>
              <MenuItem value="customer_profile">{t('survey_create.type_customer_profile')}</MenuItem>
              <MenuItem value="salon_ratings">{t('survey_create.type_salon_ratings')}</MenuItem>
              <MenuItem value="salon_like_dislike">{t('survey_create.type_salon_like_dislike')}</MenuItem>
            </Select>
          </FormControl>
        );
      case 1:
        return (
            <Box sx={{ mb: 3 }}>
                <TextField fullWidth label={t('survey_create.title_label')} value={title} onChange={(e) => setTitle(e.target.value)} sx={{ mb: 2 }} />
                <TextField fullWidth label={t('survey_create.slug_label')} value={slug} onChange={(e) => setSlug(e.target.value)} sx={{ mb: 2 }} helperText={t('survey_create.slug_helper')} />
                <TextField fullWidth label={t('survey_create.description_label')} value={description} onChange={(e) => setDescription(e.target.value)} multiline rows={3} sx={{ mb: 2 }} />
                <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>{t('survey_create.reward_label')}</InputLabel>
                    <Select value={rewardId} label={t('survey_create.reward_label')} onChange={(e) => setRewardId(e.target.value)}>
                        <MenuItem value=""><em>{t('common.none')}</em></MenuItem>
                        {isLoadingRewards ? (
                            <MenuItem disabled>{t('survey_create.loading_rewards')}</MenuItem>
                        ) : (
                            rewards?.map((reward) => (
                                <MenuItem key={reward.id} value={reward.id}>{reward.title}</MenuItem>
                            ))
                        )}
                    </Select>
                </FormControl>
                <TextField
                    fullWidth
                    label={t('survey_create.coupon_validity_days_label')}
                    type="number"
                    value={couponValidityDays}
                    onChange={(e) => setCouponValidityDays(e.target.value)}
                    sx={{ mb: 2 }}
                    InputProps={{ inputProps: { min: 1 } }}
                />
                {surveyType === 'nps_only' && (
                    <Box mt={2}> 
                        <Typography variant="h6">{t('survey_create.nps_questions_title')}</Typography>
                        {isLoadingNpsCriteria ? <CircularProgress size={24} /> : 
                            <List>
                                {questions.length > 0 ? questions.map(q => (
                                    <ListItem key={q.nps_criterion_id}>
                                        <ListItemText primary={q.question_text} />
                                    </ListItem>
                                )) : <Typography variant="body2" color="text.secondary">{t('survey_create.no_nps_criteria_found')}</Typography>}
                            </List>
                        }
                    </Box>
                )}
            </Box>
        )
      case 2:
        return <Typography>{t('survey_create.review_details')}</Typography>;
      case 3: // ... (código do passo 3 permanece o mesmo)
        return (
            <Box>
              <Typography variant="h6" gutterBottom>{t('survey_create.created_success_title')}</Typography>
              {createdSurveyId && createdSurveySlug && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body1">{t('survey_create.public_link_label')} <a href={`/public/surveys/${createdSurveySlug}`} target="_blank" rel="noopener noreferrer">{`/public/surveys/${createdSurveySlug}`}</a></Typography>
                  <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                    <Button variant="outlined" onClick={() => navigator.clipboard.writeText(`${window.location.origin}/public/surveys/${createdSurveySlug}`).then(() => toast.success(t('common.link_copied')))}>{t('common.copy_link')}</Button>
                    <Button variant="outlined" onClick={() => setOpenQrCodeDialog(true)}>{t('survey_create.generate_qr_code_button')}</Button>
                    <Button variant="outlined" onClick={() => navigate(`/fidelity/surveys/edit/${createdSurveyId}`)}>{t('survey_create.edit_survey_button')}</Button>
                  </Box>
                </Box>
              )}
              <Button variant="contained" onClick={() => navigate('/satisfaction/surveys')} sx={{ mt: 2 }}>{t('survey_create.view_all_surveys_button')}</Button>
              <Dialog open={openQrCodeDialog} onClose={() => setOpenQrCodeDialog(false)}>
                <DialogTitle>{t('survey_create.qr_code_dialog_title')}</DialogTitle>
                <DialogContent sx={{ display: 'flex', justifyContent: 'center' }}>
                  {/* Integrar QR Code aqui */}
                  <Paper elevation={3} sx={{ p: 2, width: 256, height: 256, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                     <Typography variant="caption">{t('common.qr_code')}</Typography>
                  </Paper>
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setOpenQrCodeDialog(false)}>{t('common.close')}</Button>
                </DialogActions>
              </Dialog>
            </Box>
          );
      default:
        return <Typography>{t('survey_create.unknown_step')}</Typography>;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>{t('survey_create.main_title')}</Typography>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Stepper activeStep={activeStep} orientation="vertical" sx={{ mt: 2 }}>
            {[t('survey_create.step_choose_type'), t('survey_create.step_configure_details'), t('survey_create.step_review_and_create'), t('survey_create.step_actions')].map((label, index) => (
                <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                    <StepContent>
                        {renderStepContent(index)}
                        <Box sx={{ mt: 2 }}>
                            <Button disabled={activeStep === 0} onClick={handleBack} sx={{ mr: 1 }}>{t('common.back')}</Button>
                            <Button variant="contained" onClick={activeStep === 2 ? handleCreate : handleNext} disabled={mutation.isLoading}>
                                {mutation.isLoading ? <CircularProgress size={24}/> : (activeStep === 2 ? t('survey_create.create_survey_button') : t('common.next'))}
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