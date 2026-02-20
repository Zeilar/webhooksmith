import { cva, type VariantProps } from "class-variance-authority";
import classNames from "classnames";
import { type ButtonHTMLAttributes, forwardRef } from "react";

export const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-500 disabled:pointer-events-none disabled:opacity-50 select-none gap-2",
  {
    variants: {
      variant: {
        default: "bg-zinc-300 text-zinc-950 hover:bg-zinc-100",
        secondary: "border-2 border-zinc-700 bg-zinc-800 text-zinc-100 hover:bg-zinc-700",
        outline: "border-2 border-zinc-700 bg-transparent text-zinc-200 hover:bg-zinc-900/75",
        ghost: "text-zinc-200 hover:bg-zinc-900",
        danger: "bg-red-600/55 text-red-50 hover:bg-red-600/65",
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
