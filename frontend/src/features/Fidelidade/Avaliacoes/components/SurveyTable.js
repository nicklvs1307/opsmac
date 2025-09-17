import React from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Typography,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BarChartIcon from '@mui/icons-material/BarChart';
import QrCodeIcon from '@mui/icons-material/QrCode';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import { useTranslation } from 'react-i18next';

const SurveyTable = ({
  surveys,
  handleToggleStatus,
  handleDelete,
  handleGenerateQrCode,
  handleCopyLink,
  deleteMutation,
  updateStatusMutation,
}) => {
  const { t } = useTranslation();

  if (!surveys || surveys.length === 0) {
    return (
      <TableContainer sx={{ overflowX: 'auto' }}>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell colSpan={4} align="center">
                {t('survey_list.no_surveys_found')}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  return (
    <TableContainer sx={{ overflowX: 'auto' }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>{t('survey_list.table_header_title')}</TableCell>
            <TableCell>{t('survey_list.table_header_type')}</TableCell>
            <TableCell>{t('survey_list.table_header_status')}</TableCell>
            <TableCell align="right">{t('survey_list.table_header_actions')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {surveys.map((survey) => (
            <TableRow key={survey.id}>
              <TableCell>{survey.title}</TableCell>
              <TableCell>{survey.type}</TableCell>
              <TableCell>{survey.status}</TableCell>
              <TableCell align="right">
                <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                  <IconButton
                    component={RouterLink}
                    to={`/fidelity/surveys/${survey.id}/results`}
                    color="primary"
                    aria-label={t('survey_list.view_results_aria_label')}
                  >
                    <BarChartIcon />
                  </IconButton>
                  <IconButton
                    component={RouterLink}
                    to={`/fidelity/surveys/edit/${survey.id}`}
                    color="info"
                    aria-label={t('survey_list.edit_survey_aria_label')}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color={survey.status === 'active' ? 'success' : 'default'}
                    aria-label={t('survey_list.toggle_status_aria_label')}
                    onClick={() => handleToggleStatus(survey.id, survey.status)}
                    disabled={updateStatusMutation?.isLoading}
                  >
                    {survey.status === 'active' ? <ToggleOnIcon /> : <ToggleOffIcon />}
                  </IconButton>
                  <IconButton
                    color="secondary"
                    aria-label={t('survey_list.generate_qr_code_aria_label')}
                    onClick={() => handleGenerateQrCode(survey.slug)}
                  >
                    <QrCodeIcon />
                  </IconButton>
                  <IconButton
                    aria-label={t('survey_list.copy_link_aria_label')}
                    onClick={() => handleCopyLink(survey.slug)}
                  >
                    <ContentCopyIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    aria-label={t('survey_list.delete_survey_aria_label')}
                    onClick={() => handleDelete(survey.id)}
                    disabled={deleteMutation?.isLoading}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </TableCell>
            </TableRow>
          ))
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default SurveyTable;
