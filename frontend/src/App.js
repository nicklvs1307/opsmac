import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';

import AppProvider from '@/app/providers';

// Routes
import { router } from '@/app/router';
import { RouterProvider } from 'react-router-dom'; // Add this import

// Create query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  // The useNavigate hook and useEffect are removed as RouterProvider is removed.
  // The setNavigator function might need to be called elsewhere if still needed.

  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <div className="App">
          <RouterProvider router={router} /> {/* Add this line */}
          <Toaster
            position="top-center"
            gutter={12}
            containerStyle={{ margin: '8px' }}
            toastOptions={{
              // Define default options
              className: '',
              duration: 5000,
              style: {
                background: '#ffffff',
                color: '#363636',
                border: '1px solid #f0f0f0',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                padding: '16px',
                fontSize: '16px',
              },

              // Define options for specific types
              success: {
                icon: '✅',
                duration: 3000,
                style: {
                  borderLeft: '5px solid #27ae60',
                },
              },
              error: {
                icon: '❌',
                duration: 5000,
                style: {
                  borderLeft: '5px solid #e74c3c',
                },
              },
            }}
          />
        </div>
      </AppProvider>
    </QueryClientProvider>
  );
}

export default App;
