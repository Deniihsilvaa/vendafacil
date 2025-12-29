import React, { createContext, useContext, useState, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/utils';

interface AccordionContextType {
  openItems: Set<string>;
  toggleItem: (value: string) => void;
}

const AccordionContext = createContext<AccordionContextType | undefined>(undefined);

const useAccordionContext = () => {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error('AccordionItem must be used within Accordion');
  }
  return context;
};

export interface AccordionProps {
  type?: 'single' | 'multiple';
  defaultValue?: string | string[];
  children: React.ReactNode;
  className?: string;
}

export const Accordion: React.FC<AccordionProps> = ({
  type = 'multiple',
  defaultValue = [],
  children,
  className,
}) => {
  const initialOpen = Array.isArray(defaultValue) ? new Set(defaultValue) : new Set([defaultValue].filter(Boolean));
  const [openItems, setOpenItems] = useState<Set<string>>(initialOpen);

  const toggleItem = useCallback((value: string) => {
    setOpenItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(value)) {
        newSet.delete(value);
      } else {
        if (type === 'single') {
          newSet.clear();
        }
        newSet.add(value);
      }
      return newSet;
    });
  }, [type]);

  return (
    <AccordionContext.Provider value={{ openItems, toggleItem }}>
      <div className={cn('space-y-2', className)}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
};

export interface AccordionItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onDisabledClick?: () => void;
}

export const AccordionItem: React.FC<AccordionItemProps> = ({
  value,
  children,
  className,
  disabled,
  onDisabledClick,
}) => {
  const { openItems, toggleItem } = useAccordionContext();
  const isOpen = openItems.has(value);
  const isDisabled = disabled || false;

  const handleToggle = () => {
    if (isDisabled) {
      onDisabledClick?.();
      return;
    }
    toggleItem(value);
  };

  return (
    <div className={cn('border rounded-lg overflow-hidden', isDisabled && 'opacity-60', className)}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<{ value?: string; isOpen?: boolean; onToggle?: () => void; disabled?: boolean }>, {
            value,
            isOpen: isDisabled ? false : isOpen,
            onToggle: handleToggle,
            disabled: isDisabled,
          });
        }
        return child;
      })}
    </div>
  );
};

export interface AccordionTriggerProps {
  value?: string;
  isOpen?: boolean;
  onToggle?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const AccordionTrigger: React.FC<AccordionTriggerProps> = ({
  isOpen = false,
  onToggle,
  disabled = false,
  children,
  className,
}) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className={cn(
        'w-full flex items-center justify-between p-4 transition-colors',
        disabled 
          ? 'cursor-not-allowed opacity-60' 
          : 'hover:bg-gray-50 cursor-pointer',
        className
      )}
    >
      <div className="flex-1 text-left">{children}</div>
      <ChevronDown
        className={cn(
          'h-5 w-5 text-muted-foreground transition-transform duration-200',
          isOpen && 'transform rotate-180'
        )}
      />
    </button>
  );
};

export interface AccordionContentProps {
  value?: string;
  isOpen?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const AccordionContent: React.FC<AccordionContentProps> = ({
  isOpen = false,
  children,
  className,
}) => {
  if (!isOpen) return null;

  return (
    <div className={cn('p-4 border-t bg-gray-50/50', className)}>
      {children}
    </div>
  );
};

