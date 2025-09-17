import React from 'react';
import {
  Box,
  TextField,
  Button,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Paper,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useTranslation } from 'react-i18next';
import { useFormContext, Controller, useFieldArray } from 'react-hook-form';

const SurveyQuestionField = ({ questionIndex, onRemoveQuestion }) => {
  const { t } = useTranslation();
  const {
    control,
    formState: { errors },
    watch,
  } = useFormContext();
  const {
    fields: optionsFields,
    append: appendOption,
    remove: removeOption,
  } = useFieldArray({
    control,
    name: `questions.${questionIndex}.options`,
  });

  const questionType = watch(`questions.${questionIndex}.type`);

  return (
    <Paper elevation={1} sx={{ p: 2, mb: 2, borderLeft: '4px solid #1976d2' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">
          {t('survey_create.question_title', { num: questionIndex + 1 })}
        </Typography>
        <IconButton onClick={onRemoveQuestion} color="error" aria-label={t('common.delete')}>
          <DeleteIcon />
        </IconButton>
      </Box>

      <Controller
        name={`questions.${questionIndex}.text`}
        control={control}
        rules={{ required: t('survey_create.question_text_required') }}
        render={({ field }) => (
          <TextField
            {...field}
            fullWidth
            label={t('survey_create.question_text_label')}
            variant="outlined"
            margin="normal"
            error={!!errors.questions?.[questionIndex]?.text}
            helperText={errors.questions?.[questionIndex]?.text?.message}
          />
        )}
      />

      <Controller
        name={`questions.${questionIndex}.type`}
        control={control}
        rules={{ required: t('survey_create.question_type_required') }}
        render={({ field }) => (
          <FormControl fullWidth margin="normal" error={!!errors.questions?.[questionIndex]?.type}>
            <InputLabel>{t('survey_create.question_type_label')}</InputLabel>
            <Select {...field} label={t('survey_create.question_type_label')}>
              <MenuItem value="text">{t('survey_create.question_type_text')}</MenuItem>
              <MenuItem value="rating">{t('survey_create.question_type_rating')}</MenuItem>
              <MenuItem value="single-choice">
                {t('survey_create.question_type_single_choice')}
              </MenuItem>
              <MenuItem value="multiple-choice">
                {t('survey_create.question_type_multiple_choice')}
              </MenuItem>
            </Select>
            <FormHelperText>{errors.questions?.[questionIndex]?.type?.message}</FormHelperText>
          </FormControl>
        )}
      />

      {(questionType === 'single-choice' || questionType === 'multiple-choice') && (
        <Box mt={2}>
          <Typography variant="subtitle1" gutterBottom>
            {t('survey_create.options_title')}
          </Typography>
          {optionsFields.map((item, optionIndex) => (
            <Box key={item.id} display="flex" alignItems="center" gap={1} mb={1}>
              <Controller
                name={`questions.${questionIndex}.options.${optionIndex}.text`}
                control={control}
                rules={{ required: t('survey_create.option_text_required') }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t('survey_create.option_text_label', { num: optionIndex + 1 })}
                    variant="outlined"
                    size="small"
                    error={!!errors.questions?.[questionIndex]?.options?.[optionIndex]?.text}
                    helperText={
                      errors.questions?.[questionIndex]?.options?.[optionIndex]?.text?.message
                    }
                  />
                )}
              />
              <IconButton
                onClick={() => removeOption(optionIndex)}
                color="error"
                aria-label={t('common.delete')}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}
          <Button
            startIcon={<AddIcon />}
            onClick={() => appendOption({ text: '' })}
            variant="outlined"
            size="small"
            sx={{ mt: 1 }}
          >
            {t('survey_create.add_option_button')}
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default SurveyQuestionField;
