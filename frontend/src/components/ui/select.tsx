import { forwardRef, createContext, useContext, useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectContextType {
  value: string;
  onValueChange: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const SelectContext = createContext<SelectContextType | undefined>(undefined);

interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
}

export function Select({ value = '', onValueChange, children }: SelectProps) {
  const [open, setOpen] = useState(false);

  return (
    <SelectContext.Provider value={{ value, onValueChange: onValueChange || (() => {}), open, setOpen }}>
      <div className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  );
}

export interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const SelectTrigger = forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className = '', children, ...props }, ref) => {
    const context = useContext(SelectContext);
    if (!context) throw new Error('SelectTrigger must be used within Select');

    return (
      <button
        ref={ref}
        type="button"
        className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        onClick={() => context.setOpen(!context.open)}
        {...props}
      >
        <div className="flex items-center">
          {children}
        </div>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>
    );
  }
);

SelectTrigger.displayName = 'SelectTrigger';

export interface SelectValueProps {
  placeholder?: string;
}

export function SelectValue({ placeholder }: SelectValueProps) {
  const context = useContext(SelectContext);
  if (!context) throw new Error('SelectValue must be used within Select');

  return (
    <span className={context.value ? 'text-foreground' : 'text-light-grey'}>
      {context.value || placeholder}
    </span>
  );
}

export interface SelectContentProps {
  children: React.ReactNode;
}

export function SelectContent({ children }: SelectContentProps) {
  const context = useContext(SelectContext);
  if (!context) throw new Error('SelectContent must be used within Select');

  if (!context.open) return null;

  return (
    <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
      {children}
    </div>
  );
}

export interface SelectItemProps {
  value: string;
  children: React.ReactNode;
}

export function SelectItem({ value, children }: SelectItemProps) {
  const context = useContext(SelectContext);
  if (!context) throw new Error('SelectItem must be used within Select');

  return (
    <div
      className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 text-foreground"
      onClick={() => {
        context.onValueChange(value);
        context.setOpen(false);
      }}
    >
      {children}
    </div>
  );
}
