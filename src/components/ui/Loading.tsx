import { Loader2 } from 'lucide-react';

export function LoadingSpinner({ size = 24, className = '' }: { size?: number; className?: string }) {
  return <Loader2 className={`animate-spin text-primary-500 ${className}`} size={size} />;
}

export function FullPageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-900">
      <LoadingSpinner size={40} />
    </div>
  );
}

export function InlineLoader({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-12 text-gray-400 dark:text-slate-500">
      <LoadingSpinner size={20} />
      <span>{text}</span>
    </div>
  );
}
