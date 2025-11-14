# PEOPLE Dimension Components

**Created: 3 new components for user management and permissions**

## Components

### 1. UserRoleSelector.tsx
Dropdown component for selecting user roles with type-safe role values.

**Props:**
- `value?: UserRole` - Currently selected role
- `onChange?: (role: UserRole) => void` - Callback when role changes
- `disabled?: boolean` - Disable the selector
- `placeholder?: string` - Placeholder text (default: "Select a role...")
- `className?: string` - Additional CSS classes

**Features:**
- Four role options: platform_owner, org_owner, org_user, customer
- Uses `getRoleDisplay()` utility for human-readable labels
- Type-safe with UserRole type guard
- Built with shadcn/ui Select component

**Usage:**
```tsx
import { UserRoleSelector } from '@/components/ontology-ui/people';

function RoleManager() {
  const [role, setRole] = useState<UserRole>('org_user');

  return (
    <UserRoleSelector
      value={role}
      onChange={setRole}
      placeholder="Choose a role..."
    />
  );
}
```

---

### 2. UserPermissions.tsx
Permission matrix component displaying user access rights with toggleable permissions.

**Props:**
- `user: Person` - The user object with role and details
- `permissions: Permission[]` - Array of permission objects
- `onPermissionChange?: (resource: string, action: Permission["action"], granted: boolean) => void` - Callback when permission toggled
- `readOnly?: boolean` - Disable permission editing (default: false)
- `className?: string` - Additional CSS classes

**Features:**
- Groups permissions by resource
- Grid layout showing CRUD actions (create, read, update, delete)
- Switch toggles for each permission
- Displays user role badge with color coding
- Shows user name and email
- Read-only mode for viewing only

**Usage:**
```tsx
import { UserPermissions } from '@/components/ontology-ui/people';

function PermissionsManager({ user, permissions }: Props) {
  const handlePermissionChange = (resource: string, action: string, granted: boolean) => {
    // Update permission logic
    console.log(`${resource}.${action} = ${granted}`);
  };

  return (
    <UserPermissions
      user={user}
      permissions={permissions}
      onPermissionChange={handlePermissionChange}
    />
  );
}
```

**Permission Structure:**
```typescript
const permissions: Permission[] = [
  { resource: "products", action: "create", granted: true },
  { resource: "products", action: "read", granted: true },
  { resource: "products", action: "update", granted: false },
  { resource: "products", action: "delete", granted: false },
];
```

---

### 3. UserActivity.tsx
Activity feed component showing user actions in a timeline format.

**Props:**
- `user: Person` - The user whose activity to display
- `events: Event[]` - Array of event objects
- `maxItems?: number` - Maximum events to display (default: 10)
- `className?: string` - Additional CSS classes

**Features:**
- Timeline layout with event icons
- Color-coded event types
- Relative timestamps ("2h ago", "3d ago")
- Expandable event details
- Shows remaining event count if truncated
- Event type badges with proper formatting

**Usage:**
```tsx
import { UserActivity } from '@/components/ontology-ui/people';

function ActivityFeed({ user, events }: Props) {
  return (
    <UserActivity
      user={user}
      events={events}
      maxItems={20}
    />
  );
}
```

**Event Icons:**
- Created: ✨
- Updated: 🔄
- Deleted: 🗑️
- Purchased: 💳
- Completed: ✅
- Enrolled: 📚
- Logged in: 🔐
- And more...

---

## Importing Components

**Import individual components:**
```tsx
import { UserRoleSelector } from '@/components/ontology-ui/people';
import { UserPermissions } from '@/components/ontology-ui/people';
import { UserActivity } from '@/components/ontology-ui/people';
```

**Import with types:**
```tsx
import {
  UserRoleSelector,
  UserPermissions,
  UserActivity,
  type UserRoleSelectorProps,
  type UserPermissionsProps,
  type UserActivityProps,
} from '@/components/ontology-ui/people';
```

---

## Dependencies

All components use:
- **shadcn/ui** components (Card, Select, Badge, Switch)
- **Ontology types** (Person, UserRole, Permission, Event)
- **Utility functions** (getRoleDisplay, formatRelativeTime, getEventTypeDisplay)

---

## Type Safety

All components are fully typed with TypeScript:
- Props interfaces exported for reuse
- Type guards for runtime validation
- Proper typing for callbacks and event handlers

---

## Design Patterns

**Follows ontology-ui library patterns:**
1. TSX components (React with TypeScript)
2. shadcn/ui for UI primitives
3. Proper exports with named exports
4. Comprehensive prop interfaces
5. Production-ready with error handling
6. Accessible and responsive design

---

## Testing

**Example test setup:**
```tsx
import { render, screen } from '@testing-library/react';
import { UserRoleSelector } from '@/components/ontology-ui/people';

test('renders role selector', () => {
  render(<UserRoleSelector />);
  expect(screen.getByRole('combobox')).toBeInTheDocument();
});
```

---

**All components are production-ready and follow best practices!**
