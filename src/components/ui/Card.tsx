import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  href?: string;
}

export function Card({ children, className = '', onClick, href }: CardProps) {
  const classes = `card ${className}`;

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={`block ${classes}`}>
        {children}
      </a>
    );
  }

  return (
    <div className={classes} onClick={onClick} role={onClick ? 'button' : undefined}>
      {children}
    </div>
  );
}
