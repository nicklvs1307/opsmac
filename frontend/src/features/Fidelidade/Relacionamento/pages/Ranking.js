import React from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Pagination,
} from '@mui/material';
import { useAuth } from '@/app/providers/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { useForm, FormProvider } from 'react-hook-form';
import { useCustomersList } from '@/features/Customers/api/customerQueries';
import RankingFilters from '../components/RankingFilters';
import RankingTable from '../components/RankingTable';

const Ranking = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const restaurantId = user?.restaurants?.[0]?.id;

  const methods = useForm({
    defaultValues: {
      sortBy: 'total_visits',
      page: 1,
      limit: 10,
    },
  });

  const { control, watch, setValue } = methods;

  const sortBy = watch('sortBy');
  const page = watch('page');
  const limit = watch('limit');

  const {
    data: customersData,
    isLoading,
    isError,
    error,
  } = useCustomersList({
    restaurantId,
    sort: sortBy,
    page,
    limit,
  });

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (isError) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error?.message || t('common.error_loading_data')}
      </Alert>
    );
  }

  const customers = customersData?.customers || [];

  

  return (
    <FormProvider {...methods}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t('fidelity_relationship.ranking_title')}
        </Typography>

      <RankingFilters control={control} onSortByChange={(e) => setValue('sortBy', e.target.value)} />

      <RankingTable
        customers={customers}
        sortBy={sortBy}
        page={page}
        limit={limit}
      />

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Pagination
          count={customersData?.totalPages || 1}
          page={customersData?.currentPage || 1}
          onChange={(event, value) => setValue('page', value)}
          color="primary"
        />
      </Box>
    </Box>
    </FormProvider>
  );
};

export default Ranking;
