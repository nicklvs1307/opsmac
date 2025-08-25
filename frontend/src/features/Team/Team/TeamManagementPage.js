import React, { useState, useEffect, useContext } from 'react';
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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '@/shared/lib/axiosInstance';

const TeamManagementPage = () => {
  const { user } = useContext(AuthContext);
  const [team, setTeam] = useState([]);
  const [open, setOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const restaurantId = user?.restaurant?.id;

  useEffect(() => {
    if (restaurantId) {
      api
        .get(`/restaurant/${restaurantId}/users`)
        .then((response) => setTeam(response.data))
        .catch((error) => console.error('Error fetching team:', error));
    }
  }, [restaurantId]);

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
    const url = isEditing
      ? `/restaurant/${restaurantId}/users/${currentUser.id}`
      : `/restaurant/${restaurantId}/users`;
    const method = isEditing ? 'put' : 'post';

    api[method](url, currentUser)
      .then((response) => {
        if (isEditing) {
          setTeam(team.map((u) => (u.id === currentUser.id ? response.data : u)));
        } else {
          setTeam([...team, response.data]);
        }
        handleClose();
      })
      .catch((error) => console.error('Error saving user:', error));
  };

  const handleDelete = (userId) => {
    api
      .delete(`/restaurant/${restaurantId}/users/${userId}`)
      .then(() => {
        setTeam(team.filter((u) => u.id !== userId));
      })
      .catch((error) => console.error('Error deleting user:', error));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentUser({ ...currentUser, [name]: value });
  };

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
              {team.map((member) => (
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
            value={currentUser?.name}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="email"
            label="Email"
            type="email"
            fullWidth
            value={currentUser?.email}
            onChange={handleChange}
          />
          {!isEditing && (
            <TextField
              margin="dense"
              name="password"
              label="Senha"
              type="password"
              fullWidth
              value={currentUser?.password}
              onChange={handleChange}
            />
          )}
          <FormControl fullWidth margin="dense">
            <InputLabel>Função</InputLabel>
            <Select name="role" value={currentUser?.role} onChange={handleChange}>
              <MenuItem value="waiter">Garçom</MenuItem>
              <MenuItem value="manager">Gerente</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleSave}>{isEditing ? 'Salvar' : 'Adicionar'}</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TeamManagementPage;
