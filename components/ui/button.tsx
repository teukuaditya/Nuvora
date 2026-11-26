import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "md" | "sm";

const variantClass: Record<Variant, string> = {
  primary: "bg-tinta text-putih hover:bg-[#1a2940]",
  secondary: "bg-putih text-tinta border border-garis hover:bg-porselen",
  ghost: "bg-transparent text-tinta hover:bg-porselen",
  danger: "bg-putih text-merah-tiang border border-[#f0c9c7] hover:bg-[#fff5f5]",
};

const sizeClass: Record<Size, string> = {
  md: "min-h-11 px-4 py-2.5 text-sm",
  sm: "min-h-11 px-3 py-2 text-sm",
};

type Common = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: Common & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-biru-tiang focus-visible:ring-offset-2 disabled:opacity-50 ${variantClass[variant]} ${sizeClass[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className = "",
  children,
}: Common & { href: string }) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-biru-tiang focus-visible:ring-offset-2 ${variantClass[variant]} ${sizeClass[size]} ${className}`}
    >
      {children}
    </Link>
  );
}
