import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Paper,
} from '@mui/material';
import { People as PeopleIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const FrequentCustomersList = ({ customers }) => {
  const { t } = useTranslation();

  if (!customers || customers.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        {t('checkin_dashboard.no_frequent_customers')}
      </Typography>
    );
  }

  return (
    <List>
      {customers.map((customer) => (
        <ListItem key={customer.customer_id}>
          <ListItemIcon>
            <PeopleIcon />
          </ListItemIcon>
          <ListItemText
            primary={customer.customer.name}
            secondary={t('checkin_dashboard.checkins_count', {
              count: customer.checkin_count,
            })}
          />
        </ListItem>
      ))}
    </List>
  );
};

export default FrequentCustomersList;
