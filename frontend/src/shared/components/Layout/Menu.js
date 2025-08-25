import React from 'react';
import { NavLink } from 'react-router-dom';
import { List, ListItem, ListIcon } from '@chakra-ui/react';
import { FaTachometerAlt, FaUsers, FaCog } from 'react-icons/fa';
import './Layout.css';

const Menu = () => {
  return (
    <List spacing={3}>
      <ListItem>
        <NavLink to="/fidelity/dashboard" className="menu-link">
          <ListIcon as={FaTachometerAlt} />
          Dashboard
        </NavLink>
      </ListItem>
      <ListItem>
        <NavLink to="/fidelity/relationship/customers" className="menu-link">
          <ListIcon as={FaUsers} />
          Clientes
        </NavLink>
      </ListItem>
      <ListItem>
        <NavLink to="/settings" className="menu-link">
          <ListIcon as={FaCog} />
          Configurações
        </NavLink>
      </ListItem>
    </List>
  );
};

export default Menu;
