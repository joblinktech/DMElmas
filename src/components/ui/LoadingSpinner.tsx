import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
  color?: 'primary' | 'white' | 'grey';
}

const sizeClasses = {
  small: 'h-4 w-4',
  medium: 'h-6 w-6',
  large: 'h-12 w-12',
};

const colorClasses = {
  primary: 'text-primary',
  white: 'text-white',
  grey: 'text-grey-400',
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium', 
  color = 'primary',
  className 
}) => {
  return (
    <div className="flex items-center justify-center">
      <Loader2 
        className={cn(
          'animate-spin', 
          sizeClasses[size], 
          colorClasses[color],
          className
        )} 
      />
    </div>
  );
};

export default LoadingSpinner;