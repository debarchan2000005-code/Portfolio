import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({ label, error, hint, className = '', id, ...props }: InputProps) {
  const inputId = id || props.name;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`input-field ${error ? 'border-error-500 focus:border-error-500 focus:ring-error-500/20' : ''} ${className}`}
        {...props}
      />
      {error && <p className="mt-1.5 text-sm text-error-500">{error}</p>}
      {hint && !error && <p className="mt-1.5 text-sm text-gray-400 dark:text-slate-500">{hint}</p>}
    </div>
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className = '', id, ...props }: TextareaProps) {
  const inputId = id || props.name;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={`input-field resize-y min-h-[120px] ${error ? 'border-error-500 focus:border-error-500 focus:ring-error-500/20' : ''} ${className}`}
        {...props}
      />
      {error && <p className="mt-1.5 text-sm text-error-500">{error}</p>}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  children: React.ReactNode;
}

export function Select({ label, error, className = '', id, children, ...props }: SelectProps) {
  const inputId = id || props.name;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
          {label}
        </label>
      )}
      <select id={inputId} className={`input-field cursor-pointer ${className}`} {...props}>
        {children}
      </select>
      {error && <p className="mt-1.5 text-sm text-error-500">{error}</p>}
    </div>
  );
}
