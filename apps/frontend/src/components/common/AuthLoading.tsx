import { cn } from '@/utils/cn';

interface AuthLoadingProps {
  message?: string;
  subMessage?: string;
  className?: string;
}

export const AuthLoading = ({ 
  message = "Loading...", 
  subMessage,
  className = "" 
}: AuthLoadingProps) => {
  return (
    <div className={cn("text-center py-8", className)}>
      <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-secondary flex items-center justify-center">
        <div className="spinner"></div>
      </div>
      <h2 className="text-xl font-heading font-bold text-primary mb-2">
        {message}
      </h2>
      {subMessage && (
        <p className="text-secondary">
          {subMessage}
        </p>
      )}
    </div>
  );
};

export default AuthLoading;
