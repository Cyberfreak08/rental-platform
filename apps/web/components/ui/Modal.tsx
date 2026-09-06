import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'md',
}) => {
  if (!isOpen) return null;

  const maxWidths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="fixed inset-0" onClick={onClose} />
      <div
        className={cn(
          'relative w-full bg-surface rounded-card border border-border shadow-xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200',
          maxWidths[maxWidth]
        )}
      >
        <div className="flex items-center justify-between p-5 border-b border-border/60">
          <div>
            {title && <h3 className="text-lg font-semibold text-text">{title}</h3>}
            {description && <p className="text-sm text-text-muted mt-0.5">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text p-1.5 rounded-control hover:bg-surface-alt transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
};
