import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import TicketsPage from './pages/TicketsPage';
import TicketDetailPage from './pages/TicketDetailPage';
import UsersPage from './pages/UsersPage';
import KnowledgePage from './pages/KnowledgePage';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 30, retry: 1 } },
});

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  return user ? <>{children}</> : <Navigate to="/login" replace />;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user || user.role === 'User') return <Navigate to="/tickets" replace />;
  return <>{children}</>;
}

function RootRedirect() {
  const { user } = useAuth();
  if (user && user.role !== 'User') return <Navigate to="/dashboard" replace />;
  return <Navigate to="/tickets" replace />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Toaster position="top-right" />
          <Routes>
            <Route path="/login" element={<LoginPage />} /> 
            <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
              <Route index element={<RootRedirect />} />
              <Route path="dashboard" element={<AdminRoute><DashboardPage /></AdminRoute>} />
              <Route path="tickets" element={<TicketsPage />} />
              <Route path="tickets/:id" element={<TicketDetailPage />} />
              <Route path="users" element={<AdminRoute><UsersPage /></AdminRoute>} />
              <Route path="knowledge" element={<AdminRoute><KnowledgePage /></AdminRoute>} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}