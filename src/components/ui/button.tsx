import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "group/btn relative inline-flex items-center justify-center gap-2 overflow-hidden whitespace-nowrap font-medium",
    "transition-[background-color,color,border-color,box-shadow,transform] duration-200",
    "[transition-timing-function:var(--ease-standard)]",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
    "disabled:pointer-events-none disabled:opacity-50",
    "active:scale-[0.985]",
    "[&_svg]:size-[1.05em] [&_svg]:shrink-0",
    // trailing icons lean forward on hover — the arrow is doing the pointing
    "[&_svg:last-child]:transition-transform [&_svg:last-child]:duration-300",
    "[&_svg:last-child]:[transition-timing-function:var(--ease-standard)]",
    "hover:[&_svg:last-child]:translate-x-0.5",
    // a light sweep crosses the surface once per hover
    "before:pointer-events-none before:absolute before:inset-0 before:-translate-x-full",
    "before:bg-[linear-gradient(100deg,transparent,color-mix(in_oklab,#fff_22%,transparent),transparent)]",
    "before:transition-transform before:duration-700 before:[transition-timing-function:var(--ease-out-expo)]",
    "hover:before:translate-x-full",
  ],
  {
    variants: {
      variant: {
        primary: [
          "bg-primary text-primary-fg shadow-e1",
          "hover:bg-primary-hover hover:shadow-[0_10px_30px_-12px_color-mix(in_oklab,var(--primary)_75%,transparent)]",
        ],
        secondary: [
          "bg-surface-2 text-fg border border-line",
          "hover:border-line-strong hover:bg-elevated",
        ],
        outline: [
          "border border-line text-fg bg-transparent",
          "hover:border-primary-border hover:bg-primary-soft",
        ],
        ghost: "text-fg-muted hover:text-fg hover:bg-surface-2",
        link: "text-primary underline-offset-4 hover:underline p-0 h-auto",
        glass: ["glass text-fg", "hover:border-primary-border"],
      },
      size: {
        sm: "h-9 rounded-[10px] px-3.5 text-sm",
        md: "h-11 rounded-xl px-5 text-sm",
        lg: "h-[52px] rounded-[14px] px-7 text-[0.95rem]",
        icon: "h-10 w-10 rounded-xl",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { buttonVariants };
