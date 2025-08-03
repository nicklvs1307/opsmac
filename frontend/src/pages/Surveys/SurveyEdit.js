import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, CircularProgress, TextField, FormControl, InputLabel, Select, MenuItem, IconButton } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axiosInstance from '../../api/axiosInstance';
import toast from 'react-hot-toast';
import DeleteIcon from '@mui/icons-material/Delete';

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

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rewardId, setRewardId] = useState('');
  const [couponValidityDays, setCouponValidityDays] = useState('');
  const [questions, setQuestions] = useState([]);

  const { data: survey, isLoading, isError, error } = useQuery(['survey', id], () => fetchSurvey(id), {
    onSuccess: (data) => {
      setTitle(data.title);
      setDescription(data.description);
      setRewardId(data.reward_id || '');
      setCouponValidityDays(data.coupon_validity_days || '');
      setQuestions(data.questions || []); // Populate questions
    },
    onError: (err) => {
      toast.error(`Erro ao carregar pesquisa: ${err.response.data.msg || err.message}`);
    }
  });

  const { data: rewards, isLoading: isLoadingRewards } = useQuery('rewards', fetchRewards);

  const mutation = useMutation(updateSurvey, {
    onSuccess: () => {
      queryClient.invalidateQueries(['survey', id]);
      queryClient.invalidateQueries('surveys');
      toast.success('Pesquisa atualizada com sucesso!');
      navigate('/surveys'); // Redireciona para a lista de pesquisas
    },
    onError: (err) => {
      toast.error(`Erro ao atualizar pesquisa: ${err.response.data.msg || err.message}`);
    }
  });

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
      description,
      reward_id: rewardId || null,
      coupon_validity_days: couponValidityDays ? parseInt(couponValidityDays, 10) : null,
      questions: questions.map((q, index) => ({ ...q, order: index + 1 })), // Ensure order is correct
    };
    mutation.mutate({ id, surveyData });
  };

  if (isLoading) return <CircularProgress />;
  if (isError) return <Typography color="error">Erro: {error.message}</Typography>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Editar Pesquisa</Typography>
      <Paper elevation={3} sx={{ p: 4 }}>
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

        <Typography variant="h5" sx={{ mt: 3, mb: 2 }}>Perguntas</Typography>
        {questions.map((question, qIndex) => (
          <Paper key={question.id} elevation={1} sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Pergunta {qIndex + 1}</Typography>
              <IconButton color="error" onClick={() => handleRemoveQuestion(qIndex)}>
                <DeleteIcon />
              </IconButton>
            </Box>
            <TextField
              fullWidth
              label="Texto da Pergunta"
              value={question.question_text}
              onChange={(e) => handleQuestionChange(qIndex, 'question_text', e.target.value)}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Tipo de Pergunta</InputLabel>
              <Select
                value={question.question_type}
                label="Tipo de Pergunta"
                onChange={(e) => handleQuestionChange(qIndex, 'question_type', e.target.value)}
              >
                <MenuItem value="text">Texto Curto</MenuItem>
                <MenuItem value="textarea">Texto Longo</MenuItem>
                <MenuItem value="radio">Múltipla Escolha (Única)</MenuItem>
                <MenuItem value="checkboxes">Múltipla Escolha (Múltipla)</MenuItem>
                <MenuItem value="dropdown">Dropdown</MenuItem>
                <MenuItem value="nps">NPS</MenuItem>
                <MenuItem value="csat">CSAT</MenuItem>
                <MenuItem value="ratings">Avaliação (Estrelas)</MenuItem>
                <MenuItem value="like_dislike">Gostei/Não Gostei</MenuItem>
              </Select>
            </FormControl>

            {(question.question_type === 'radio' ||
              question.question_type === 'checkboxes' ||
              question.question_type === 'dropdown') && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom>Opções:</Typography>
                {question.options.map((option, optIndex) => (
                  <Box key={optIndex} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <TextField
                      fullWidth
                      label={`Opção ${optIndex + 1}`}
                      value={option}
                      onChange={(e) => handleOptionChange(qIndex, optIndex, e.target.value)}
                    />
                    <IconButton color="error" onClick={() => handleRemoveOption(qIndex, optIndex)} sx={{ ml: 1 }}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                ))}
                <Button variant="outlined" onClick={() => handleAddOption(qIndex)} sx={{ mt: 1 }}>Adicionar Opção</Button>
              </Box>
            )}
          </Paper>
        ))}
        <Button variant="contained" onClick={handleAddQuestion} sx={{ mb: 2 }}>Adicionar Pergunta</Button>

        <Box sx={{ mt: 3 }}>
          <Button variant="contained" onClick={handleSubmit} disabled={mutation.isLoading}>
            {mutation.isLoading ? <CircularProgress size={24} /> : 'Salvar Alterações'}
          </Button>
          <Button variant="outlined" onClick={() => navigate('/surveys')} sx={{ ml: 2 }}>Cancelar</Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default SurveyEdit;