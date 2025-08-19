import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Rating,
  Avatar,
  IconButton,
  Menu,
  MenuItem as MenuItemComponent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  Pagination,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  Reply as ReplyIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const FeedbackList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const restaurantId = user?.restaurants?.[0]?.id;
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    rating: '',
    type: '',
    status: '',
    source: '',
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [replyDialog, setReplyDialog] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [deleteDialog, setDeleteDialog] = useState(false);

  useEffect(() => {
    fetchFeedbacks();
  }, [page, filters]);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = {
        page,
        limit: 10,
      };

      for (const key in filters) {
        if (filters[key] !== '' && filters[key] !== null && filters[key] !== undefined) {
          params[key] = filters[key];
        }
      }
      
      const response = await axiosInstance.get(`/api/feedback/restaurant/${restaurantId}`, { params });
      
      setFeedbacks(response.data.feedbacks);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      console.error('Error fetching feedbacks:', err);
      setError(t('feedback_list.error_loading'));
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(1);
  };

  const handleMenuOpen = (event, feedback) => {
    setAnchorEl(event.currentTarget);
    setSelectedFeedback(feedback);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedFeedback(null);
  };

  const handleReply = () => {
    setReplyDialog(true);
    handleMenuClose();
  };

  const handleView = () => {
    navigate(`/feedback/${selectedFeedback.id}`);
    handleMenuClose();
  };

  const handleDelete = () => {
    setDeleteDialog(true);
    handleMenuClose();
  };

  const submitReply = async () => {
    try {
      await axiosInstance.post(`/api/feedback/${selectedFeedback.id}/reply`, {
        response: replyText,
      });
      
      toast.success(t('feedback_list.reply_success'));
      setReplyDialog(false);
      setReplyText('');
      fetchFeedbacks();
    } catch (err) {
      toast.error(t('feedback_list.reply_error'));
    }
  };

  const confirmDelete = async () => {
    try {
      await axiosInstance.delete(`/api/feedback/${selectedFeedback.id}`);
      
      toast.success(t('feedback_list.delete_success'));
      setDeleteDialog(false);
      fetchFeedbacks();
    } catch (err) {
      toast.error(t('feedback_list.delete_error'));
    }
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive': return 'success';
      case 'negative': return 'error';
      case 'neutral': return 'warning';
      default: return 'default';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'compliment': return 'success';
      case 'complaint': return 'error';
      case 'suggestion': return 'info';
      case 'criticism': return 'warning';
      default: return 'default';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'compliment': return t('feedback_list.type_compliment');
      case 'complaint': return t('feedback_list.type_complaint');
      case 'suggestion': return t('feedback_list.type_suggestion');
      case 'criticism': return t('feedback_list.type_criticism');
      default: return type;
    }
  };

  const getSourceLabel = (source) => {
    switch (source) {
      case 'qr_code': return t('feedback_list.source_qrcode');
      case 'whatsapp': return t('feedback_list.source_whatsapp');
      case 'manual': return t('feedback_list.source_manual');
      case 'website': return t('feedback_list.source_website');
      default: return source;
    }
  };

  if (loading && feedbacks.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          {t('feedback_list.main_title')}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/feedback/new')}
        >
          {t('feedback_list.new_feedback_button')}
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t('feedback_list.filters_title')}
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label={t('feedback_list.search_label')}
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>{t('feedback_list.rating_label')}</InputLabel>
              <Select
                value={filters.rating}
                label={t('feedback_list.rating_label')}
                onChange={(e) => handleFilterChange('rating', e.target.value)}
              >
                <MenuItem value="">{t('feedback_list.all_ratings')}</MenuItem>
                <MenuItem value="5">{t('feedback_list.five_stars')}</MenuItem>
                <MenuItem value="4">{t('feedback_list.four_stars')}</MenuItem>
                <MenuItem value="3">{t('feedback_list.three_stars')}</MenuItem>
                <MenuItem value="2">{t('feedback_list.two_stars')}</MenuItem>
                <MenuItem value="1">{t('feedback_list.one_star')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>{t('feedback_list.type_label')}</InputLabel>
              <Select
                value={filters.type}
                label={t('feedback_list.type_label')}
                onChange={(e) => handleFilterChange('type', e.target.value)}
              >
                <MenuItem value="">{t('feedback_list.all_types')}</MenuItem>
                <MenuItem value="compliment">{t('feedback_list.type_compliment')}</MenuItem>
                <MenuItem value="complaint">{t('feedback_list.type_complaint')}</MenuItem>
                <MenuItem value="suggestion">{t('feedback_list.type_suggestion')}</MenuItem>
                <MenuItem value="criticism">{t('feedback_list.type_criticism')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>{t('feedback_list.status_label')}</InputLabel>
              <Select
                value={filters.status}
                label={t('feedback_list.status_label')}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <MenuItem value="">{t('feedback_list.all_types')}</MenuItem>
                <MenuItem value="pending">{t('feedback_list.status_pending')}</MenuItem>
                <MenuItem value="responded">{t('feedback_list.status_responded')}</MenuItem>
                <MenuItem value="resolved">{t('feedback_list.status_resolved')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>{t('feedback_list.source_label')}</InputLabel>
              <Select
                value={filters.source}
                label={t('feedback_list.source_label')}
                onChange={(e) => handleFilterChange('source', e.target.value)}
              >
                <MenuItem value="">{t('feedback_list.all_types')}</MenuItem>
                <MenuItem value="qrcode">{t('feedback_list.source_qrcode')}</MenuItem>
                <MenuItem value="whatsapp">{t('feedback_list.source_whatsapp')}</MenuItem>
                <MenuItem value="manual">{t('feedback_list.source_manual')}</MenuItem>
                <MenuItem value="website">{t('feedback_list.source_website')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Feedback List */}
      <Grid container spacing={2}>
        {feedbacks.map((feedback) => (
          <Grid item xs={12} key={feedback.id}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Box display="flex" gap={2} flex={1}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      {feedback.customer?.name?.charAt(0) || 'A'}
                    </Avatar>
                    <Box flex={1}>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Typography variant="h6">
                          {feedback.customer?.name || t('feedback_list.anonymous_customer')}
                        </Typography>
                        <Rating value={feedback.rating} readOnly size="small" />
                        <Typography variant="body2" color="text.secondary">
                          ({feedback.rating}/5)
                        </Typography>
                      </Box>
                      
                      <Box display="flex" gap={1} mb={2}>
                        <Chip
                          label={getTypeLabel(feedback.feedback_type)}
                          color={getTypeColor(feedback.feedback_type)}
                          size="small"
                        />
                        <Chip
                          label={feedback.sentiment}
                          color={getSentimentColor(feedback.sentiment)}
                          size="small"
                        />
                        <Chip
                          label={getSourceLabel(feedback.source)}
                          variant="outlined"
                          size="small"
                        />
                        {feedback.table_number && (
                          <Chip
                            label={`${t('public_feedback.table_prefix')} ${feedback.table_number}`}
                            variant="outlined"
                            size="small"
                          />
                        )}
                      </Box>
                      
                      <Typography variant="body1" paragraph>
                        {feedback.comment}
                      </Typography>
                      
                      {feedback.response && (
                        <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1, mt: 2 }}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            <strong>{t('feedback_list.response_label')}:</strong>
                          </Typography>
                          <Typography variant="body2">
                            {feedback.response}
                          </Typography>
                        </Box>
                      )}
                      
                      <Typography variant="caption" color="text.secondary">
                        {feedback.created_at ? format(new Date(feedback.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : ''}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <IconButton
                    onClick={(e) => handleMenuOpen(e, feedback)}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {feedbacks.length === 0 && !loading && (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="text.secondary">
            {t('feedback_list.no_feedback_found')}
          </Typography>
        </Box>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(e, value) => setPage(value)}
            color="primary"
          />
        </Box>
      )}

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItemComponent onClick={handleView}>
          <ViewIcon sx={{ mr: 1 }} />
          {t('feedback_list.view_details_action')}
        </MenuItemComponent>
        {!selectedFeedback?.response && (
          <MenuItemComponent onClick={handleReply}>
            <ReplyIcon sx={{ mr: 1 }} />
            {t('feedback_list.reply_action')}
          </MenuItemComponent>
        )}
        <MenuItemComponent onClick={handleDelete} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} />
          {t('common.delete')}
        </MenuItemComponent>
      </Menu>

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
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReplyDialog(false)}>{t('common.cancel')}</Button>
          <Button onClick={submitReply} variant="contained" disabled={!replyText.trim()}>
            {t('feedback_list.send_reply_button')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>{t('category_management.confirm_delete_title')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('feedback_list.delete_dialog_content')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>{t('common.cancel')}</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            {t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FeedbackList;