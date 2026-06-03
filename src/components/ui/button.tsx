'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-glow hover:bg-primary-600 hover:shadow-[0_8px_30px_-6px_rgba(0,200,83,0.55)]',
        secondary:
          'bg-secondary text-secondary-foreground shadow-glow-blue hover:bg-secondary-600',
        accent:
          'bg-accent text-accent-foreground hover:bg-accent-600 shadow-[0_8px_24px_-8px_rgba(255,184,0,0.6)]',
        dark: 'bg-dark text-white hover:bg-dark-800 shadow-card',
        outline:
          'border border-dark-200 bg-white hover:bg-dark-50 text-dark-900 shadow-sm',
        ghost: 'hover:bg-dark-100 text-dark-700',
        link: 'text-primary underline-offset-4 hover:underline',
        destructive:
          'bg-danger text-white hover:bg-red-600 shadow-sm',
        whatsapp:
          'bg-[#25D366] text-white hover:bg-[#1ebe5d] shadow-[0_8px_24px_-8px_rgba(37,211,102,0.6)]',
      },
      size: {
        default: 'h-11 px-5 py-2',
        sm: 'h-9 px-3.5 text-xs',
        lg: 'h-12 px-7 text-base',
        xl: 'h-14 px-9 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
