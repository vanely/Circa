import { cn } from '@/utils/cn';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'secondary' | 'accent';
  className?: string;
}

const LoadingSpinner = ({ 
  size = 'md', 
  variant = 'primary',
  className 
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };
  
  const variantClasses = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    accent: 'text-accent'
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={cn(
          "spinner",
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
      />
    </div>
  );
};

export default LoadingSpinner;