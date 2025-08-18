import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    TextField,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
    Alert
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import axiosInstance from '../../api/axiosInstance';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

const CouponCreateForm = ({ onCouponCreated }) => {
    const { user } = useAuth();
    const { t } = useTranslation();
    const restaurantId = user?.restaurants?.[0]?.id;
    const [rewards, setRewards] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const { control, handleSubmit, formState: { errors }, reset } = useForm();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError('');
                const [rewardsRes, customersRes] = await Promise.all([
                    axiosInstance.get(`/api/rewards/restaurant/${restaurantId}`), // Fetch rewards for the current restaurant
                    axiosInstance.get('/api/customers')
                ]);
                setRewards(rewardsRes.data.rewards);
                setCustomers(customersRes.data.customers);
            } catch (err) {
                console.error('Error fetching data for coupon creation:', err);
                setError(t('coupon_create_form.error_fetching_data'));
            } finally {
                setLoading(false);
            }
        };
        if (restaurantId) {
            fetchData();
        }
    }, [restaurantId, t]); // Added t to dependency array

    const onSubmit = async (data) => {
        try {
            await axiosInstance.post('/api/coupons', { ...data, restaurant_id: restaurantId });
            toast.success(t('coupon_create_form.coupon_created_success'));
            reset(); // Clear form after successful submission
            if (onCouponCreated) {
                onCouponCreated();
            }
        } catch (err) {
            console.error('Error creating coupon:', err);
            toast.error(err.response?.data?.message || t('coupon_create_form.error_creating_coupon'));
        }
    };

    if (loading) {
        return <CircularProgress />;
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    return (
        <Box>
            <Typography variant="h4" component="h1" mb={3}>{t('coupon_create_form.title')}</Typography>
            <Paper sx={{ p: 3 }}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Controller
                                name="reward_id"
                                control={control}
                                rules={{ required: t('coupon_create_form.reward_required') }}
                                render={({ field }) => (
                                    <FormControl fullWidth error={!!errors.reward_id}>
                                        <InputLabel>{t('coupon_create_form.reward_label')}</InputLabel>
                                        <Select {...field} label={t('coupon_create_form.reward_label')}>
                                            {rewards.map(reward => (
                                                <MenuItem key={reward.id} value={reward.id}>
                                                    {reward.title}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                )}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Controller
                                name="customer_id"
                                control={control}
                                rules={{ required: t('coupon_create_form.customer_required') }}
                                render={({ field }) => (
                                    <FormControl fullWidth error={!!errors.customer_id}>
                                        <InputLabel>{t('coupon_create_form.customer_label')}</InputLabel>
                                        <Select {...field} label={t('coupon_create_form.customer_label')}>
                                            {customers.map(customer => (
                                                <MenuItem key={customer.id} value={customer.id}>
                                                    {customer.name} ({customer.email})
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                )}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Controller
                                name="expires_at"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label={t('coupon_create_form.expires_at_label')}
                                        type="datetime-local"
                                        fullWidth
                                        InputLabelProps={{ shrink: true }}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Button type="submit" variant="contained">{t('coupon_create_form.create_coupon_button')}</Button>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </Box>
    );
};

export default CouponCreateForm;