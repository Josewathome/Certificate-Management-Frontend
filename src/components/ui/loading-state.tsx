
import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingStateProps {
  className?: string;
  size?: 'sm' | 'default' | 'lg';
  text?: string;
  variant?: 'spinner' | 'skeleton' | 'pulse';
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  className,
  size = 'default',
  text = 'Loading...',
  variant = 'spinner'
}) => {
  const iconSize = size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-8 w-8' : 'h-6 w-6';

  if (variant === 'skeleton') {
    return (
      <div className={cn('space-y-3', className)}>
        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse w-4/6"></div>
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className={cn('w-full h-32 bg-gray-200 rounded animate-pulse', className)}></div>
    );
  }

  return (
    <div className={cn('flex items-center justify-center gap-2 py-8', className)}>
      <Loader2 className={cn('animate-spin', iconSize)} />
      {text && <span className="text-muted-foreground">{text}</span>}
    </div>
  );
};
