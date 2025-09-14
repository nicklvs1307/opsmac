import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Rating,
  Chip,
  Avatar,
  Grid,
  Card,
  CardContent,
  Divider,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Reply as ReplyIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  QrCode as QrCodeIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationOnIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { useGetFeedbackById, useReplyFeedback, useDeleteFeedback } from './api/feedbackService';

const FeedbackDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useTranslation();

  const { data: feedback, isLoading, isError, error } = useGetFeedbackById(id);
  const replyMutation = useReplyFeedback();
  const deleteMutation = useDeleteFeedback();

  const [replyDialog, setReplyDialog] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [deleteDialog, setDeleteDialog] = useState(false);

  const handleReply = () => {
    replyMutation.mutate(
      { feedbackId: id, replyText },
      {
        onSuccess: () => {
          setReplyDialog(false);
          setReplyText('');
        },
      }
    );
  };

  const handleDelete = () => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        setDeleteDialog(false);
        navigate('/feedback');
      },
    });
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive':
        return 'success';
      case 'negative':
        return 'error';
      case 'neutral':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'compliment':
        return 'success';
      case 'complaint':
        return 'error';
      case 'suggestion':
        return 'info';
      case 'criticism':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'compliment':
        return t('feedback_list.type_compliment');
      case 'complaint':
        return t('feedback_list.type_complaint');
      case 'suggestion':
        return t('feedback_list.type_suggestion');
      case 'criticism':
        return t('feedback_list.type_criticism');
      default:
        return type;
    }
  };

  const getSourceLabel = (source) => {
    switch (source) {
      case 'qr_code':
        return t('feedback_list.source_qrcode');
      case 'whatsapp':
        return t('feedback_list.source_whatsapp');
      case 'manual':
        return t('feedback_list.source_manual');
      case 'website':
        return t('feedback_list.source_website');
      default:
        return source;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending':
        return t('feedback_list.status_pending');
      case 'responded':
        return t('feedback_list.status_responded');
      case 'resolved':
        return t('feedback_list.status_resolved');
      default:
        return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'responded':
        return 'info';
      case 'resolved':
        return 'success';
      default:
        return 'default';
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/satisfaction/feedback')}
          sx={{ mb: 2 }}
        >
          {t('public_feedback.back_button')}
        </Button>
        <Alert severity="error">{error.message || t('feedback_detail.not_found')}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/satisfaction/feedback')}>
            {t('public_feedback.back_button')}
          </Button>
          <Typography variant="h4" component="h1">
            {t('feedback_detail.title')}
          </Typography>
        </Box>

        <Box display="flex" gap={1}>
          {!feedback.response && (
            <Button
              variant="contained"
              startIcon={<ReplyIcon />}
              onClick={() => setReplyDialog(true)}
            >
              {t('feedback_list.reply_action')}
            </Button>
          )}
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/satisfaction/feedback/${id}/edit`)}
          >
            {t('pdv.edit_action')}
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => setDeleteDialog(true)}
          >
            {t('common.delete')}
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Main Feedback Card */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3 }}>
            {/* Customer Info */}
            <Box display="flex" alignItems="center" gap={2} mb={3}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                {feedback.customer?.name?.charAt(0) || 'A'}
              </Avatar>
              <Box>
                <Typography variant="h5">
                  {feedback.customer?.name || t('feedback_list.anonymous_customer')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feedback.customer?.email ||
                    feedback.customer?.phone ||
                    t('feedback_detail.no_contact')}
                </Typography>
              </Box>
            </Box>

            {/* Rating and Tags */}
            <Box mb={3}>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Rating value={feedback.rating} readOnly size="large" />
                <Typography variant="h6">{feedback.rating}/5</Typography>
              </Box>

              <Box display="flex" gap={1} flexWrap="wrap">
                <Chip
                  label={getTypeLabel(feedback.feedback_type)}
                  color={getTypeColor(feedback.feedback_type)}
                />
                <Chip label={feedback.sentiment} color={getSentimentColor(feedback.sentiment)} />
                <Chip label={getSourceLabel(feedback.source)} variant="outlined" />
                <Chip
                  label={getStatusLabel(feedback.status)}
                  color={getStatusColor(feedback.status)}
                />
                {feedback.table_number && (
                  <Chip
                    label={`${t('public_feedback.table_prefix')} ${feedback.table_number}`}
                    variant="outlined"
                  />
                )}
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Comment */}
            <Box mb={3}>
              <Typography variant="h6" gutterBottom>
                {t('public_feedback.step_comment_label')}
              </Typography>
              <Typography variant="body1" paragraph>
                {feedback.comment}
              </Typography>
            </Box>

            {/* Response */}
            {feedback.response && (
              <Box>
                <Divider sx={{ my: 3 }} />
                <Typography variant="h6" gutterBottom>
                  {t('feedback_list.response_label')}
                </Typography>
                <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
                  <Typography variant="body1">{feedback.response}</Typography>
                  {feedback.response_date && (
                    <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                      {t('feedback_detail.responded_on')}{' '}
                      {format(new Date(feedback.response_date), 'dd/MM/yyyy HH:mm', {
                        locale: ptBR,
                      })}
                    </Typography>
                  )}
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} lg={4}>
          {/* Timeline */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <ScheduleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                {t('feedback_detail.timeline_title')}
              </Typography>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  <strong>{t('coupons.table_header_created')}:</strong>{' '}
                  {format(new Date(feedback.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                </Typography>
                {feedback.updated_at && feedback.updated_at !== feedback.created_at && (
                  <Typography variant="body2" color="text.secondary">
                    <strong>{t('feedback_detail.updated_at')}:</strong>{' '}
                    {format(new Date(feedback.updated_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                  </Typography>
                )}
                {feedback.response_date && (
                  <Typography variant="body2" color="text.secondary">
                    <strong>{t('feedback_list.status_responded')}:</strong>{' '}
                    {format(new Date(feedback.response_date), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                  </Typography>
                )}
                {feedback.visit_date && (
                  <Typography variant="body2" color="text.secondary">
                    <strong>{t('new_feedback.visit_date_label')}:</strong>{' '}
                    {format(new Date(feedback.visit_date), 'dd/MM/yyyy', { locale: ptBR })}
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>

          {/* Customer Details */}
          {feedback.customer && (
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  {t('feedback_detail.customer_details_title')}
                </Typography>
                <Box>
                  <Typography variant="body2">
                    <strong>{t('settings.name_label')}:</strong> {feedback.customer.name}
                  </Typography>
                  {feedback.customer.email && (
                    <Typography variant="body2" display="flex" alignItems="center" gap={1}>
                      <EmailIcon fontSize="small" />
                      {feedback.customer.email}
                    </Typography>
                  )}
                  {feedback.customer.phone && (
                    <Typography variant="body2" display="flex" alignItems="center" gap={1}>
                      <PhoneIcon fontSize="small" />
                      {feedback.customer.phone}
                    </Typography>
                  )}
                  {feedback.customer.total_visits && (
                    <Typography variant="body2">
                      <strong>{t('feedback_detail.total_visits_label')}:</strong>{' '}
                      {feedback.customer.total_visits}
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          )}

          {/* QR Code Details */}
          {feedback.qr_code && (
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <QrCodeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  {t('sidebar.qr_codes')}
                </Typography>
                <Box>
                  <Typography variant="body2">
                    <strong>{t('settings.name_label')}:</strong> {feedback.qr_code.name}
                  </Typography>
                  {feedback.qr_code.location && (
                    <Typography variant="body2" display="flex" alignItems="center" gap={1}>
                      <LocationOnIcon fontSize="small" />
                      {feedback.qr_code.location}
                    </Typography>
                  )}
                  {feedback.qr_code.table_number && (
                    <Typography variant="body2">
                      <strong>{t('public_feedback.table_prefix')}:</strong>{' '}
                      {feedback.qr_code.table_number}
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Analytics */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('feedback_detail.stats_title')}
              </Typography>
              <Box>
                <Typography variant="body2">
                  <strong>{t('pdv.table_header_id')}:</strong> #{feedback.id}
                </Typography>
                <Typography variant="body2">
                  <strong>{t('new_feedback.source_label')}:</strong>{' '}
                  {getSourceLabel(feedback.source)}
                </Typography>
                <Typography variant="body2">
                  <strong>{t('coupons.table_header_status')}:</strong>{' '}
                  {getStatusLabel(feedback.status)}
                </Typography>
                {feedback.nps_score !== undefined && (
                  <Typography variant="body2">
                    <strong>{t('dashboard.nps_title')}:</strong> {feedback.nps_score}
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Reply Dialog */}
      <Dialog open={replyDialog} onClose={() => setReplyDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('feedback_list.reply_dialog_title')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={t('feedback_list.reply_dialog_label')}
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder={t('feedback_detail.reply_dialog_placeholder')}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReplyDialog(false)}>{t('common.cancel')}</Button>
          <Button
            onClick={handleReply}
            variant="contained"
            disabled={!replyText.trim() || replyMutation.isLoading}
            startIcon={replyMutation.isLoading ? <CircularProgress size={20} /> : null}
          >
            {replyMutation.isLoading
              ? t('feedback_detail.sending_button')
              : t('feedback_list.send_reply_button')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>{t('category_management.confirm_delete_title')}</DialogTitle>
        <DialogContent>
          <Typography>{t('feedback_list.delete_dialog_content')}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>{t('common.cancel')}</Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={deleteMutation.isLoading}
            startIcon={deleteMutation.isLoading ? <CircularProgress size={20} /> : null}
          >
            {t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FeedbackDetail;
