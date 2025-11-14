/**
 * UserInvite Component
 *
 * Form for inviting new users with email validation
 * Part of PEOPLE dimension (ontology-ui)
 */

import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserRoleSelector } from "./UserRoleSelector";
import type { UserRole, FormProps } from "../types";
import { isValidEmail, cn } from "../utils";

export interface UserInviteProps extends FormProps {
  onInvite?: (emails: string[], role: UserRole) => void;
  onCancel?: () => void;
  maxInvites?: number;
  defaultRole?: UserRole;
}

export function UserInvite({
  onInvite,
  onCancel,
  maxInvites = 10,
  defaultRole = "org_user",
  className,
}: UserInviteProps) {
  const [emailInput, setEmailInput] = useState("");
  const [emails, setEmails] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState<UserRole>(defaultRole);
  const [error, setError] = useState<string | null>(null);

  const handleAddEmail = () => {
    const email = emailInput.trim();

    // Validate email
    if (!email) {
      setError("Please enter an email address");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    // Check for duplicates
    if (emails.includes(email)) {
      setError("This email has already been added");
      return;
    }

    // Check max invites
    if (emails.length >= maxInvites) {
      setError(`Maximum ${maxInvites} invites allowed`);
      return;
    }

    // Add email
    setEmails([...emails, email]);
    setEmailInput("");
    setError(null);
  };

  const handleRemoveEmail = (emailToRemove: string) => {
    setEmails(emails.filter((email) => email !== emailToRemove));
    setError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddEmail();
    }
  };

  const handleSubmit = () => {
    if (emails.length === 0) {
      setError("Please add at least one email address");
      return;
    }

    onInvite?.(emails, selectedRole);
    // Reset form
    setEmails([]);
    setEmailInput("");
    setSelectedRole(defaultRole);
    setError(null);
  };

  const handleCancel = () => {
    setEmails([]);
    setEmailInput("");
    setSelectedRole(defaultRole);
    setError(null);
    onCancel?.();
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle>Invite Users</CardTitle>
        <CardDescription>
          Send invitations to new users to join your organization
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Email Input */}
        <div className="space-y-2">
          <Label htmlFor="email-input">Email Addresses</Label>
          <div className="flex gap-2">
            <Input
              id="email-input"
              type="email"
              placeholder="Enter email address"
              value={emailInput}
              onChange={(e) => {
                setEmailInput(e.target.value);
                setError(null);
              }}
              onKeyDown={handleKeyDown}
              className="flex-1"
            />
            <Button onClick={handleAddEmail} variant="outline" type="button">
              Add
            </Button>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        {/* Email List */}
        {emails.length > 0 && (
          <div className="space-y-2">
            <Label>Added Emails ({emails.length})</Label>
            <div className="flex flex-wrap gap-2">
              {emails.map((email) => (
                <Badge key={email} variant="secondary" className="text-sm">
                  {email}
                  <button
                    onClick={() => handleRemoveEmail(email)}
                    className="ml-2 hover:text-destructive"
                    aria-label={`Remove ${email}`}
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Role Selection */}
        <UserRoleSelector
          value={selectedRole}
          onChange={setSelectedRole}
          excludeRoles={["platform_owner"]} // Platform owner can only be assigned manually
        />

        {/* Helper Text */}
        <p className="text-sm text-muted-foreground">
          Invitation emails will be sent to all addresses with the selected role.
        </p>
      </CardContent>

      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" onClick={handleCancel} type="button">
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={emails.length === 0} type="button">
          Send {emails.length > 0 ? `${emails.length} ` : ""}
          Invite{emails.length !== 1 ? "s" : ""}
        </Button>
      </CardFooter>
    </Card>
  );
}
