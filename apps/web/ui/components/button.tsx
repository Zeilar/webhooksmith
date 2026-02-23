import { cva, type VariantProps } from "class-variance-authority";
import classNames from "classnames";
import { type ButtonHTMLAttributes, forwardRef } from "react";

export const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400/65 disabled:pointer-events-none disabled:opacity-50 select-none gap-2",
  {
    variants: {
      variant: {
        default: "bg-fuchsia-400/40 text-fuchsia-50 hover:bg-fuchsia-400/50",
        secondary: "border border-slate-500/70 bg-slate-800/65 hover:bg-slate-700/75",
        outline: "border border-slate-700/75 bg-slate-900/30 hover:bg-slate-800/35",
        ghost: "text-slate-200 hover:bg-slate-800/65",
        danger: "border border-red-400/45 bg-red-600/25 text-red-100 hover:bg-red-600/35",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, ...props }, ref) => {
  return <button className={classNames(buttonVariants({ variant, size }), className)} ref={ref} {...props} />;
});

Button.displayName = "Button";
