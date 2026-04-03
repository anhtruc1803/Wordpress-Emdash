import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonStyles = cva(
  "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-slate-950 text-white hover:bg-slate-800",
        secondary: "border border-line bg-white text-slate-700 hover:bg-slate-50",
        subtle: "bg-panel-strong text-slate-700 hover:bg-slate-200/70"
      }
    },
    defaultVariants: {
      variant: "primary"
    }
  }
);

export function Button({
  className,
  variant,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonStyles>) {
  return <button className={cn(buttonStyles({ variant }), className)} {...props} />;
}
