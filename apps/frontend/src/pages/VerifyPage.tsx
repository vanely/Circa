import { useEffect, useState } from 'react';
import { useSearchParams, Navigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useVerifyMagicLink } from '@/hooks/auth';
import { useAuthStore } from '@/stores/authStore';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const VerifyPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { isAuthenticated, isLoading } = useAuthStore();
  const verifyMagicLinkMutation = useVerifyMagicLink();
  const [verificationAttempted, setVerificationAttempted] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setVerificationError('Invalid or missing verification token.');
        setVerificationAttempted(true);
        return;
      }

      try {
        await verifyMagicLinkMutation.mutateAsync(token);
        toast.success('Successfully signed in!');
        setVerificationAttempted(true);
      } catch (error) {
        console.error('Verification error:', error);
        setVerificationError('The login link is invalid or has expired. Please request a new one.');
        setVerificationAttempted(true);
      }
    };

    if (token && !verificationAttempted && !isAuthenticated) {
      verifyToken();
    }
  }, [token, verifyMagicLinkMutation, isAuthenticated, verificationAttempted]);

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen-minus-header flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-heading font-bold text-gray-900">
          Verifying your login
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {isLoading || verifyMagicLinkMutation.isPending ? (
            <div className="text-center py-6">
              <LoadingSpinner size="lg" className="mb-4" />
              <p className="text-gray-600">Verifying your magic link...</p>
            </div>
          ) : verificationError ? (
            <div className="text-center">
              <div className="mb-4 text-red-500">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-gray-800 font-medium mb-2">Verification Failed</p>
              <p className="text-gray-600 mb-6">{verificationError}</p>
              <a
                href="/login"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Try Again
              </a>
            </div>
          ) : (
            <div className="text-center py-6">
              <LoadingSpinner size="lg" className="mb-4" />
              <p className="text-gray-600">Preparing your experience...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyPage;