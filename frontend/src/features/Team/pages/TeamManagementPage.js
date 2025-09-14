import React, { useState } from 'react';
import { useAuth } from '@/app/providers/contexts/AuthContext';
import {
  Container,
  Typography,
  Button,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import toast from 'react-hot-toast';

import { useTeamMembers, useCreateUser, useUpdateUser, useDeleteUser } from '@/features/Team/api/teamService';

const TeamManagementPage = () => {
  const { user } = useAuth();

  const [open, setOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const restaurantId = user?.restaurant?.id;

  const {
    data: team,
    isLoading: isLoadingTeam,
    isError: isErrorTeam,
    error: teamError,
  } = useTeamMembers(restaurantId, {
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Erro ao carregar equipe.');
    },
  });

  const createMutation = useCreateUser({
    onSuccess: () => {
      handleClose();
    },
  });

  const updateMutation = useUpdateUser({
    onSuccess: () => {
      handleClose();
    },
  });

  const deleteMutation = useDeleteUser({
    onSuccess: () => {
      // No need to manually update team state, react-query invalidates and refetches
    },
  });

  const handleOpen = (user = null) => {
    setIsEditing(!!user);
    setCurrentUser(user || { name: '', email: '', role: 'waiter', password: '' });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setCurrentUser(null);
  };

  const handleSave = () => {
    if (isEditing) {
      updateMutation.mutate({
        restaurantId,
        userId: currentUser.id,
        userData: currentUser,
      });
    } else {
      createMutation.mutate({ restaurantId, userData: currentUser });
    }
  };

  const handleDelete = (userId) => {
    if (window.confirm('Tem certeza que deseja deletar este membro da equipe?')) {
      deleteMutation.mutate({ restaurantId, userId });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentUser({ ...currentUser, [name]: value });
  };

  if (isLoadingTeam) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (isErrorTeam) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Alert severity="error">{teamError?.message || 'Erro ao carregar equipe.'}</Alert>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Gestão da Equipe
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
          Adicionar Membro
        </Button>
      </Box>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Função</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {team?.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>{member.name}</TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>{member.role}</TableCell>
                  <TableCell>{member.is_active ? 'Ativo' : 'Inativo'}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpen(member)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(member.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{isEditing ? 'Editar Membro' : 'Adicionar Novo Membro'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Nome"
            type="text"
            fullWidth
            value={currentUser?.name || ''}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="email"
            label="Email"
            type="email"
            fullWidth
            value={currentUser?.email || ''}
            onChange={handleChange}
          />
          {!isEditing && (
            <TextField
              margin="dense"
              name="password"
              label="Senha"
              type="password"
              fullWidth
              value={currentUser?.password || ''}
              onChange={handleChange}
            />
          )}
          <FormControl fullWidth margin="dense">
            <InputLabel>Função</InputLabel>
            <Select name="role" value={currentUser?.role || 'waiter'} onChange={handleChange}>
              <MenuItem value="waiter">Garçom</MenuItem>
              <MenuItem value="manager">Gerente</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button
            onClick={handleSave}
            disabled={createMutation.isLoading || updateMutation.isLoading}
          >
            {createMutation.isLoading || updateMutation.isLoading ? (
              <CircularProgress size={20} />
            ) : isEditing ? (
              'Salvar'
            ) : (
              'Adicionar'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TeamManagementPage;
