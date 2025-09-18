import React from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Paper, CircularProgress, Alert, Grid } from '@mui/material';
import { useSurveyResults } from '../api/surveyService'; // Import useSurveyResults
import { useAuth } from '@/app/providers/contexts/AuthContext'; // Importar useAuth
import { useTranslation } from 'react-i18next'; // Importar useTranslation
import { usePermissions } from '../../../hooks/usePermissions';
import MetricCard from '@/shared/components/MetricCard';
// import NpsScoresByCriterion from '../components/NpsScoresByCriterion';
// import QuestionResultCard from '../components/QuestionResultCard';
import { calculateNPS } from '../../utils/npsCalculations';

const SurveyResultsPage = () => {
  const { id } = useParams();
  const { t } = useTranslation(); // Obter função de tradução
  const { user } = useAuth(); // Obter usuário para acessar enabled_modules
  const { can } = usePermissions();
  // const enabledModules = user?.restaurants?.[0]?.settings?.enabled_modules || []; // Old logic, no longer needed

  const { data, isLoading, error } = useSurveyResults(id, {
    onError: (err) => {
      console.error('Erro ao carregar resultados da pesquisa:', err);
    },
  });

  // Verifica se o módulo de pesquisas/feedback está habilitado
  if (!can('fidelity:satisfaction:surveys', 'read')) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="warning">
          {t('common.module_not_enabled', { moduleName: t('modules.satisfaction') })}
        </Alert>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">Erro ao carregar resultados da pesquisa: {error.message}</Alert>;
  }

  if (!data) {
    return <Alert severity="info">Nenhum resultado encontrado para esta pesquisa.</Alert>;
  }

  const { survey, totalResponses, npsScore, csatAverage, ratingsAverage } = data;
  const npsCriteriaScores = data.restaurant?.npsCriteriaScores || {};

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
          <MetricCard title={t('survey_results.total_responses')} value={totalResponses} />
        </Grid>
        {npsScore !== null && (
          <Grid item xs={12} md={4}>
            <MetricCard title={t('survey_results.nps_overall')} value={npsScore.toFixed(0)} />
          </Grid>
        )}
        {csatAverage !== null && (
          <Grid item xs={12} md={4}>
            <MetricCard title={t('survey_results.csat_average')} value={csatAverage.toFixed(2)} />
          </Grid>
        )}
        {ratingsAverage !== null && (
          <Grid item xs={12} md={4}>
            <MetricCard
              title={t('survey_results.ratings_average')}
              value={ratingsAverage.toFixed(2)}
            />
          </Grid>
        )}
      </Grid>

      {/* {Object.keys(npsCriteriaScores).length > 0 && (
        <Box sx={{ mt: 5 }}>
          <NpsScoresByCriterion
            npsMetricsPerCriterion={Object.values(npsCriteriaScores).map((scores, index) => ({
              id: Object.keys(npsCriteriaScores)[index], // Adicionar ID para key
              name:
                survey.questions.find(
                  (q) => q.npsCriterion?.id === Object.keys(npsCriteriaScores)[index]
                )?.npsCriterion?.name || `Critério ID: ${Object.keys(npsCriteriaScores)[index]}`,
              promoters: scores.promoters,
              passives: scores.passives,
              detractors: scores.detractors,
              totalResponses: scores.total,
              npsScore: calculateNPS(scores.promoters, scores.passives, scores.detractors),
            }))}
          />
        </Box>
      )} */}

      <Box sx={{ mt: 5 }}>
        <Typography variant="h5" gutterBottom>
          Detalhes das Perguntas
        </Typography>
        {/* {survey.questions.map((question) => (
          <QuestionResultCard key={question.id} question={question} />
        ))} */}
      </Box>
    </Box>
  );
};

export default SurveyResultsPage;
