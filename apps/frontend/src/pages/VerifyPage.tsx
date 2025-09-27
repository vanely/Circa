import { useEffect, useState } from 'react';
import { useSearchParams, Navigate, Link } from 'react-router-dom';
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
  const [isSuccess, setIsSuccess] = useState(false);

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
        setIsSuccess(true);
        setVerificationAttempted(true);
        
        // Redirect after a short delay to show success state
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
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
    <div className="min-h-screen-minus-header bg-primary flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8 transition-theme">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link to="/" className="flex items-center group">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mr-3 group-hover:scale-105 transition-transform">
              <span className="text-white font-bold text-xl">C</span>
            </div>
            <span className="font-heading text-2xl font-bold text-primary group-hover:text-accent transition-colors">
              Circa
            </span>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-heading font-bold text-primary mb-2">
            {isSuccess ? 'Welcome to Circa!' : 'Verifying your login'}
          </h1>
          <p className="text-secondary">
            {isSuccess 
              ? 'You\'re all set! Redirecting you now...'
              : 'Please wait while we verify your magic link'
            }
          </p>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="card p-8">
          {isLoading || verifyMagicLinkMutation.isPending ? (
            <div className="text-center py-6">
              {/* Loading Animation */}
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-secondary flex items-center justify-center">
                <LoadingSpinner size="lg" variant="accent" />
              </div>
              <h2 className="text-xl font-heading font-bold text-primary mb-2">
                Verifying your magic link...
              </h2>
              <p className="text-secondary">
                This will only take a moment
              </p>
            </div>
          ) : verificationError ? (
            <div className="text-center">
              {/* Error Icon */}
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-danger flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              
              {/* Error Message */}
              <h2 className="text-xl font-heading font-bold text-primary mb-4">
                Verification Failed
              </h2>
              <p className="text-secondary mb-6">
                {verificationError}
              </p>
              
              {/* Actions */}
              <div className="space-y-3">
                <Link
                  to="/login"
                  className="btn btn-primary w-full"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Try Again
                </Link>
                <Link
                  to="/"
                  className="btn btn-secondary w-full"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Go Home
                </Link>
              </div>
            </div>
          ) : isSuccess ? (
            <div className="text-center py-6">
              {/* Success Icon */}
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-success flex items-center justify-center animate-scale-in">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              {/* Success Message */}
              <h2 className="text-xl font-heading font-bold text-primary mb-2">
                Successfully signed in!
              </h2>
              <p className="text-secondary mb-6">
                Redirecting you to your dashboard...
              </p>
              
              {/* Loading indicator for redirect */}
              <div className="flex items-center justify-center">
                <LoadingSpinner size="sm" variant="accent" />
                <span className="ml-2 text-tertiary text-sm">Redirecting...</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              {/* Default loading state */}
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-secondary flex items-center justify-center">
                <LoadingSpinner size="lg" variant="accent" />
              </div>
              <h2 className="text-xl font-heading font-bold text-primary mb-2">
                Preparing your experience...
              </h2>
              <p className="text-secondary">
                Setting up your personalized dashboard
              </p>
            </div>
          )}
        </div>
        
        {/* Back to Home */}
        <div className="mt-8 text-center">
          <Link 
            to="/" 
            className="inline-flex items-center text-sm text-secondary hover:text-accent transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyPage;