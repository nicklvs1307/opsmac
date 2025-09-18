import { Box, Typography, Container, useTheme } from '@mui/material';
import CouponValidatorCard from '@/components/UI/CouponValidatorCard'; // Assuming this is a generic UI component
import { useTranslation } from 'react-i18next';
// Updated import path for couponQueries
import { useValidateCoupon, useRedeemCoupon } from '@/features/Coupons/api/couponQueries';

const CouponValidatorPage = () => {
  const theme = useTheme();
  const { t } = useTranslation();

  const validateCouponMutation = useValidateCoupon();
  const redeemCouponMutation = useRedeemCoupon();

  const handleValidateCoupon = async (code) => {
    try {
      const response = await validateCouponMutation.mutateAsync(code);
      return response;
    } catch (err) {
      throw new Error(err.response?.data?.error || t('coupon_validator.error_validating_coupon'));
    }
  };

  const handleRedeem = async (id) => {
    try {
      const response = await redeemCouponMutation.mutateAsync(id);
      return response;
    } catch (err) {
      throw new Error(err.response?.data?.error || t('coupon_validator.error_redeeming_coupon'));
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box
        sx={{
          mb: 4,
          textAlign: 'center',
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          sx={{
            mb: 1,
            fontWeight: 700,
            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {t('coupon_validator.title')}
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{
            maxWidth: '600px',
            mx: 'auto',
            mb: 3,
          }}
        >
          {t('coupon_validator.subtitle')}
        </Typography>
      </Box>

      <CouponValidatorCard onValidate={handleValidateCoupon} onRedeem={handleRedeem} />
    </Container>
  );
};

export default CouponValidatorPage;
