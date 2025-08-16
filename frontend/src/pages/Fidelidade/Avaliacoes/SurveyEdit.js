import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, CircularProgress, TextField, FormControl, InputLabel, Select, MenuItem, IconButton, Alert } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axiosInstance from '../../api/axiosInstance';
import toast from 'react-hot-toast';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../contexts/AuthContext'; // Importar useAuth

const fetchSurvey = async (id) => {
  const { data } = await axiosInstance.get(`/api/surveys/${id}`);
  return data;
};

const fetchRewards = async () => {
    const { data } = await axiosInstance.get('/api/rewards?is_active=true');
    return data;
};

const updateSurvey = async ({ id, surveyData }) => {
  const { data } = await axiosInstance.put(`/api/surveys/${id}`, surveyData);
  return data;
};

const SurveyEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { user } = useAuth(); // Obter usuário para acessar enabled_modules
  const enabledModules = user?.restaurants?.[0]?.settings?.enabled_modules || [];

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [rewardId, setRewardId] = useState('');
  const [couponValidityDays, setCouponValidityDays] = useState('');
  const [questions, setQuestions] = useState([]);

  const { data: survey, isLoading, isError, error } = useQuery(['survey', id], () => fetchSurvey(id), {
    onSuccess: (data) => {
      setTitle(data.title);
      setSlug(data.slug);
      setDescription(data.description);
      setRewardId(data.reward_id || '');
      setCouponValidityDays(data.coupon_validity_days || '');
      setQuestions(data.questions || []); // Populate questions
    },
    onError: (err) => {
      toast.error(t('survey_edit.load_error', { message: err.response.data.msg || err.message }));
    }
  });

  const { data: rewards, isLoading: isLoadingRewards } = useQuery('rewards', fetchRewards);

  const mutation = useMutation(updateSurvey, {
    onSuccess: () => {
      queryClient.invalidateQueries(['survey', id]);
      queryClient.invalidateQueries('surveys');
      toast.success(t('survey_edit.update_success'));
      navigate('/satisfaction/surveys'); // {t('survey_edit.redirect_to_list')}
    },
    onError: (err) => {
      toast.error(t('survey_edit.update_error', { message: err.response.data.msg || err.message }));
    }
  });

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

  const handleAddQuestion = () => {
    setQuestions([...questions, {
      id: Math.random().toString(36).substring(7), // Temporary ID
      question_text: '',
      question_type: 'text',
      options: [],
      order: questions.length + 1,
    }]);
  };

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    setQuestions(newQuestions);
  };

  const handleOptionChange = (qIndex, optIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[optIndex] = value;
    setQuestions(newQuestions);
  };

  const handleAddOption = (qIndex) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options.push('');
    setQuestions(newQuestions);
  };

  const handleRemoveOption = (qIndex, optIndex) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options.splice(optIndex, 1);
    setQuestions(newQuestions);
  };

  const handleRemoveQuestion = (index) => {
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions);
  };

  const handleSubmit = () => {
    const surveyData = {
      title,
      slug,
      description,
      reward_id: rewardId || null,
      coupon_validity_days: couponValidityDays ? parseInt(couponValidityDays, 10) : null,
      questions: questions.map((q, index) => ({ ...q, order: index + 1 })), // Ensure order is correct
    };
    mutation.mutate({ id, surveyData });
  };

  if (isLoading) return <CircularProgress />;
  if (isError) return <Typography color="error">{t('common.error')}: {error.message}</Typography>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>{t('survey_edit.title')}</Typography>
      <Paper elevation={3} sx={{ p: 4 }}>
        <TextField fullWidth label={t('survey_edit.title_label')} value={title} onChange={(e) => setTitle(e.target.value)} sx={{ mb: 2 }} />
        <TextField fullWidth label={t('survey_edit.slug_label')} value={slug} onChange={(e) => setSlug(e.target.value)} sx={{ mb: 2 }} helperText={t('survey_edit.slug_helper')} />
        <TextField fullWidth label={t('survey_edit.description_label')} value={description} onChange={(e) => setDescription(e.target.value)} multiline rows={3} sx={{ mb: 2 }} />

        <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>{t('survey_edit.reward_label')}</InputLabel>
            <Select value={rewardId} label={t('survey_edit.reward_label')} onChange={(e) => setRewardId(e.target.value)}>
                <MenuItem value=""><em>{t('common.none')}</em></MenuItem>
                {isLoadingRewards ? (
                    <MenuItem disabled>{t('survey_edit.loading_rewards')}</MenuItem>
                ) : (
                    rewards?.map((reward) => (
                        <MenuItem key={reward.id} value={reward.id}>{reward.title}</MenuItem>
                    ))
                )}
            </Select>
        </FormControl>

        <TextField
            fullWidth
            label={t('survey_edit.coupon_validity_days_label')}
            type="number"
            value={couponValidityDays}
            onChange={(e) => setCouponValidityDays(e.target.value)}
            sx={{ mb: 2 }}
            InputProps={{
                inputProps: { min: 1 }
            }}
        />

        <Typography variant="h5" sx={{ mt: 3, mb: 2 }}>{t('survey_edit.questions_title')}</Typography>
        {questions.map((question, qIndex) => (
          <Paper key={question.id} elevation={1} sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">{t('survey_edit.question_number', { number: qIndex + 1 })}</Typography>
              <IconButton color="error" onClick={() => handleRemoveQuestion(qIndex)}>
                <DeleteIcon />
              </IconButton>
            </Box>
            <TextField
              fullWidth
              label={t('survey_edit.question_text_label')}
              value={question.question_text}
              onChange={(e) => handleQuestionChange(qIndex, 'question_text', e.target.value)}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>{t('survey_edit.question_type_label')}</InputLabel>
              <Select
                value={question.question_type}
                label={t('survey_edit.question_type_label')}
                onChange={(e) => handleQuestionChange(qIndex, 'question_type', e.target.value)}
              >
                <MenuItem value="text">{t('survey_edit.question_type_text')}</MenuItem>
                <MenuItem value="textarea">{t('survey_edit.question_type_textarea')}</MenuItem>
                <MenuItem value="radio">{t('survey_edit.question_type_radio')}</MenuItem>
                <MenuItem value="checkboxes">{t('survey_edit.question_type_checkboxes')}</MenuItem>
                <MenuItem value="dropdown">{t('survey_edit.question_type_dropdown')}</MenuItem>
                <MenuItem value="nps">{t('survey_edit.question_type_nps')}</MenuItem>
                <MenuItem value="csat">{t('survey_edit.question_type_csat')}</MenuItem>
                <MenuItem value="ratings">{t('survey_edit.question_type_ratings')}</MenuItem>
                <MenuItem value="like_dislike">{t('survey_edit.question_type_like_dislike')}</MenuItem>
              </Select>
            </FormControl>

            {(question.question_type === 'radio' ||
              question.question_type === 'checkboxes' ||
              question.question_type === 'dropdown') && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom>{t('survey_edit.options_title')}</Typography>
                {question.options.map((option, optIndex) => (
                  <Box key={optIndex} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <TextField
                      fullWidth
                      label={t('survey_edit.option_label', { number: optIndex + 1 })}
                      value={option}
                      onChange={(e) => handleOptionChange(qIndex, optIndex, e.target.value)}
                    />
                    <IconButton color="error" onClick={() => handleRemoveOption(qIndex, optIndex)} sx={{ ml: 1 }}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                ))}
                <Button variant="outlined" onClick={() => handleAddOption(qIndex)} sx={{ mt: 1 }}>{t('survey_edit.add_option_button')}</Button>
              </Box>
            )}
          </Paper>
        ))}
        <Button variant="contained" onClick={handleAddQuestion} sx={{ mb: 2 }}>{t('survey_edit.add_question_button')}</Button>

        <Box sx={{ mt: 3 }}>
          <Button variant="contained" onClick={handleSubmit} disabled={mutation.isLoading}>
            {mutation.isLoading ? <CircularProgress size={24} /> : t('survey_edit.save_changes_button')}
          </Button>
          <Button variant="outlined" onClick={() => navigate('/satisfaction/surveys')} sx={{ ml: 2 }}>{t('common.cancel')}</Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default SurveyEdit;