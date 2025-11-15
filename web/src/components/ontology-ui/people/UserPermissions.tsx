/**
 * UserPermissions Component
 *
 * Permission matrix for user access
 * Part of PEOPLE dimension (ontology-ui)
 */

import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import type { Person, Permission } from "../types";
import { getRoleDisplay, getRoleColor, cn } from "../utils";

export interface UserPermissionsProps {
  user: Person;
  permissions: Permission[];
  onPermissionChange?: (resource: string, action: Permission["action"], granted: boolean) => void;
  readOnly?: boolean;
  className?: string;
}

const PERMISSION_ACTIONS: Permission["action"][] = ["create", "read", "update", "delete"];

export function UserPermissions({
  user,
  permissions,
  onPermissionChange,
  readOnly = false,
  className,
}: UserPermissionsProps) {
  // Group permissions by resource
  const permissionsByResource = permissions.reduce((acc, permission) => {
    if (!acc[permission.resource]) {
      acc[permission.resource] = {};
    }
    acc[permission.resource][permission.action] = permission.granted;
    return acc;
  }, {} as Record<string, Record<string, boolean>>);

  const resources = Object.keys(permissionsByResource);

  const handlePermissionToggle = (
    resource: string,
    action: Permission["action"],
    currentValue: boolean
  ) => {
    if (!readOnly && onPermissionChange) {
      onPermissionChange(resource, action, !currentValue);
    }
  };

  const roleColorClass = `bg-${getRoleColor(user.role)}-100 text-${getRoleColor(user.role)}-800 dark:bg-${getRoleColor(user.role)}-900 dark:text-${getRoleColor(user.role)}-300`;

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>User Permissions</CardTitle>
          <Badge className={roleColorClass}>
            {getRoleDisplay(user.role)}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {user.name} ({user.email})
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {resources.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No permissions configured
            </p>
          ) : (
            resources.map((resource) => (
              <div key={resource} className="space-y-3">
                <h4 className="text-sm font-semibold capitalize">
                  {resource.replace(/_/g, " ")}
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {PERMISSION_ACTIONS.map((action) => {
                    const isGranted = permissionsByResource[resource][action] || false;

                    return (
                      <div
                        key={`${resource}-${action}`}
                        className="flex items-center justify-between p-2 rounded-md border bg-muted/50"
                      >
                        <label
                          htmlFor={`${resource}-${action}`}
                          className="text-sm capitalize cursor-pointer flex-1"
                        >
                          {action}
                        </label>
                        <Switch
                          id={`${resource}-${action}`}
                          checked={isGranted}
                          onCheckedChange={() =>
                            handlePermissionToggle(resource, action, isGranted)
                          }
                          disabled={readOnly}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
