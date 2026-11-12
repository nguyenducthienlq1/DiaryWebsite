import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import EntryListPage from './pages/EntryListPage';
import CreateEntryPage from './pages/CreateEntryPage';
import WelcomePage from './pages/WelcomePage';
import ProtectedRoute from './routes/ProtectedRoute';
import RegisterPage from './pages/RegisterPage';
import EntryDetailPage from './pages/EntryDetailPage';
import { Toaster } from 'sonner';

const queryClient = new QueryClient();
function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/entry" element={
              <ProtectedRoute>
                <EntryListPage />
              </ProtectedRoute>
            }
            />
            <Route
              path="/entry/create"
              element={
                <ProtectedRoute>
                  <CreateEntryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/entry/:id"
              element={
                <ProtectedRoute>
                  <EntryDetailPage />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<WelcomePage />} />
          </Routes>
          <Toaster position="top-center" richColors />
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
