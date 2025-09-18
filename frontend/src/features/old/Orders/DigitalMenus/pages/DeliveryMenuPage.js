import React from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  TextField,
  Typography,
  IconButton,
} from '@mui/material';
import { ContentCopy as ContentCopyIcon } from '@mui/icons-material';
import { useAuth } from '@/app/providers/contexts/AuthContext';
import toast from 'react-hot-toast';

const DeliveryMenuPage = () => {
  const { user } = useAuth();

  return (
    <Card>
      <CardHeader
        title="Link do Cardápio de Delivery"
        subheader="Compartilhe este link com seus clientes para que eles possam ver seu cardápio online."
      />
      <CardContent>
        {user?.restaurant?.slug ? (
          <Box display="flex" alignItems="center">
            <TextField
              value={`${window.location.origin}/menu/delivery/${user.restaurant.slug}`}
              fullWidth
              InputProps={{
                readOnly: true,
              }}
              sx={{ mr: 2 }}
            />
            <IconButton
              onClick={() => {
                navigator.clipboard.writeText(
                  `${window.location.origin}/menu/delivery/${user.restaurant.slug}`
                );
                toast.success('Link copiado!');
              }}
            >
              <ContentCopyIcon />
            </IconButton>
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            O link do seu cardápio aparecerá aqui assim que as informações do seu restaurante
            estiverem salvas.
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default DeliveryMenuPage;
