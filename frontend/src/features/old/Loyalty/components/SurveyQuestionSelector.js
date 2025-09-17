import React from 'react';
import { Box, FormControl, InputLabel, Select, MenuItem, Paper } from '@mui/material';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

const SurveyQuestionSelector = ({
  control,
  surveysData,
  isLoadingSurveys,
  selectedSurveyId,
  multipleChoiceQuestions,
  handleSurveyChange,
  handleQuestionChange,
}) => {
  const { t } = useTranslation();

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Controller
        name="selectedSurveyId"
        control={control}
        render={({ field }) => (
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="select-survey-label">{t('multiple_choice.select_survey')}</InputLabel>
            <Select
              {...field}
              labelId="select-survey-label"
              label={t('multiple_choice.select_survey')}
              onChange={(e) => {
                field.onChange(e);
                handleSurveyChange(e);
              }}
            >
              {surveysData?.map((survey) => (
                <MenuItem key={survey.id} value={survey.id}>
                  {survey.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      />

      {selectedSurveyId && (
        <Controller
          name="selectedQuestionId"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth>
              <InputLabel id="select-question-label">
                {t('multiple_choice.select_question')}
              </InputLabel>
              <Select
                {...field}
                labelId="select-question-label"
                label={t('multiple_choice.select_question')}
                onChange={(e) => {
                  field.onChange(e);
                  handleQuestionChange(e);
                }}
                disabled={multipleChoiceQuestions.length === 0}
              >
                {multipleChoiceQuestions.length > 0 ? (
                  multipleChoiceQuestions.map((question) => (
                    <MenuItem key={question.id} value={question.id}>
                      {question.question_text}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>{t('multiple_choice.no_multiple_choice_questions')}</MenuItem>
                )}
              </Select>
            </FormControl>
          )}
        />
      )}
    </Paper>
  );
};

export default SurveyQuestionSelector;
