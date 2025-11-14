# Mail/Inbox Components

Complete email management UI components built with ontology patterns and Effect.ts integration.

## Components

### InboxLayout (Cycle 83)

3-panel resizable layout for email management.

**Features:**
- Resizable panels with smart defaults
- Mobile-responsive (stacks panels)
- State persistence (localStorage)
- Keyboard navigation (Cmd+B, Cmd+1-3)

**Usage:**
```tsx
import { InboxLayout } from '@/components/ontology-ui/mail';

<InboxLayout
  nav={<MailNav />}
  list={<MailList />}
  detail={<MailDetail />}
  defaultLayout={[20, 32, 48]}
  storageKey="my-inbox"
/>
```

---

### MailNav (Cycle 84)

Folder navigation with drag-drop and context menus.

**Features:**
- Folder navigation (inbox, drafts, sent, archive, trash)
- Label/tag management
- Badge counts per folder
- Drag-drop emails to folders
- Right-click context menus

**Usage:**
```tsx
import { MailNav } from '@/components/ontology-ui/mail';

<MailNav
  activeFolder="inbox"
  onFolderChange={(folder) => setFolder(folder)}
  folderCounts={{ inbox: 42, drafts: 3 }}
  labels={[
    { id: '1', name: 'Work', color: '#ef4444', count: 12 }
  ]}
  onEmailDrop={(folder, ids) => moveEmails(folder, ids)}
/>
```

---

### MailList (Cycle 85)

Virtualized email list with bulk operations.

**Features:**
- Handles 10,000+ emails (virtualized)
- Bulk selection (checkbox mode)
- Starring, archiving, deleting
- Multi-select actions
- Sort by date, sender, subject

**Usage:**
```tsx
import { MailList } from '@/components/ontology-ui/mail';

<MailList
  emails={emails}
  selectedId={selectedId}
  onSelect={setSelectedId}
  allowBulkSelect
  selectedIds={bulkSelected}
  onSelectionChange={setBulkSelected}
  onArchive={(ids) => archiveEmails(ids)}
  onDelete={(ids) => deleteEmails(ids)}
  sortBy="date"
  sortOrder="desc"
/>
```

---

### MailComposer (Cycle 86)

Rich text email composer with advanced features.

**Features:**
- Rich text editor
- To/Cc/Bcc fields with autocomplete
- Attachments with drag-drop
- Draft auto-save (30s default)
- Send later option
- Email templates

**Usage:**
```tsx
import { MailComposer } from '@/components/ontology-ui/mail';

<MailComposer
  asDialog
  open={composerOpen}
  onClose={() => setComposerOpen(false)}
  onSend={(draft) => sendEmail(draft)}
  onSave={(draft) => saveDraft(draft)}
  autoSaveInterval={30000}
/>
```

---

### MailDetail (Cycle 87)

Email detail view with thread support.

**Features:**
- Email detail view
- Thread conversation view
- Quick reply inline
- Action buttons (reply, forward, archive, delete)
- Print/export options
- Expandable thread messages

**Usage:**
```tsx
import { MailDetail } from '@/components/ontology-ui/mail';

<MailDetail
  email={selectedEmail}
  onReply={(email) => compose({ replyTo: email })}
  onArchive={(email) => archive(email)}
  onQuickReply={(email, msg) => sendQuickReply(email, msg)}
  showQuickReply
  showThread
/>
```

---

### MailFilters (Cycle 88)

Advanced email filtering UI.

**Features:**
- Filter by sender, subject, has attachment, date range
- AND/OR matching modes
- Save filters as views
- Smart folders (auto-categorize)
- Date range picker
- Label filtering

**Usage:**
```tsx
import { MailFilters } from '@/components/ontology-ui/mail';

<MailFilters
  asPopover
  rules={filterRules}
  onRulesChange={setFilterRules}
  matchAll={matchAll}
  onMatchModeChange={setMatchAll}
  onFilterSave={(filter) => saveFilter(filter)}
  savedFilters={savedFilters}
  labels={labels}
/>
```

---

### AccountSwitcher (Cycle 89)

Multi-account email management.

**Features:**
- Switch between multiple email accounts
- Visual account selector with avatars
- Badge per account (unread count)
- Quick account add
- Multi-select for unified inbox
- Provider-specific colors (Gmail, Outlook, etc.)

**Usage:**
```tsx
import { AccountSwitcher } from '@/components/ontology-ui/mail';

<AccountSwitcher
  accounts={accounts}
  selectedAccountId={selectedAccount}
  onAccountSelect={setSelectedAccount}
  onAddAccount={() => openAddAccount()}
  showUnreadCount
/>
```

**Unified Inbox (Multi-select):**
```tsx
<AccountSwitcher
  accounts={accounts}
  allowMultiSelect
  selectedAccountIds={selectedAccounts}
  onMultiSelectChange={setSelectedAccounts}
/>
```

---

## Complete Email App Example

```tsx
import {
  InboxLayout,
  MailNav,
  MailList,
  MailDetail,
  MailComposer,
  MailFilters,
  AccountSwitcher,
} from '@/components/ontology-ui/mail';

export function EmailApp() {
  const [folder, setFolder] = useState<MailFolder>('inbox');
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [composerOpen, setComposerOpen] = useState(false);

  return (
    <div className="h-screen">
      <InboxLayout
        nav={
          <div className="flex h-full flex-col">
            <div className="p-4">
              <AccountSwitcher
                accounts={accounts}
                selectedAccountId={account}
                onAccountSelect={setAccount}
              />
            </div>
            <MailNav
              activeFolder={folder}
              onFolderChange={setFolder}
              folderCounts={folderCounts}
              labels={labels}
            />
          </div>
        }
        list={
          <div className="flex h-full flex-col">
            <div className="flex items-center gap-2 p-2 border-b">
              <Button onClick={() => setComposerOpen(true)}>
                Compose
              </Button>
              <MailFilters
                asPopover
                rules={filterRules}
                onRulesChange={setFilterRules}
              />
            </div>
            <MailList
              emails={filteredEmails}
              selectedId={selectedEmail}
              onSelect={setSelectedEmail}
              allowBulkSelect
            />
          </div>
        }
        detail={
          <MailDetail
            email={getEmail(selectedEmail)}
            onReply={(email) => {
              setComposerOpen(true);
              // Pre-fill composer
            }}
            showQuickReply
            showThread
          />
        }
      />

      <MailComposer
        asDialog
        open={composerOpen}
        onClose={() => setComposerOpen(false)}
        onSend={sendEmail}
      />
    </div>
  );
}
```

## Ontology Integration

### Email as Thing

Emails map to the **Things** dimension:

```typescript
{
  type: 'email',
  properties: {
    from: string,
    to: string[],
    subject: string,
    body: string,
    read: boolean,
    starred: boolean,
    labels: string[],
  }
}
```

### Email Actions as Events

Email operations map to **Events**:

- `email_sent` - Email was sent
- `email_received` - Email was received
- `email_read` - Email was marked as read
- `email_starred` - Email was starred
- `email_archived` - Email was archived
- `email_deleted` - Email was deleted

### Folders as Knowledge

Folders and labels map to **Knowledge** dimension:

```typescript
{
  type: 'label',
  properties: {
    name: string,
    color: string,
    icon: string,
  }
}
```

## Effect.ts Integration

### Email Service Example

```typescript
// lib/services/emailService.ts
import { Effect } from 'effect';

export type EmailError =
  | { _tag: 'SendError'; message: string }
  | { _tag: 'AttachmentError'; file: string };

export const sendEmail = (draft: EmailDraft): Effect.Effect<Email, EmailError> =>
  Effect.gen(function* () {
    if (draft.to.length === 0) {
      return yield* Effect.fail({
        _tag: 'SendError',
        message: 'No recipients',
      });
    }

    // Validate attachments
    for (const attachment of draft.attachments) {
      if (attachment.size > 25 * 1024 * 1024) {
        return yield* Effect.fail({
          _tag: 'AttachmentError',
          file: attachment.name,
        });
      }
    }

    // Send via API
    const response = yield* Effect.tryPromise({
      try: () => fetch('/api/email/send', {
        method: 'POST',
        body: JSON.stringify(draft),
      }),
      catch: (error) => ({
        _tag: 'SendError' as const,
        message: String(error),
      }),
    });

    return yield* Effect.promise(() => response.json());
  });
```

## Performance Optimization

### Virtualization

MailList uses virtualization for large datasets:

```tsx
// Handles 10,000+ emails efficiently
<MailList
  emails={largeEmailList}
  virtualized // Enable virtual scrolling
  compact // Reduce padding for more items
/>
```

### Lazy Loading

Load email body only when viewing:

```tsx
<MailDetail
  email={email}
  onOpen={async (id) => {
    // Lazy load full email body
    const fullEmail = await fetchFullEmail(id);
    setEmail(fullEmail);
  }}
/>
```

### Draft Auto-save

Composer auto-saves drafts with configurable interval:

```tsx
<MailComposer
  autoSaveInterval={30000} // 30 seconds
  onSave={(draft) => saveDraft(draft)}
/>
```

## Keyboard Shortcuts

### Layout
- `Cmd/Ctrl + B` - Toggle navigation panel
- `Cmd/Ctrl + 1` - Focus navigation
- `Cmd/Ctrl + 2` - Focus email list
- `Cmd/Ctrl + 3` - Focus detail view

### Composer
- `Cmd/Ctrl + Enter` - Send email
- `Cmd/Ctrl + K` - Add link
- `Cmd/Ctrl + B` - Bold text
- `Cmd/Ctrl + I` - Italic text

### List
- `j` - Next email
- `k` - Previous email
- `Enter` - Open email
- `r` - Reply
- `f` - Forward
- `a` - Archive
- `#` - Delete

## Accessibility

All components follow WCAG 2.1 AA standards:

- Keyboard navigation support
- ARIA labels and roles
- Screen reader compatible
- Focus management
- High contrast support

## Mobile Responsive

Layout adapts automatically:

- Desktop: 3-panel resizable layout
- Tablet: 2-panel layout (nav + list/detail)
- Mobile: Single panel stack (nav → list → detail)

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

MIT
