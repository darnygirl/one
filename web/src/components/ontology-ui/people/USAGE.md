# PEOPLE Dimension Components - Usage Guide

## Overview

Three production-ready components for the PEOPLE dimension of the ontology-ui library.

## Components

### 1. UserAvatar

Avatar component with status indicator.

```tsx
import { UserAvatar } from "@/components/ontology-ui/people";

// Basic usage
<UserAvatar user={person} />

// With size variants
<UserAvatar user={person} size="sm" />  // 6x6
<UserAvatar user={person} size="md" />  // 10x10 (default)
<UserAvatar user={person} size="lg" />  // 16x16

// With status indicator
<UserAvatar 
  user={person} 
  showStatus={true}
  status="online"  // "online" | "offline" | "away"
/>
```

**Features:**
- Three size variants (sm, md, lg)
- Status indicator (online/offline/away)
- Automatic fallback to initials
- Proper accessibility labels

---

### 2. UserList

Scrollable list of users with filtering, search, sort, and pagination.

```tsx
import { UserList } from "@/components/ontology-ui/people";

// Basic usage
<UserList users={people} />

// With all features
<UserList
  users={people}
  onUserClick={(user) => console.log(user)}
  searchable={true}
  sortable={true}
  paginated={true}
  pageSize={10}
/>

// Minimal (no features)
<UserList
  users={people}
  searchable={false}
  sortable={false}
  paginated={false}
/>
```

**Features:**
- Search by name or email
- Sort by name or joined date
- Pagination with page controls
- Responsive design
- Empty state handling
- Uses UserCard for each user

---

### 3. UserProfile

Full user profile display with tabs (Overview, Activity, Settings).

```tsx
import { UserProfile } from "@/components/ontology-ui/people";

// Basic usage
<UserProfile user={person} />

// Customized
<UserProfile
  user={person}
  showActivity={true}
  showStats={true}
/>
```

**Features:**
- Three tabs: Overview, Activity, Settings
- Display stats (role, type, last active, member since)
- User information grid
- Metadata support (bio, location, website)
- Responsive layout

---

## Example: Complete User Management Page

```tsx
import { UserList, UserProfile, UserAvatar } from "@/components/ontology-ui/people";
import type { Person } from "@/components/ontology-ui/types";
import { useState } from "react";

export function UserManagementPage({ users }: { users: Person[] }) {
  const [selectedUser, setSelectedUser] = useState<Person | null>(null);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: User List */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Team Members</h2>
        <UserList
          users={users}
          onUserClick={setSelectedUser}
          searchable={true}
          sortable={true}
          paginated={true}
          pageSize={10}
        />
      </div>

      {/* Right: User Profile */}
      <div>
        {selectedUser ? (
          <UserProfile
            user={selectedUser}
            showActivity={true}
            showStats={true}
          />
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>Select a user to view their profile</p>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## Type Reference

```tsx
import type { Person, UserRole } from "@/components/ontology-ui/types";

// Person type
interface Person {
  _id: Id<"things">;
  type: "creator" | "user";
  name: string;
  email?: string;
  avatar?: string;
  role: UserRole;
  groupId: Id<"groups">;
  metadata?: Record<string, any>;
  createdAt: number;
  updatedAt?: number;
}

// UserRole type
type UserRole = "platform_owner" | "org_owner" | "org_user" | "customer";
```

---

## Best Practices

1. **Always provide user data** - All components require a `Person` object
2. **Use UserCard for lists** - UserList automatically uses UserCard
3. **Enable features as needed** - Disable search/sort/pagination if not needed
4. **Handle click events** - Use `onUserClick` for navigation
5. **Customize with className** - All components accept className prop

---

## Integration with Existing Components

These components work seamlessly with:
- `UserCard` - Used internally by UserList
- `RoleBadge` - For role display
- `UserActivity` - Can be integrated into UserProfile tabs
- `UserPermissions` - Can be integrated into UserProfile settings

---

## Production Readiness

All components are:
- ✅ Fully typed with TypeScript
- ✅ Using shadcn/ui primitives
- ✅ Responsive and mobile-friendly
- ✅ Accessible (ARIA labels, keyboard navigation)
- ✅ Following ontology-ui patterns
- ✅ Dark mode compatible
- ✅ Performance optimized

---

Created for the ONE Platform ontology-ui component library.
