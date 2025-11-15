/**
 * GroupPermissions Component
 *
 * Permission matrix for group access
 * Part of GROUPS dimension (ontology-ui)
 */

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import type { UserRole, Permission } from "../types";
import { cn, getRoleDisplay } from "../utils";

export interface GroupPermissionsProps {
  permissions: Record<UserRole, Permission[]>;
  onPermissionChange?: (role: UserRole, permission: Permission) => void;
  readOnly?: boolean;
  className?: string;
}

export function GroupPermissions({
  permissions,
  onPermissionChange,
  readOnly = false,
  className,
}: GroupPermissionsProps) {
  const resources = Array.from(
    new Set(
      Object.values(permissions).flatMap((perms) => perms.map((p) => p.resource))
    )
  );

  const actions: Permission["action"][] = ["create", "read", "update", "delete"];

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>🔒</span>
          Group Permissions
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Control what each role can do
        </p>
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          {Object.entries(permissions).map(([role, perms]) => (
            <div key={role} className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge>{getRoleDisplay(role as UserRole)}</Badge>
                <span className="text-sm text-muted-foreground">
                  {perms.filter((p) => p.granted).length} permissions granted
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2 text-xs">
                <div className="font-medium">Resource</div>
                {actions.map((action) => (
                  <div key={action} className="font-medium text-center capitalize">
                    {action}
                  </div>
                ))}

                {resources.map((resource) => (
                  <React.Fragment key={resource}>
                    <div className="py-2 capitalize">{resource}</div>
                    {actions.map((action) => {
                      const permission = perms.find(
                        (p) => p.resource === resource && p.action === action
                      );
                      return (
                        <div key={action} className="flex justify-center py-2">
                          <Switch
                            checked={permission?.granted || false}
                            onCheckedChange={(granted) => {
                              if (!readOnly && permission) {
                                onPermissionChange?.(role as UserRole, {
                                  ...permission,
                                  granted,
                                });
                              }
                            }}
                            disabled={readOnly}
                          />
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
