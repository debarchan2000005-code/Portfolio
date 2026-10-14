import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error';
  className?: string;
}

const variantClasses = {
  default: 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300',
  success: 'bg-success-50 dark:bg-success-900/30 text-success-700 dark:text-success-300',
  warning: 'bg-warning-50 dark:bg-warning-900/30 text-warning-700 dark:text-warning-300',
  error: 'bg-error-50 dark:bg-error-900/30 text-error-700 dark:text-error-300',
};

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
