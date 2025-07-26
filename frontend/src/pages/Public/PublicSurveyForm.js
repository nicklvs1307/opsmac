import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  FormGroup,
  Rating,
  CircularProgress,
  Alert,
  Container,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButtonGroup,
  ToggleButton,
  Grid,
  Slider,
} from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import toast from 'react-hot-toast';

const PublicSurveyForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        setLoading(true);
        const { data } = await axiosInstance.get(`/api/public/surveys/${id}`);
        setSurvey(data);
        // Initialize answers state
        const initialAnswers = {};
        data.questions.forEach(q => {
          if (q.question_type === 'checkboxes') {
            initialAnswers[q.id] = [];
          } else {
            initialAnswers[q.id] = '';
          }
        });
        setAnswers(initialAnswers);
      } catch (err) {
        console.error('Error fetching survey:', err);
        setError(err.response?.data?.msg || 'Pesquisa não encontrada ou inativa.');
      } finally {
        setLoading(false);
      }
    };

    fetchSurvey();
  }, [id]);

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleCheckboxChange = (questionId, optionValue) => {
    setAnswers(prev => {
      const currentAnswers = prev[questionId] || [];
      if (currentAnswers.includes(optionValue)) {
        return {
          ...prev,
          [questionId]: currentAnswers.filter(item => item !== optionValue),
        };
      } else {
        return {
          ...prev,
          [questionId]: [...currentAnswers, optionValue],
        };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const formattedAnswers = Object.keys(answers).map(questionId => ({
      question_id: questionId,
      answer_value: Array.isArray(answers[questionId]) ? answers[questionId].join(',') : answers[questionId],
    }));

    try {
      await axiosInstance.post(`/api/public/surveys/${id}/responses`, { answers: formattedAnswers });
      toast.success('Sua resposta foi enviada com sucesso!');
      navigate('/thank-you'); // Redirecionar para uma página de agradecimento
    } catch (err) {
      console.error('Error submitting answers:', err);
      setError(err.response?.data?.msg || 'Erro ao enviar respostas.');
      toast.error(err.response?.data?.msg || 'Erro ao enviar respostas.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <Box textAlign="center" py={8}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
          <Button variant="contained" onClick={() => navigate('/')}>Voltar ao Início</Button>
        </Box>
      </Container>
    );
  }

  if (!survey) {
    return null; // Should not happen if loading and error are handled
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      bgcolor: '#f0f2f5', // Um fundo suave para destacar o Paper
      py: { xs: 2, sm: 4, md: 6 },
    }}>
      <Container maxWidth="sm">
        <Paper sx={{ 
          p: { xs: 3, md: 6 }, 
          elevation: 12, // Maior elevação para um efeito flutuante
          borderRadius: 4, 
          width: '100%',
          boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.1)', // Sombra mais pronunciada
        }}>
          <Typography variant="h3" component="h1" gutterBottom textAlign="center" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 2 }}>
            {survey.title}
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom textAlign="center" sx={{ mb: 5 }}>
            {survey.description}
          </Typography>

          <form onSubmit={handleSubmit}>
            {survey.questions.sort((a, b) => a.order - b.order).map((question) => (
              <Paper key={question.id} elevation={3} sx={{ p: { xs: 2, md: 3 }, mb: 4, borderRadius: 2, border: '1px solid #e0e0e0' }}>
                <Typography variant="h6" gutterBottom sx={{ mb: 2, color: 'text.primary' }}>{`${question.order}. ${question.question_text}`}</Typography>
                {
                  question.question_type === 'text' || question.question_type === 'textarea' ? (
                    <TextField
                      fullWidth
                      multiline={question.question_type === 'textarea'}
                      rows={question.question_type === 'textarea' ? 4 : 1}
                      label="Sua Resposta"
                      value={answers[question.id] || ''}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      variant="outlined"
                    />
                  ) : question.question_type === 'radio' ? (
                    <RadioGroup
                      value={answers[question.id] || ''}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    >
                      {question.options.map((option, index) => (
                        <FormControlLabel key={index} value={option} control={<Radio />} label={option} />
                      ))}
                    </RadioGroup>
                  ) : question.question_type === 'checkboxes' ? (
                    <FormGroup>
                      {question.options.map((option, index) => (
                        <FormControlLabel
                          key={index}
                          control={
                            <Checkbox
                              checked={(answers[question.id] || []).includes(option)}
                              onChange={() => handleCheckboxChange(question.id, option)}
                            />
                          }
                          label={option}
                        />
                      ))}
                    </FormGroup>
                  ) : question.question_type === 'dropdown' ? (
                    <FormControl fullWidth variant="outlined">
                      <InputLabel>Selecione uma opção</InputLabel>
                      <Select
                        value={answers[question.id] || ''}
                        label="Selecione uma opção"
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      >
                        {question.options.map((option, index) => (
                          <MenuItem key={index} value={option}>{option}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  ) : question.question_type === 'nps' ? (
                    <Box sx={{ width: '100%', mt: 2 }}>
                      <Typography variant="body2" gutterBottom textAlign="center">0 = Nada provável, 10 = Extremamente provável</Typography>
                      <Grid container spacing={1} justifyContent="center">
                        {[...Array(11).keys()].map((num) => (
                          <Grid item key={num}>
                            <Button
                              variant={parseInt(answers[question.id]) === num ? "contained" : "outlined"}
                              onClick={() => handleAnswerChange(question.id, num)}
                              sx={{
                                minWidth: '40px', // Ajuste para mobile
                                height: '40px',
                                borderRadius: '50%',
                                fontWeight: 'bold',
                                bgcolor: parseInt(answers[question.id]) === num ? 'primary.main' : 'transparent',
                                color: parseInt(answers[question.id]) === num ? 'white' : 'primary.main',
                                '&:hover': {
                                  bgcolor: 'primary.light',
                                  color: 'white',
                                },
                              }}
                            >
                              {num}
                            </Button>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  ) : question.question_type === 'csat' ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 2 }}>
                      <Typography variant="body2" gutterBottom>1 = Muito Insatisfeito, 5 = Muito Satisfeito</Typography>
                      <Rating
                        name={`csat-rating-${question.id}`}
                        value={parseInt(answers[question.id]) || 0}
                        onChange={(event, newValue) => {
                          handleAnswerChange(question.id, newValue);
                        }}
                        max={5}
                        size="large"
                        sx={{ '& .MuiRating-iconFilled': { color: '#ffb400' } }} // Cor das estrelas
                      />
                    </Box>
                  ) : question.question_type === 'ratings' ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 2 }}>
                      <Rating
                        name={`ratings-${question.id}`}
                        value={parseInt(answers[question.id]) || 0}
                        onChange={(event, newValue) => {
                          handleAnswerChange(question.id, newValue);
                        }}
                        max={5}
                        size="large"
                        sx={{ '& .MuiRating-iconFilled': { color: '#ffb400' } }} // Cor das estrelas
                      />
                    </Box>
                  ) : question.question_type === 'like_dislike' ? (
                    <ToggleButtonGroup
                      value={answers[question.id] || ''}
                      exclusive
                      onChange={(event, newSelection) => {
                        if (newSelection !== null) {
                          handleAnswerChange(question.id, newSelection);
                        }
                      }}
                      sx={{ mt: 2, display: 'flex', justifyContent: 'center', width: '100%' }}
                    >
                      <ToggleButton value="like" aria-label="gostei" sx={{ flexGrow: 1, py: 1.5, borderRadius: '8px !important' }}>
                        <ThumbUpIcon sx={{ mr: 1 }} /> Gostei
                      </ToggleButton>
                      <ToggleButton value="dislike" aria-label="não gostei" sx={{ flexGrow: 1, py: 1.5, borderRadius: '8px !important' }}>
                        <ThumbDownIcon sx={{ mr: 1 }} /> Não Gostei
                      </ToggleButton>
                    </ToggleButtonGroup>
                  ) : null
                }
              </Paper>
            ))}

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              disabled={submitting}
              sx={{ mt: 6, py: 1.8, fontSize: '1.2rem', borderRadius: 3, boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.2)' }}
            >
              {submitting ? <CircularProgress size={24} color="inherit" /> : 'Enviar Respostas'}
            </Button>
          </form>
        </Paper>

        <Box textAlign="center" mt={4}>
          <Typography variant="caption" color="text.disabled">
            Powered by Sistema de Feedback
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default PublicSurveyForm;