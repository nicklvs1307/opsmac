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
  alpha,
} from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import toast from 'react-hot-toast';

const PublicSurveyForm = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState(null);
  const [restaurantName, setRestaurantName] = useState('');
  const [restaurantLogo, setRestaurantLogo] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#3f51b5'); // Default Material Blue
  const [secondaryColor, setSecondaryColor] = useState('#f50057'); // Default Material Pink
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        setLoading(true);
        const { data } = await axiosInstance.get(`/api/public/surveys/${slug}`);
        setSurvey(data.survey);
        setRestaurantName(data.restaurant.name);
        setRestaurantLogo(data.restaurant.logo);
        setPrimaryColor(data.restaurant.settings?.primary_color || '#3f51b5');
        setSecondaryColor(data.restaurant.settings?.secondary_color || '#f50057');
        // Initialize answers state
        const initialAnswers = {};
        data.survey.questions.forEach(q => {
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
  }, [slug]);

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
      await axiosInstance.post(`/api/public/surveys/${slug}/responses`, { answers: formattedAnswers });
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
      background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`, // Gradiente suave para melhor aparência
      py: { xs: 2, sm: 4, md: 6 },
      px: 2, // Padding horizontal para mobile
    }}>
      {/* Logo ou ícone do restaurante poderia ser adicionado aqui */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
        {restaurantLogo ? (
          <img 
            src={restaurantLogo} 
            alt={restaurantName || "Restaurant Logo"} 
            style={{ 
              height: '60px', 
              width: 'auto',
              filter: 'drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.15))'
            }} 
          />
        ) : (
          <img 
            src="/logo192.png" 
            alt="Default Logo" 
            style={{ 
              height: '60px', 
              width: 'auto',
              filter: 'drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.15))'
            }} 
          />
        )}
      </Box>
      <Container maxWidth="sm">
        <Paper sx={{ 
          p: { xs: 3, md: 6 }, 
          elevation: 0, // Sem elevação para um design mais clean
          borderRadius: 4, 
          width: '100%',
          boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.08)', // Sombra mais suave
          border: '1px solid rgba(0, 0, 0, 0.05)', // Borda sutil
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: `linear-gradient(90deg, ${primaryColor}, ${secondaryColor})`, // Barra colorida no topo
            zIndex: 1,
          },
          backdropFilter: 'blur(10px)', // Efeito de vidro fosco (funciona em navegadores modernos)
        }}>
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom 
            textAlign="center" 
            sx={{ 
              fontWeight: 800, 
              background: `linear-gradient(45deg, ${primaryColor} 30%, ${secondaryColor} 90%)`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2,
              fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' }, // Responsivo
              letterSpacing: '-0.5px',
            }}
          >
            {survey.title}
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary" 
            gutterBottom 
            textAlign="center" 
            sx={{ 
              mb: 5, 
              maxWidth: '90%', 
              mx: 'auto',
              fontSize: { xs: '0.95rem', sm: '1rem', md: '1.1rem' },
              lineHeight: 1.6,
              opacity: 0.85,
            }}
          >
            {survey.description}
          </Typography>

          <form onSubmit={handleSubmit}>
            {survey.questions.sort((a, b) => a.order - b.order).map((question) => (
              <Paper 
                key={question.id} 
                elevation={0} 
                sx={{ 
                  p: { xs: 3, md: 4 }, 
                  mb: 4, 
                  borderRadius: 2, 
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.08)',
                    transform: 'translateY(-2px)',
                  },
                  background: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(8px)',
                }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      bgcolor: primaryColor,
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      mr: 2,
                      flexShrink: 0,
                      fontSize: '0.9rem',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    }}
                  >
                    {question.order}
                  </Box>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: 'text.primary',
                      fontWeight: 600,
                      lineHeight: 1.3,
                      fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
                    }}
                  >
                    {question.question_text}
                  </Typography>
                </Box>
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
                                bgcolor: primaryColor,
                                color: parseInt(answers[question.id]) === num ? 'white' : primaryColor,
                                '&:hover': {
                                  bgcolor: secondaryColor,
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
              sx={{ 
                mt: 6, 
                py: 2, 
                fontSize: { xs: '1.1rem', md: '1.2rem' }, 
                borderRadius: 3, 
                boxShadow: `0px 8px 20px ${alpha(primaryColor, 0.3)}`, 
                background: `linear-gradient(45deg, ${primaryColor} 30%, ${secondaryColor} 90%)`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: `0px 10px 25px ${alpha(primaryColor, 0.4)}`,
                  transform: 'translateY(-2px)'
                },
                '&:active': {
                  transform: 'translateY(1px)'
                }
              }}
            >
              {submitting ? 
                <CircularProgress size={24} color="inherit" /> : 
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span>Enviar Respostas</span>
                </Box>
              }
            </Button>
          </form>
        </Paper>

        <Box textAlign="center" mt={4} sx={{ opacity: 0.8, transition: 'opacity 0.3s ease', '&:hover': { opacity: 1 } }}>
          <Typography variant="caption" color="text.disabled" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <span>Powered by</span> 
            <span style={{ fontWeight: 'bold', background: `linear-gradient(45deg, ${primaryColor} 30%, ${secondaryColor} 90%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Sistema de Feedback
            </span>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default PublicSurveyForm;