import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  IconButton,
  Chip,
  Avatar,
  Box,
  Rating,
  LinearProgress,
} from '@mui/material';
import {
  Person as PersonIcon,
  MoreVert as MoreVertIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';

const CustomerTable = ({
  customers,
  isLoading,
  isError,
  error,
  handleRowClick,
  handleMenuOpen,
}) => {
  const { t } = useTranslation();

  const getSegmentColor = (segment) => {
    switch (segment) {
      case 'vip':
        return 'error';
      case 'regular':
        return 'primary';
      case 'new':
        return 'success';
      case 'inactive':
        return 'default';
      default:
        return 'default';
    }
  };

  const getSegmentLabel = (segment) => {
    switch (segment) {
      case 'vip':
        return 'VIP';
      case 'regular':
        return 'Regular';
      case 'new':
        return 'Novo';
      case 'inactive':
        return 'Inativo';
      default:
        return segment;
    }
  };

  const calculateLoyaltyProgress = (visits) => {
    const maxVisits = 10; // Para ser VIP
    return Math.min((visits / maxVisits) * 100, 100);
  };

  if (isLoading && customers.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (isError) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error?.message || 'Erro ao carregar clientes'}
      </Alert>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Cliente</TableCell>
            <TableCell>Contato</TableCell>
            <TableCell>Segmento</TableCell>
            <TableCell>Visitas</TableCell>
            <TableCell>Avaliação Média</TableCell>
            <TableCell>Fidelidade</TableCell>
            <TableCell>Última Visita</TableCell>
            <TableCell>Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {customers.map((customer) => (
            <TableRow
              key={customer.id}
              hover
              onClick={() => handleRowClick(customer.id)}
              sx={{ cursor: 'pointer' }}
            >
              <TableCell>
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    {customer.name?.charAt(0) || 'C'}
                  </Avatar>
                  <Box>
                    <Typography variant="body1" fontWeight="medium">
                      {customer.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ID: #{customer.id}
                    </Typography>
                  </Box>
                </Box>
              </TableCell>
              <TableCell>
                <Box display="flex" alignItems="center" gap={1}>
                  {customer.email && (
                    <Box display="flex" alignItems="center" gap={1}>
                      <EmailIcon fontSize="small" color="action" />
                      <Typography variant="body2">{customer.email}</Typography>
                    </Box>
                  )}
                  {customer.phone && (
                    <Box display="flex" alignItems="center" gap={1}>
                      <PhoneIcon fontSize="small" color="action" />
                      <Typography variant="body2">{customer.phone}</Typography>
                    </Box>
                  )}
                </Box>
              </TableCell>
              <TableCell>
                <Chip
                  label={getSegmentLabel(customer.segment)}
                  color={getSegmentColor(customer.segment)}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <Box display="flex" alignItems="center" gap={1}>
                  <TrendingUpIcon fontSize="small" color="action" />
                  <Typography variant="body2">{customer.total_visits || 0}</Typography>
                </Box>
              </TableCell>
              <TableCell>
                {customer.average_rating ? (
                  <Box display="flex" alignItems="center" gap={1}>
                    <Rating
                      value={customer.average_rating}
                      readOnly
                      size="small"
                      precision={0.1}
                    />
                    <Typography variant="body2">
                      ({customer.average_rating.toFixed(1)})
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Sem avaliações
                  </Typography>
                )}
              </TableCell>
              <TableCell>
                <Box sx={{ width: 100 }}>
                  <LinearProgress
                    variant="determinate"
                    value={calculateLoyaltyProgress(customer.total_visits || 0)}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {Math.round(calculateLoyaltyProgress(customer.total_visits || 0))}%
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                {customer.last_visit ? (
                  <Typography variant="body2">
                    {format(new Date(customer.last_visit), 'dd/MM/yyyy', { locale: ptBR })}
                  </Typography>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Nunca visitou
                  </Typography>
                )}
              </TableCell>
              <TableCell>
                <IconButton size="small" onClick={(e) => handleMenuOpen(e, customer)}>
                  <MoreVertIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default CustomerTable;
