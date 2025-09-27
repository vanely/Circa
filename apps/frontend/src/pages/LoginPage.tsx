import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useLogin } from '@/hooks/auth';
import { useAuthStore } from '@/stores/authStore';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface LoginFormData {
  email: string;
}

const LoginPage = () => {
  const { isLoading } = useAuthStore();
  const loginMutation = useLogin();
  const [emailSent, setEmailSent] = useState(false);
  const [sentToEmail, setSentToEmail] = useState('');
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<LoginFormData>();
  
  const onSubmit = async (data: LoginFormData) => {
    try {
      await loginMutation.mutateAsync(data.email);
      toast.success('Magic link sent to your email');
      setEmailSent(true);
      setSentToEmail(data.email);
      reset();
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Failed to send magic link. Please try again.');
    }
  };
  
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
            {emailSent ? 'Check your email' : 'Welcome back'}
          </h1>
          <p className="text-secondary">
            {emailSent 
              ? 'We sent you a magic link to continue'
              : 'Sign in to discover amazing events'
            }
          </p>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="card p-8">
          {emailSent ? (
            <div className="text-center">
              {/* Success Icon */}
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-success flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              
              {/* Success Message */}
              <h2 className="text-xl font-heading font-bold text-primary mb-4">
                Magic link sent!
              </h2>
              <p className="text-secondary mb-2">
                We've sent a magic link to
              </p>
              <p className="text-accent font-medium mb-6">
                {sentToEmail}
              </p>
              <p className="text-tertiary text-sm mb-8">
                Click the link in the email to sign in. The link will expire in 15 minutes.
              </p>
              
              {/* Actions */}
              <div className="space-y-3">
                <button
                  onClick={() => setEmailSent(false)}
                  className="btn btn-secondary w-full"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Try a different email
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="btn btn-ghost w-full"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh page
                </button>
              </div>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              {/* Email Input */}
              <div>
                <label htmlFor="email" className="form-label">
                  Email address
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    className={`form-control pl-10 ${
                      errors.email ? 'border-danger' : ''
                    }`}
                    placeholder="Enter your email address"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Please enter a valid email address',
                      },
                    })}
                  />
                </div>
                {errors.email && (
                  <p className="form-error">{errors.email.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={isLoading || loginMutation.isPending}
                  className="btn btn-primary w-full"
                >
                  {isLoading || loginMutation.isPending ? (
                    <>
                      <LoadingSpinner size="sm" variant="accent" className="mr-2" />
                      Sending magic link...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Send magic link
                    </>
                  )}
                </button>
              </div>
              
              {/* Info Text */}
              <div className="text-center">
                <p className="text-tertiary text-sm">
                  Don't have an account?{' '}
                  <span className="text-accent font-medium">
                    We'll create one for you
                  </span>
                </p>
              </div>
            </form>
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

export default LoginPage;