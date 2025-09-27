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
    <div className="min-h-screen-minus-header flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-heading font-bold text-gray-900">
          {emailSent ? 'Check your email' : 'Sign in to Circa'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {emailSent 
            ? 'We sent you a magic link to continue'
            : 'Discover and join amazing events in your area'
          }
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {emailSent ? (
            <div className="text-center">
              <div className="mb-6 text-primary-600">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="mb-2 text-gray-800">
                We've sent a magic link to <span className="font-medium">{sentToEmail}</span>
              </p>
              <p className="text-sm text-gray-600 mb-6">
                Click the link in the email to sign in to your account.
                The link will expire in 15 minutes.
              </p>
              <button
                onClick={() => setEmailSent(false)}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Try a different email
              </button>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address',
                      },
                    })}
                  />
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading || loginMutation.isPending}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading || loginMutation.isPending ? <LoadingSpinner size="sm" variant="accent" /> : 'Send magic link'}
                </button>
              </div>
              
              <div className="text-sm text-center">
                <p className="text-gray-600">
                  Don't have an account?{' '}
                  <span className="font-medium text-primary-600 hover:text-primary-500">
                    We'll create one for you
                  </span>
                </p>
              </div>
            </form>
          )}
        </div>
        
        <div className="mt-6 text-center">
          <Link to="/" className="text-sm font-medium text-primary-600 hover:text-primary-500">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;