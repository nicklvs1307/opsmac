import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  CircularProgress,
  Alert,
  IconButton,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useGetRoles, useDeleteRole } from '@/features/Owner/api/ownerQueries';
// import RoleEditorModal from './RoleEditorModal'; // Commented out as file not found

const RoleManagementPage = () => {
  const [, setIsModalOpen] = useState(false);
  const [, setSelectedRole] = useState(null);

  const { data: roles, isLoading, isError, error } = useGetRoles();
  const deleteRoleMutation = useDeleteRole();

  const handleOpenModal = (role) => {
    setSelectedRole(role);
    setIsModalOpen(true);
  };

  const handleDeleteRole = (roleId) => {
    if (window.confirm('Tem certeza que deseja deletar esta função?')) {
      deleteRoleMutation.mutate(roleId);
    };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1">
            Funções e Permissões
          </Typography>
          <Button variant="contained" onClick={() => handleOpenModal(null)}>
            Criar Nova Função
          </Button>
        </Box>

        {isLoading ? (
          <CircularProgress />
        ) : isError ? (
          <Alert severity="error">{error.message}</Alert>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Função</TableCell>
                  <TableCell>Descrição</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell>{role.name}</TableCell>
                    <TableCell>{role.description}</TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => handleOpenModal(role)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDeleteRole(role.id)}
                        disabled={deleteRoleMutation.isLoading}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
      {/* <RoleEditorModal open={isModalOpen} onClose={handleCloseModal} role={selectedRole} /> */}
    </Container>
  );
};

export default RoleManagementPage;
