import * as React from "react"
import { Input } from '../input';
import { cn } from "@/utils"

export interface InputWithLabelProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const InputWithLabel = React.forwardRef<HTMLInputElement, InputWithLabelProps>(
  ({ label, error, helperText, id, className, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="flex flex-col space-y-1 w-full">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-foreground">
            {label}
            {props.required && <span className="text-destructive ml-1">*</span>}
          </label>
        )}
        
        <Input
          id={inputId}
          ref={ref}
          className={cn(
            error && "border-destructive focus-visible:ring-destructive",
            className
          )}
          {...props}
        />
        
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
        
        {helperText && !error && (
          <p className="text-sm text-muted-foreground">{helperText}</p>
        )}
      </div>
    );
  }
);
InputWithLabel.displayName = "InputWithLabel";
