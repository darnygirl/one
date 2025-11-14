/**
 * GroupInvite Component
 *
 * Invite form for adding members
 * Part of GROUPS dimension (ontology-ui)
 */

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { UserRole } from "../types";
import { cn, isValidEmail, getRoleDisplay } from "../utils";

export interface GroupInviteProps {
  groupName: string;
  onInvite?: (emails: string[], role: UserRole) => void;
  onCancel?: () => void;
  className?: string;
}

export function GroupInvite({
  groupName,
  onInvite,
  onCancel,
  className,
}: GroupInviteProps) {
  const [email, setEmail] = useState("");
  const [emails, setEmails] = useState<string[]>([]);
  const [role, setRole] = useState<UserRole>("org_user");

  const handleAddEmail = () => {
    if (email && isValidEmail(email) && !emails.includes(email)) {
      setEmails([...emails, email]);
      setEmail("");
    }
  };

  const handleRemoveEmail = (emailToRemove: string) => {
    setEmails(emails.filter((e) => e !== emailToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (emails.length > 0) {
      onInvite?.(emails, role);
    }
  };

  const isValidNewEmail = email && isValidEmail(email) && !emails.includes(email);

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>✉️</span>
          Invite to {groupName}
        </CardTitle>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="flex gap-2">
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (isValidNewEmail) handleAddEmail();
                  }
                }}
              />
              <Button
                type="button"
                onClick={handleAddEmail}
                disabled={!isValidNewEmail}
              >
                Add
              </Button>
            </div>
          </div>

          {emails.length > 0 && (
            <div className="space-y-2">
              <Label>Invited ({emails.length})</Label>
              <div className="flex flex-wrap gap-2">
                {emails.map((email) => (
                  <Badge
                    key={email}
                    variant="secondary"
                    className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => handleRemoveEmail(email)}
                  >
                    {email} ×
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="org_owner">{getRoleDisplay("org_owner")}</SelectItem>
                <SelectItem value="org_user">{getRoleDisplay("org_user")}</SelectItem>
                <SelectItem value="customer">{getRoleDisplay("customer")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>

        <CardFooter className="flex justify-end gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={emails.length === 0}>
            Send {emails.length} Invite{emails.length !== 1 ? "s" : ""}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
