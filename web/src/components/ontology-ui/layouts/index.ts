/**
 * LAYOUT Components
 *
 * Navigation and layout components for ontology-aware apps.
 * Complete set of 8 layout components (#93-100).
 */

// #93 - Navigation with dimension switching
export { OntologyNav } from "./OntologyNav";

// #94 - Switch between 6 dimensions
export { DimensionSwitcher } from "./DimensionSwitcher";

// #95 - Multi-level breadcrumb
export { OntologyBreadcrumb } from "./OntologyBreadcrumb";
export type { BreadcrumbItem } from "./OntologyBreadcrumb";

// #96 - Sidebar with dimension navigation
export { OntologySidebar } from "./OntologySidebar";

// #97 - Header with group/user context
export { OntologyHeader } from "./OntologyHeader";
export type { OntologyHeaderProps } from "./OntologyHeader";

// #98 - Footer with platform info
export { OntologyFooter } from "./OntologyFooter";
export type { FooterLink } from "./OntologyFooter";

// #99 - Quick command/search palette
export { CommandPalette } from "./CommandPalette";
export type { CommandPaletteProps } from "./CommandPalette";

// #100 - Quick switcher for entities
export { QuickSwitcher } from "./QuickSwitcher";
export type { QuickSwitcherProps } from "./QuickSwitcher";
