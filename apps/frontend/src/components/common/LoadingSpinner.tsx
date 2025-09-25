import { cn } from '@/utils/cn';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'white';
  className?: string;
}

const LoadingSpinner = ({ 
  size = 'md', 
  color = 'primary',
  className 
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-10 h-10 border-3'
  };
  
  const colorClasses = {
    primary: 'border-primary-200 border-t-primary-600',
    white: 'border-gray-200 border-t-white'
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={cn(
          "animate-spin rounded-full",
          sizeClasses[size],
          colorClasses[color],
          className
        )}
      />
    </div>
  );
};

export default LoadingSpinner;