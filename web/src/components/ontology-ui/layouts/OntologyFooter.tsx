/**
 * OntologyFooter - Footer with platform info
 *
 * Displays platform information, dimension links, custom links,
 * copyright/version info, and social links.
 */

import type { Dimension } from "../types";
import { DIMENSIONS } from "../types";
import { Separator } from "@/components/ui/separator";
import { cn, getDimensionIcon } from "../utils";

export interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface OntologyFooterProps {
  showDimensions?: boolean;
  links?: FooterLink[];
  className?: string;
}

export function OntologyFooter({
  showDimensions = true,
  links = [],
  className,
}: OntologyFooterProps) {
  const currentYear = new Date().getFullYear();
  const version = "1.0.0"; // Could be injected via env var

  const defaultLinks: FooterLink[] = [
    { label: "Documentation", href: "/docs" },
    { label: "API Reference", href: "/api" },
    { label: "Support", href: "/support" },
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
  ];

  const socialLinks = [
    { label: "GitHub", href: "https://github.com/one-platform", icon: "🔗", external: true },
    { label: "Twitter", href: "https://twitter.com/oneplatform", icon: "🐦", external: true },
    { label: "Discord", href: "https://discord.gg/oneplatform", icon: "💬", external: true },
  ];

  const allLinks = links.length > 0 ? links : defaultLinks;

  return (
    <footer className={cn("border-t bg-background", className)}>
      <div className="container px-4 py-8">
        {/* Dimensions section */}
        {showDimensions && (
          <>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6 mb-8">
              {(Object.entries(DIMENSIONS) as [Dimension, typeof DIMENSIONS[Dimension]][]).map(
                ([key, dimension]) => (
                  <a
                    key={key}
                    href={`/${key}`}
                    className="group flex flex-col gap-1 rounded-lg border p-3 hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getDimensionIcon(key)}</span>
                      <span className="text-sm font-medium">{dimension.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {dimension.description}
                    </span>
                  </a>
                )
              )}
            </div>
            <Separator className="my-8" />
          </>
        )}

        {/* Links section */}
        <div className="grid gap-8 md:grid-cols-3">
          {/* Platform info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-md bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                ONE
              </div>
              <span className="font-bold">Platform</span>
            </div>
            <p className="text-sm text-muted-foreground">
              AI-native multi-tenant platform built on the 6-dimension ontology.
            </p>
            <div className="flex items-center gap-4">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target={link.external ? "_blank" : undefined}
                  rel={link.external ? "noopener noreferrer" : undefined}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  title={link.label}
                >
                  <span className="text-lg">{link.icon}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Navigation links */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Resources</h3>
            <ul className="space-y-2">
              {allLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target={link.external ? "_blank" : undefined}
                    rel={link.external ? "noopener noreferrer" : undefined}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                    {link.external && (
                      <span className="ml-1 text-xs">↗</span>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Developer info */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Developer</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>API Version: {version}</li>
              <li>
                <a
                  href="https://status.one.ie"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors"
                >
                  System Status
                </a>
              </li>
              <li>
                <a
                  href="/changelog"
                  className="hover:text-foreground transition-colors"
                >
                  Changelog
                </a>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Copyright */}
        <div className="flex flex-col gap-2 text-center md:flex-row md:justify-between md:text-left">
          <p className="text-sm text-muted-foreground">
            © {currentYear} ONE Platform. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            Built with ❤️ using Astro, React, and Convex.
          </p>
        </div>
      </div>
    </footer>
  );
}
