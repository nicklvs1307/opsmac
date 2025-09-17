import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { useTranslation } from 'react-i18next';

const QuestionResultCard = ({ question }) => {
  const { t } = useTranslation();

  return (
    <Paper key={question.id} elevation={2} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        {question.question_text}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Tipo: {question.question_type}
      </Typography>
      {question.question_type === 'nps' && question.npsCriterion && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Critério NPS: {question.npsCriterion.name}
        </Typography>
      )}
      {question.question_type === 'text' || question.question_type === 'textarea' ? (
        <Box sx={{ mt: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            Respostas:
          </Typography>
          {question.answers && question.answers.length > 0 ? (
            <Box component="ul" sx={{ listStyleType: 'none', p: 0, m: 0 }}>
              {question.answers.map((answer, index) => (
                <Box
                  component="li"
                  key={index}
                  sx={{ mb: 1, p: 1, bgcolor: 'action.hover', borderRadius: 1 }}
                >
                  <Typography variant="body2">{answer.answer_value}</Typography>
                </Box>
              ))}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Nenhuma resposta para esta pergunta.
            </Typography>
          )}
        </Box>
      ) : (
        <Typography variant="body1" sx={{ mt: 1 }}>
          Respostas: {question.answers ? question.answers.length : 0}
        </Typography>
      )}
    </Paper>
  );
};

export default QuestionResultCard;
