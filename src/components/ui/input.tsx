import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-11 w-full rounded-xl border border-dark-200 bg-white px-4 py-2 text-sm text-dark-900 placeholder:text-dark-400 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        // Browser form-fill extensions stamp `fdprocessedid` on inputs after
        // hydration. This is a false-positive mismatch — silence it globally.
        suppressHydrationWarning
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
