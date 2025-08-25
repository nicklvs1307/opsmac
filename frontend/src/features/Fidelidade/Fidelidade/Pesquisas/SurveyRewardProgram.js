import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  TextField,
  Card,
  CardHeader,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  CircularProgress,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

const SurveyRewardProgram = ({
  control,
  errors,
  fields,
  append,
  remove,
  rewards,
  loading,
  onSave,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardHeader title={t('survey_reward_program.title')} />
            <CardContent>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {t('survey_reward_program.description')}
              </Typography>

              {/* Recompensas por Resposta */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                  {t('survey_reward_program.rewards_per_response')}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {t('survey_reward_program.rewards_per_response_helper')}
                </Typography>
                {fields.map((item, index) => (
                  <Paper key={item.id} sx={{ p: 2, mb: 2, border: '1px solid #eee' }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={4}>
                        <Controller
                          name={`rewards_per_response.${index}.response_count`}
                          control={control}
                          rules={{
                            required: t('survey_reward_program.response_count_required'),
                            setValueAs: (value) => (value === '' ? undefined : Number(value)),
                          }}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label={t('survey_reward_program.response_count')}
                              type="number"
                              fullWidth
                              error={!!errors.rewards_per_response?.[index]?.response_count}
                              helperText={
                                errors.rewards_per_response?.[index]?.response_count?.message
                              }
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Controller
                          name={`rewards_per_response.${index}.reward_id`}
                          control={control}
                          rules={{ required: t('survey_reward_program.reward_required') }}
                          render={({ field }) => (
                            <FormControl
                              fullWidth
                              error={!!errors.rewards_per_response?.[index]?.reward_id}
                            >
                              <InputLabel>{t('survey_reward_program.select_reward')}</InputLabel>
                              <Select {...field} label={t('survey_reward_program.select_reward')}>
                                {rewards.map((reward) => (
                                  <MenuItem key={reward.id} value={reward.id}>
                                    {reward.title}
                                  </MenuItem>
                                ))}
                              </Select>
                              <FormHelperText>
                                {errors.rewards_per_response?.[index]?.reward_id?.message}
                              </FormHelperText>
                            </FormControl>
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} sm={2}>
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={() => remove(index)}
                          startIcon={<DeleteIcon />}
                        >
                          {t('survey_reward_program.remove')}
                        </Button>
                      </Grid>
                    </Grid>
                  </Paper>
                ))}
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => append({ response_count: '', reward_id: '' })}
                >
                  {t('survey_reward_program.add_reward')}
                </Button>
              </Box>

              <Button
                variant="contained"
                color="primary"
                onClick={onSave}
                disabled={loading}
                sx={{ mt: 2 }}
              >
                {loading ? <CircularProgress size={20} /> : t('survey_reward_program.save_button')}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
};

export default SurveyRewardProgram;
