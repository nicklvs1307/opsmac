import React from 'react';
import {
  Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, CircularProgress, IconButton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { useTranslation } from 'react-i18next';

const UserTable = ({ users, loading, handleOpenUserModal }) => {
  const { t } = useTranslation();

  return (
    <TableContainer component={Paper} sx={{ mt: 3 }}>
      <Button onClick={() => handleOpenUserModal()}> {t('admin_dashboard.create_user_tab')} </Button>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>{t('admin_dashboard.list_header_name')}</TableCell>
            <TableCell>{t('admin_dashboard.list_header_email')}</TableCell>
            <TableCell>{t('admin_dashboard.list_header_role')}</TableCell>
            <TableCell align="right">{t('admin_dashboard.list_header_actions')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? <TableRow><TableCell colSpan={4} align="center"><CircularProgress /></TableCell></TableRow> : 
            users.map(user => (
              <TableRow key={user.id} hover>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleOpenUserModal(user)}><EditIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))
          }
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default UserTable;
