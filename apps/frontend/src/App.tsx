import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy, useEffect } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Box, Button, VStack, Text, Spinner } from '@chakra-ui/react';
import MainLayout from '@/components/layouts/MainLayout';
import HomePage from '@/pages/HomePage';
import AuthErrorBoundary from '@/components/common/AuthErrorBoundary';
import { QueryProvider } from '@/providers/QueryProvider';
import { ChakraProvider } from '@/providers/ChakraProvider';
import { useAuthStore } from '@/stores/authStore';

// Lazy loaded pages for code splitting
const EventDetailPage = lazy(() => import('@/pages/EventDetailPage'));
const CreateEventPage = lazy(() => import('@/pages/CreateEventPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const VerifyPage = lazy(() => import('@/pages/VerifyPage'));

// Error fallback component
const ErrorFallback = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => {
  return (
    <Box minH="100vh" bg="white" display="flex" alignItems="center" justifyContent="center" p={4}>
      <Box maxW="md" w="full" bg="white" border="1px solid" borderColor="gray.200" borderRadius="lg" p={8} textAlign="center">
        <Box w={16} h={16} mx="auto" mb={4} borderRadius="full" bg="red.500" display="flex" alignItems="center" justifyContent="center">
          <Text fontSize="2xl" color="white">⚠️</Text>
        </Box>
        <Text fontSize="xl" fontWeight="semibold" mb={2}>
          Something went wrong
        </Text>
        <Text color="gray.500" mb={6}>
          We encountered an unexpected error. Please try refreshing the page.
        </Text>
        <VStack spacing={3}>
          <Button onClick={resetErrorBoundary} colorScheme="brand" w="full">
            Try Again
          </Button>
          <Button onClick={() => window.location.href = '/'} variant="outline" w="full">
            Go Home
          </Button>
        </VStack>
        {process.env.NODE_ENV === 'development' && (
          <Box mt={4} textAlign="left">
            <Text fontSize="sm" color="gray.500" cursor="pointer">Error Details</Text>
            <Box mt={2} fontSize="xs" color="gray.500" bg="gray.100" p={2} borderRadius="md" overflow="auto">
              {error.message}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

// Loading fallback component
const LoadingFallback = () => {
  return (
    <Box minH="100vh" bg="white" display="flex" alignItems="center" justifyContent="center">
      <VStack spacing={4}>
        <Spinner size="xl" color="brand.500" />
        <Text color="gray.500" fontWeight="medium">Loading...</Text>
      </VStack>
    </Box>
  );
};

// Protected route component
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  
  if (isLoading) {
    return <LoadingFallback />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// 404 Not Found component
const NotFound = () => {
  return (
    <Box minH="calc(100vh - 3.5rem)" bg="white" display="flex" alignItems="center" justifyContent="center" p={4}>
      <Box maxW="md" w="full" textAlign="center">
        <Box w={24} h={24} mx="auto" mb={6} borderRadius="full" bg="gray.100" display="flex" alignItems="center" justifyContent="center">
          <Text fontSize="4xl">🔍</Text>
        </Box>
        <Text fontSize="2xl" fontWeight="semibold" mb={2}>
          Page Not Found
        </Text>
        <Text color="gray.500" mb={6}>
          The page you're looking for doesn't exist or has been moved.
        </Text>
        <Button onClick={() => window.history.back()} colorScheme="brand">
          Go Back
        </Button>
      </Box>
    </Box>
  );
};

function App() {
  const { initializeAuth } = useAuthStore();
  
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <ChakraProvider>
        <QueryProvider>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              {/* Public routes */}
              <Route index element={<HomePage />} />
              <Route
                path="events/:eventId"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <EventDetailPage />
                  </Suspense>
                }
              />
              <Route
                path="create-event"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <ProtectedRoute>
                      <CreateEventPage />
                    </ProtectedRoute>
                  </Suspense>
                }
              />
              <Route
                path="profile"
                element={
                  <Suspense fallback={<LoadingFallback />}>
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
                  <AuthErrorBoundary>
                    <Suspense fallback={<LoadingFallback />}>
                      <LoginPage />
                    </Suspense>
                  </AuthErrorBoundary>
                }
              />
              <Route
                path="auth/verify"
                element={
                  <AuthErrorBoundary>
                    <Suspense fallback={<LoadingFallback />}>
                      <VerifyPage />
                    </Suspense>
                  </AuthErrorBoundary>
                }
              />

              {/* 404 route */}
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </QueryProvider>
      </ChakraProvider>
    </ErrorBoundary>
  );
}

export default App;