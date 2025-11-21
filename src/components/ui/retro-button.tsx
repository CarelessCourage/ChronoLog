import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const retroButtonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap font-pixel font-bold tracking-wider transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'win98-outset bg-gray-300 hover:bg-gray-400 text-gray-900',
        secondary: 'win98-outset bg-gray-200 hover:bg-gray-300 text-gray-900',
        destructive: 'win98-outset bg-red-300 hover:bg-red-400 text-gray-900',
        outline: 'win98-outset bg-white hover:bg-gray-100 text-gray-900 border border-gray-400',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3 text-xs',
        lg: 'h-12 px-8 text-lg',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface RetroButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof retroButtonVariants> {
  asChild?: boolean;
}

const RetroButton = React.forwardRef<HTMLButtonElement, RetroButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(retroButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
RetroButton.displayName = 'RetroButton';

export { RetroButton, retroButtonVariants };
