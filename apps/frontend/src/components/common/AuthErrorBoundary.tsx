import { ErrorBoundary } from 'react-error-boundary';
import { Link } from 'react-router-dom';

interface AuthErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

const AuthErrorFallback = ({ error, resetErrorBoundary }: AuthErrorFallbackProps) => {
  return (
    <div className="min-h-screen-minus-header bg-primary flex items-center justify-center p-4">
      <div className="max-w-md w-full card p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-danger flex items-center justify-center">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-xl font-heading font-bold text-primary mb-2">
          Authentication Error
        </h1>
        <p className="text-secondary mb-6">
          Something went wrong during authentication. Please try again.
        </p>
        <div className="space-y-3">
          <button
            onClick={resetErrorBoundary}
            className="btn btn-primary w-full"
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Try Again
          </button>
          <Link
            to="/login"
            className="btn btn-secondary w-full"
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Go to Login
          </Link>
          <Link
            to="/"
            className="btn btn-ghost w-full"
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Go Home
          </Link>
        </div>
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-4 text-left">
            <summary className="text-sm text-tertiary cursor-pointer">Error Details</summary>
            <pre className="mt-2 text-xs text-tertiary bg-secondary p-2 rounded overflow-auto">
              {error.message}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
};

interface AuthErrorBoundaryProps {
  children: React.ReactNode;
}

export const AuthErrorBoundary = ({ children }: AuthErrorBoundaryProps) => {
  return (
    <ErrorBoundary FallbackComponent={AuthErrorFallback}>
      {children}
    </ErrorBoundary>
  );
};

export default AuthErrorBoundary;
