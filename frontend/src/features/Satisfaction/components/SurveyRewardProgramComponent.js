import React from 'react';
import { usePermissions } from '../../hooks/usePermissions';
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
import RewardResponseItemField from '../components/RewardResponseItemField';

const SurveyRewardProgramComponent = ({
  const { can } = usePermissions();
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
                  <RewardResponseItemField
                    key={item.id}
                    control={control}
                    errors={errors}
                    index={index}
                    remove={remove}
                    rewards={rewards}
                  />
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

export default SurveyRewardProgramComponent;
