import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy, useEffect } from 'react';
import MainLayout from '@/components/layouts/MainLayout';
import HomePage from '@/pages/HomePage';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { QueryProvider } from '@/providers/QueryProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { useAuthStore } from '@/stores/authStore';

// Lazy loaded pages for code splitting
const EventDetailPage = lazy(() => import('@/pages/EventDetailPage'));
const CreateEventPage = lazy(() => import('@/pages/CreateEventPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const VerifyPage = lazy(() => import('@/pages/VerifyPage'));

// Protected route component
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  const { initializeAuth } = useAuthStore();
  
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <ThemeProvider>
      <QueryProvider>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            {/* Public routes */}
            <Route index element={<HomePage />} />
            <Route 
              path="events/:eventId" 
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <EventDetailPage />
                </Suspense>
              } 
            />
            <Route 
              path="create-event" 
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <ProtectedRoute>
                    <CreateEventPage />
                  </ProtectedRoute>
                </Suspense>
              } 
            />
            <Route 
              path="profile" 
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                </Suspense>
              } 
            />
            
            {/* Auth routes */}
            <Route 
              path="login" 
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <LoginPage />
                </Suspense>
              } 
            />
            <Route 
              path="auth/verify" 
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <VerifyPage />
                </Suspense>
              } 
            />
            
            {/* 404 route */}
            <Route path="*" element={<div>Not Found</div>} />
          </Route>
        </Routes>
      </QueryProvider>
    </ThemeProvider>
  );
}

export default App;