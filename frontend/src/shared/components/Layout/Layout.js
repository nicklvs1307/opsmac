import React from 'react';
import { Box, Flex } from '@chakra-ui/react';
import Sidebar from '../../../components/Layout/Sidebar';
import { Outlet } from 'react-router-dom';
import './Layout.css';

const Layout = () => {
  return (
    <Flex>
      <Box className="sidebar">
        <Sidebar />
      </Box>
      <Box className="content">
        <Outlet />
      </Box>
    </Flex>
  );
};

export default Layout;
