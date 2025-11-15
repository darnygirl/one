/**
 * Link Component
 * Renders links with optional icons
 */

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface LinkProps {
  href: string;
  children: ReactNode;
  icon?: string;
  external?: boolean;
  size?: "xs" | "sm" | "md";
  className?: string;
}

export function Link({
  href,
  children,
  icon,
  external = false,
  size = "sm",
  className,
}: LinkProps) {
  const sizeClasses = {
    xs: "text-xs",
    sm: "text-sm",
    md: "text-base",
  };

  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={cn(
        sizeClasses[size],
        "text-primary hover:underline inline-flex items-center gap-1",
        className
      )}
    >
      {icon && <span>{icon}</span>}
      {children}
      {external && <span className="ml-0.5">↗</span>}
    </a>
  );
}
