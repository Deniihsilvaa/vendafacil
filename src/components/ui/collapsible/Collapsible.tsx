import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/utils';

export interface CollapsibleProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const Collapsible: React.FC<CollapsibleProps> = ({
  title,
  defaultOpen = false,
  children,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={cn('border rounded-lg overflow-hidden', className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <h3 className="text-lg font-semibold">{title}</h3>
        <ChevronDown
          className={cn(
            'h-5 w-5 text-muted-foreground transition-transform',
            isOpen && 'transform rotate-180'
          )}
        />
      </button>
      {isOpen && (
        <div className="p-4 border-t bg-gray-50/50">
          {children}
        </div>
      )}
    </div>
  );
};
