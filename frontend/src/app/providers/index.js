import React from 'react';
import { AuthProvider } from '@/app/providers/contexts/AuthContext';
import { ThemeProvider } from '@/app/providers/contexts/ThemeContext';

const AppProvider = ({ children }) => {
  return (
    <ThemeProvider>
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  );
};

export default AppProvider;
