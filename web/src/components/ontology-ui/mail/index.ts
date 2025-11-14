/**
 * Mail/Inbox Components (Phase 4)
 *
 * Complete email management UI with ontology integration
 *
 * Cycles 83-89:
 * - InboxLayout: 3-panel resizable layout
 * - MailNav: Folder navigation with drag-drop
 * - MailList: Virtualized email list with bulk operations
 * - MailComposer: Rich text composer with attachments
 * - MailDetail: Email detail view with threads
 * - MailFilters: Advanced filtering UI
 * - AccountSwitcher: Multi-account management
 */

export { InboxLayout } from "./InboxLayout";
export type { InboxLayoutProps } from "./InboxLayout";

export { MailNav } from "./MailNav";
export type { MailNavProps, NavLink, Label, MailFolder } from "./MailNav";

export { MailList } from "./MailList";
export type {
  MailListProps,
  Email,
  SortField,
  SortOrder,
} from "./MailList";

export { MailComposer } from "./MailComposer";
export type {
  MailComposerProps,
  EmailRecipient,
  EmailAttachment,
  EmailDraft,
} from "./MailComposer";

export { MailDetail } from "./MailDetail";
export type { MailDetailProps, EmailThread } from "./MailDetail";

export { MailFilters } from "./MailFilters";
export type {
  MailFiltersProps,
  FilterRule,
  FilterOperator,
  SavedFilter,
} from "./MailFilters";

export { AccountSwitcher } from "./AccountSwitcher";
export type { AccountSwitcherProps, EmailAccount } from "./AccountSwitcher";
