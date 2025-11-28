import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import type { CheckoutStep } from '../types';

interface CheckoutStepsIndicatorProps {
  step: CheckoutStep;
}

export const CheckoutStepsIndicator: React.FC<CheckoutStepsIndicatorProps> = ({ step }) => {
  return (
    <div className="flex items-center justify-center gap-4 py-4">
      <div className={`flex items-center gap-2 ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
          {step > 1 ? <CheckCircle2 className="h-4 w-4" /> : '1'}
        </div>
        <span className="hidden sm:inline">Endereço</span>
      </div>
      <div className={`flex-1 h-0.5 ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
      <div className={`flex items-center gap-2 ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
          {step > 2 ? <CheckCircle2 className="h-4 w-4" /> : '2'}
        </div>
        <span className="hidden sm:inline">Pagamento</span>
      </div>
      <div className={`flex-1 h-0.5 ${step >= 3 ? 'bg-primary' : 'bg-muted'}`} />
      <div className={`flex items-center gap-2 ${step >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
          3
        </div>
        <span className="hidden sm:inline">Confirmação</span>
      </div>
    </div>
  );
};

