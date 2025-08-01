
import React from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Paper, CircularProgress, Alert, Grid } from '@mui/material';
import { useQuery } from 'react-query';
import axiosInstance from '../../api/axiosInstance';

const fetchSurveyResults = async (surveyId) => {
  const { data } = await axiosInstance.get(`/api/surveys/${surveyId}/results`);
  return data;
};

const SurveyResults = () => {
  const { id } = useParams();
  const { data, isLoading, error } = useQuery(['surveyResults', id], () => fetchSurveyResults(id));

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">Erro ao carregar resultados da pesquisa: {error.message}</Alert>
    );
  }

  if (!data) {
    return <Alert severity="info">Nenhum resultado encontrado para esta pesquisa.</Alert>;
  }

  const { survey, totalResponses, npsScore, csatAverage, ratingsAverage } = data;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Resultados da Pesquisa: {survey.title}
      </Typography>
      <Typography variant="h6" color="text.secondary" gutterBottom sx={{ mb: 4 }}>
        {survey.description}
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="subtitle1" color="text.secondary">Total de Respostas</Typography>
            <Typography variant="h3">{totalResponses}</Typography>
          </Paper>
        </Grid>
        {npsScore !== null && (
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="subtitle1" color="text.secondary">NPS Score</Typography>
              <Typography variant="h3">{npsScore.toFixed(0)}</Typography>
            </Paper>
          </Grid>
        )}
        {csatAverage !== null && (
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="subtitle1" color="text.secondary">CSAT Médio</Typography>
              <Typography variant="h3">{csatAverage.toFixed(2)}</Typography>
            </Paper>
          </Grid>
        )}
        {ratingsAverage !== null && (
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="subtitle1" color="text.secondary">Média de Avaliações</Typography>
              <Typography variant="h3">{ratingsAverage.toFixed(2)}</Typography>
            </Paper>
          </Grid>
        )}
      </Grid>

      <Box sx={{ mt: 5 }}>
        <Typography variant="h5" gutterBottom>Detalhes das Perguntas</Typography>
        {survey.questions.map((question) => (
          <Paper key={question.id} elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>{question.question_text}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Tipo: {question.question_type}</Typography>
            {question.question_type === 'text' || question.question_type === 'textarea' ? (
              <Box sx={{ mt: 1 }}>
                <Typography variant="subtitle2" gutterBottom>Respostas:</Typography>
                {question.answers && question.answers.length > 0 ? (
                  <Box component="ul" sx={{ listStyleType: 'none', p: 0, m: 0 }}>
                    {question.answers.map((answer, index) => (
                      <Box component="li" key={index} sx={{ mb: 1, p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
                        <Typography variant="body2">{answer.answer_value}</Typography>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">Nenhuma resposta para esta pergunta.</Typography>
                )}
              </Box>
            ) : (
              <Typography variant="body1" sx={{ mt: 1 }}>
                Respostas: {question.answers ? question.answers.length : 0}
              </Typography>
            )}
          </Paper>
        ))}
      </Box>
    </Box>
  );
};

export default SurveyResults;
