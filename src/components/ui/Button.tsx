import type { ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  children: ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost:
    'inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-gray-600 dark:text-slate-300 font-medium transition-all duration-200 hover:bg-gray-100 dark:hover:bg-slate-800',
  danger:
    'inline-flex items-center justify-center gap-2 rounded-lg bg-error-500 px-6 py-3 text-white font-medium transition-all duration-200 hover:bg-error-600 hover:scale-[1.02] active:scale-100',
};

const sizeClasses: Record<Size, string> = {
  sm: 'text-sm px-4 py-2',
  md: '',
  lg: 'text-lg px-8 py-4',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  );
}
