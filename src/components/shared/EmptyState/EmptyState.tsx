import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/utils';

export interface EmptyStateAction {
  label: string;
  icon?: string;
}

export interface EmptyStateProps {
  icon?: LucideIcon;
  iconSize?: 'sm' | 'md' | 'lg';
  title: string;
  description?: string;
  actions?: EmptyStateAction[];
  footer?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'compact' | 'centered';
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  iconSize = 'lg',
  title,
  description,
  actions,
  footer,
  className,
  variant = 'centered',
}) => {
  const iconSizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  };

  const containerClasses = cn(
    'flex flex-col',
    variant === 'centered' && 'items-center justify-center',
    variant === 'compact' ? 'py-8' : 'py-16',
    'px-4 space-y-6',
    className
  );

  return (
    <div className={containerClasses}>
      {/* Ícone */}
      {Icon && (
        <div className="text-center">
          <Icon className={cn(iconSizeClasses[iconSize], 'mx-auto text-muted-foreground')} />
        </div>
      )}

      {/* Título e Descrição */}
      <div className={cn('space-y-2', variant === 'centered' && 'text-center')}>
        <h2 className="text-2xl font-bold">{title}</h2>
        {description && (
          <p className={cn('text-muted-foreground', variant === 'centered' && 'max-w-md mx-auto')}>
            {description}
          </p>
        )}
      </div>

      {/* Lista de Ações */}
      {actions && actions.length > 0 && (
        <div className={cn('bg-muted rounded-lg p-6', variant === 'centered' && 'max-w-md w-full')}>
          <h3 className="font-semibold mb-2">Enquanto isso, você pode:</h3>
          <ul className="space-y-1 text-sm text-muted-foreground">
            {actions.map((action, index) => (
              <li key={index}>
                {action.icon && <span className="mr-2">{action.icon}</span>}
                {action.label}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Footer Customizado */}
      {footer && (
        <div className={variant === 'centered' ? 'text-center' : ''}>
          {footer}
        </div>
      )}
    </div>
  );
};
