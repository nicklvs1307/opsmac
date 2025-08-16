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
import axiosInstance from '../api/axiosInstance';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

const CouponCreateForm = ({ onCouponCreated }) => {
    const { user } = useAuth();
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
                setError('Erro ao carregar dados necessários para criar cupom.');
            } finally {
                setLoading(false);
            }
        };
        if (restaurantId) {
            fetchData();
        }
    }, [restaurantId]);

    const onSubmit = async (data) => {
        try {
            await axiosInstance.post('/api/coupons', { ...data, restaurant_id: restaurantId });
            toast.success('Cupom criado com sucesso!');
            reset(); // Clear form after successful submission
            if (onCouponCreated) {
                onCouponCreated();
            }
        } catch (err) {
            console.error('Error creating coupon:', err);
            toast.error(err.response?.data?.message || 'Erro ao criar cupom.');
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
            <Typography variant="h4" component="h1" mb={3}>Criar Novo Cupom</Typography>
            <Paper sx={{ p: 3 }}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Controller
                                name="reward_id"
                                control={control}
                                rules={{ required: 'Recompensa é obrigatória' }}
                                render={({ field }) => (
                                    <FormControl fullWidth error={!!errors.reward_id}>
                                        <InputLabel>Recompensa</InputLabel>
                                        <Select {...field} label="Recompensa">
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
                                rules={{ required: 'Cliente é obrigatório' }}
                                render={({ field }) => (
                                    <FormControl fullWidth error={!!errors.customer_id}>
                                        <InputLabel>Cliente</InputLabel>
                                        <Select {...field} label="Cliente">
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
                                        label="Data de Expiração"
                                        type="datetime-local"
                                        fullWidth
                                        InputLabelProps={{ shrink: true }}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Button type="submit" variant="contained">Criar Cupom</Button>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </Box>
    );
};

export default CouponCreateForm;