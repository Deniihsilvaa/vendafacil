import React, { useEffect, useRef } from 'react';
import { cn } from '@/utils';

export interface ContextMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}

export interface ContextMenuProps {
  items: ContextMenuItem[];
  isOpen: boolean;
  position: { x: number; y: number };
  onClose: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  items,
  isOpen,
  position,
  onClose,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    // Adicionar listeners
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    // Ajustar posição se o menu sair da tela
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let adjustedX = position.x;
      let adjustedY = position.y;

      // Ajustar horizontalmente
      if (rect.right > viewportWidth) {
        adjustedX = viewportWidth - rect.width - 10;
      }
      if (adjustedX < 10) {
        adjustedX = 10;
      }

      // Ajustar verticalmente
      if (rect.bottom > viewportHeight) {
        adjustedY = viewportHeight - rect.height - 10;
      }
      if (adjustedY < 10) {
        adjustedY = 10;
      }

      if (adjustedX !== position.x || adjustedY !== position.y) {
        menuRef.current.style.left = `${adjustedX}px`;
        menuRef.current.style.top = `${adjustedY}px`;
      }
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, position, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className="fixed z-50 min-w-[180px] bg-popover border border-border rounded-lg shadow-lg p-1"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      {items.map((item, index) => (
        <button
          key={index}
          onClick={() => {
            if (!item.disabled) {
              item.onClick();
              onClose();
            }
          }}
          disabled={item.disabled}
          className={cn(
            'w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors',
            'hover:bg-accent hover:text-accent-foreground',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'text-left'
          )}
        >
          {item.icon && <span className="shrink-0">{item.icon}</span>}
          <span className="flex-1">{item.label}</span>
        </button>
      ))}
    </div>
  );
};

