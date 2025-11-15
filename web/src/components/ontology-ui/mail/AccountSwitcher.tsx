/**
 * AccountSwitcher Component (Cycle 89)
 *
 * Multi-account email switcher
 *
 * Features:
 * - Switch between multiple email accounts
 * - Visual account selector
 * - Badge per account (unread count)
 * - Quick account add
 */

"use client";

import * as React from "react";
import { ChevronsUpDown, Plus, Check, Mail, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export interface EmailAccount {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  provider?: "gmail" | "outlook" | "imap" | "other";
  unreadCount?: number;
  color?: string;
}

interface AccountSwitcherProps {
  /** Available email accounts */
  accounts: EmailAccount[];
  /** Currently selected account ID */
  selectedAccountId?: string;
  /** Callback when account is selected */
  onAccountSelect?: (accountId: string) => void;
  /** Callback when add account is clicked */
  onAddAccount?: () => void;
  /** Callback when account settings is clicked */
  onAccountSettings?: (accountId: string) => void;
  /** Show account in collapsed mode */
  isCollapsed?: boolean;
  /** Show unread counts */
  showUnreadCount?: boolean;
  /** Allow multiple account selection (for unified inbox) */
  allowMultiSelect?: boolean;
  /** Selected account IDs (for multi-select) */
  selectedAccountIds?: string[];
  /** Callback when multi-selection changes */
  onMultiSelectChange?: (accountIds: string[]) => void;
}

export function AccountSwitcher({
  accounts,
  selectedAccountId,
  onAccountSelect,
  onAddAccount,
  onAccountSettings,
  isCollapsed = false,
  showUnreadCount = true,
  allowMultiSelect = false,
  selectedAccountIds = [],
  onMultiSelectChange,
}: AccountSwitcherProps) {
  const [open, setOpen] = React.useState(false);

  // Get current account
  const selectedAccount = accounts.find((a) => a.id === selectedAccountId);

  // Toggle account in multi-select
  const toggleAccount = (accountId: string) => {
    if (!allowMultiSelect) {
      onAccountSelect?.(accountId);
      setOpen(false);
      return;
    }

    const newSelection = selectedAccountIds.includes(accountId)
      ? selectedAccountIds.filter((id) => id !== accountId)
      : [...selectedAccountIds, accountId];

    onMultiSelectChange?.(newSelection);
  };

  // Get total unread across all accounts
  const totalUnread = React.useMemo(() => {
    return accounts.reduce((sum, account) => sum + (account.unreadCount || 0), 0);
  }, [accounts]);

  // Get provider icon/color
  const getProviderColor = (provider?: string) => {
    switch (provider) {
      case "gmail":
        return "bg-red-500";
      case "outlook":
        return "bg-blue-500";
      case "imap":
        return "bg-gray-500";
      default:
        return "bg-primary";
    }
  };

  // Collapsed view (icon only)
  if (isCollapsed) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            aria-label="Select account"
          >
            {selectedAccount?.avatar ? (
              <Avatar className="size-8">
                <AvatarImage src={selectedAccount.avatar} alt={selectedAccount.email} />
                <AvatarFallback>
                  {selectedAccount.email.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ) : (
              <Mail className="size-4" />
            )}
            {showUnreadCount && totalUnread > 0 && (
              <Badge
                variant="destructive"
                className="absolute -right-1 -top-1 size-5 rounded-full p-0 text-xs"
              >
                {totalUnread > 99 ? "99+" : totalUnread}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-0" align="start" side="right">
          {renderAccountList()}
        </PopoverContent>
      </Popover>
    );
  }

  // Expanded view
  const renderAccountList = () => (
    <Command>
      <CommandInput placeholder="Search accounts..." />
      <CommandList>
        <CommandEmpty>No accounts found.</CommandEmpty>
        <CommandGroup heading="Accounts">
          {accounts.map((account) => {
            const isSelected = allowMultiSelect
              ? selectedAccountIds.includes(account.id)
              : selectedAccountId === account.id;

            return (
              <CommandItem
                key={account.id}
                onSelect={() => toggleAccount(account.id)}
                className="flex items-center gap-2"
              >
                {allowMultiSelect && (
                  <div
                    className={cn(
                      "flex size-4 items-center justify-center rounded border",
                      isSelected && "bg-primary border-primary"
                    )}
                  >
                    {isSelected && <Check className="size-3 text-primary-foreground" />}
                  </div>
                )}

                <div
                  className={cn(
                    "size-2 rounded-full",
                    getProviderColor(account.provider)
                  )}
                />

                {account.avatar ? (
                  <Avatar className="size-6">
                    <AvatarImage src={account.avatar} alt={account.email} />
                    <AvatarFallback className="text-xs">
                      {account.email.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="flex size-6 items-center justify-center rounded-full bg-muted">
                    <span className="text-xs font-medium">
                      {account.email.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}

                <div className="flex flex-1 flex-col">
                  <span className="text-sm font-medium">
                    {account.name || account.email}
                  </span>
                  {account.name && (
                    <span className="text-xs text-muted-foreground">
                      {account.email}
                    </span>
                  )}
                </div>

                {showUnreadCount && account.unreadCount && account.unreadCount > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {account.unreadCount}
                  </Badge>
                )}

                {!allowMultiSelect && isSelected && (
                  <Check className="size-4 text-primary" />
                )}

                {onAccountSettings && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-6 opacity-0 group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAccountSettings(account.id);
                    }}
                  >
                    <Settings className="size-3" />
                  </Button>
                )}
              </CommandItem>
            );
          })}
        </CommandGroup>

        {onAddAccount && (
          <>
            <CommandSeparator />
            <CommandGroup>
              <CommandItem onSelect={onAddAccount}>
                <Plus className="mr-2 size-4" />
                Add account
              </CommandItem>
            </CommandGroup>
          </>
        )}
      </CommandList>
    </Command>
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="Select account"
          className={cn(
            "w-full justify-between",
            !selectedAccount && "text-muted-foreground"
          )}
        >
          <div className="flex items-center gap-2 overflow-hidden">
            {selectedAccount ? (
              <>
                <div
                  className={cn(
                    "size-2 rounded-full flex-shrink-0",
                    getProviderColor(selectedAccount.provider)
                  )}
                />
                {selectedAccount.avatar ? (
                  <Avatar className="size-6 flex-shrink-0">
                    <AvatarImage
                      src={selectedAccount.avatar}
                      alt={selectedAccount.email}
                    />
                    <AvatarFallback className="text-xs">
                      {selectedAccount.email.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="flex size-6 flex-shrink-0 items-center justify-center rounded-full bg-muted">
                    <span className="text-xs font-medium">
                      {selectedAccount.email.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="flex flex-col items-start overflow-hidden">
                  <span className="text-sm font-medium truncate">
                    {selectedAccount.name || selectedAccount.email}
                  </span>
                  {selectedAccount.name && (
                    <span className="text-xs text-muted-foreground truncate">
                      {selectedAccount.email}
                    </span>
                  )}
                </div>
              </>
            ) : (
              <>
                <Mail className="size-4 flex-shrink-0" />
                <span>Select account</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {showUnreadCount &&
              selectedAccount?.unreadCount &&
              selectedAccount.unreadCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {selectedAccount.unreadCount}
                </Badge>
              )}
            <ChevronsUpDown className="size-4 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        {renderAccountList()}
      </PopoverContent>
    </Popover>
  );
}

/**
 * Usage Example:
 *
 * ```tsx
 * import { AccountSwitcher } from '@/components/ontology-ui/mail/AccountSwitcher';
 *
 * export function EmailHeader() {
 *   const [selectedAccount, setSelectedAccount] = useState('account-1');
 *
 *   const accounts = [
 *     {
 *       id: 'account-1',
 *       email: 'work@example.com',
 *       name: 'Work Email',
 *       provider: 'gmail',
 *       unreadCount: 12,
 *     },
 *     {
 *       id: 'account-2',
 *       email: 'personal@example.com',
 *       name: 'Personal',
 *       provider: 'outlook',
 *       unreadCount: 5,
 *     },
 *   ];
 *
 *   return (
 *     <AccountSwitcher
 *       accounts={accounts}
 *       selectedAccountId={selectedAccount}
 *       onAccountSelect={setSelectedAccount}
 *       onAddAccount={() => console.log('Add account')}
 *       showUnreadCount
 *     />
 *   );
 * }
 * ```
 *
 * Multi-select Example (Unified Inbox):
 *
 * ```tsx
 * const [selectedAccounts, setSelectedAccounts] = useState(['account-1', 'account-2']);
 *
 * return (
 *   <AccountSwitcher
 *     accounts={accounts}
 *     allowMultiSelect
 *     selectedAccountIds={selectedAccounts}
 *     onMultiSelectChange={setSelectedAccounts}
 *   />
 * );
 * ```
 */
