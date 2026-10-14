import { useScrollReveal } from '@/hooks/useScrollReveal';
import type { ReactNode } from 'react';

interface SectionProps {
  id?: string;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}

export function Section({ id, title, subtitle, children, className = '' }: SectionProps) {
  const { ref, visible } = useScrollReveal<HTMLElement>();

  return (
    <section
      id={id}
      ref={ref as React.RefObject<HTMLElement>}
      className={`section-padding ${visible ? 'animate-slide-up' : 'opacity-0'} ${className}`}
    >
      <div className="container-content">
        {title && (
          <div className="mb-12 text-center">
            <h2 className="text-4xl md:text-3xl font-bold mb-3">{title}</h2>
            {subtitle && (
              <p className="text-lg text-gray-500 dark:text-slate-400 max-w-2xl mx-auto">{subtitle}</p>
            )}
            <div className="mt-4 h-1 w-16 bg-primary-500 rounded-full mx-auto" />
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
