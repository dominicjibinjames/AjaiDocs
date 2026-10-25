import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const styles: Record<Variant, string> = {
  primary: "bg-accent text-canvas hover:bg-accent-hover disabled:bg-accent/50",
  secondary:
    "bg-canvas text-ink border border-line-strong hover:bg-subdued disabled:opacity-50",
  ghost: "bg-transparent text-ink-secondary hover:bg-subdued hover:text-ink disabled:opacity-50",
  danger: "bg-danger-soft text-danger hover:bg-[#ffcfc8] disabled:opacity-50",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-[18px] py-2.5 text-sm font-semibold tracking-wide transition-all active:scale-[0.99] disabled:cursor-not-allowed ${styles[variant]} ${className}`}
      {...props}
    />
  );
}
