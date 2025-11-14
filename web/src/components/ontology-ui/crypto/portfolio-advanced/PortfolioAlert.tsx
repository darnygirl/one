/**
 * PortfolioAlert - Price alerts and notifications
 *
 * Features:
 * - Create price alerts
 * - Alert conditions (above/below/%)
 * - Email/push notifications
 * - Alert history
 * - Snooze/dismiss alerts
 * - Alert management dashboard
 */

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Bell, BellOff, Trash2, Clock, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type AlertCondition = "above" | "below" | "percent_up" | "percent_down";
export type AlertStatus = "active" | "triggered" | "snoozed" | "dismissed";

export interface PriceAlert {
  id: string;
  symbol: string;
  condition: AlertCondition;
  targetValue: number;
  currentPrice: number;
  status: AlertStatus;
  createdAt: number;
  triggeredAt?: number;
  notifyEmail?: boolean;
  notifyPush?: boolean;
  snoozeUntil?: number;
}

interface PortfolioAlertProps {
  tokens: Array<{ symbol: string; name: string; currentPrice: number }>;
  alerts: PriceAlert[];
  className?: string;
  onCreateAlert?: (alert: Omit<PriceAlert, "id" | "createdAt">) => void;
  onDeleteAlert?: (alertId: string) => void;
  onSnoozeAlert?: (alertId: string, duration: number) => void;
  onDismissAlert?: (alertId: string) => void;
}

export function PortfolioAlert({
  tokens,
  alerts: initialAlerts,
  className,
  onCreateAlert,
  onDeleteAlert,
  onSnoozeAlert,
  onDismissAlert,
}: PortfolioAlertProps) {
  const [alerts, setAlerts] = useState<PriceAlert[]>(initialAlerts);
  const [isCreating, setIsCreating] = useState(false);
  const [newAlert, setNewAlert] = useState({
    symbol: tokens[0]?.symbol || "",
    condition: "above" as AlertCondition,
    targetValue: 0,
    notifyEmail: true,
    notifyPush: true,
  });

  const handleCreateAlert = () => {
    const token = tokens.find((t) => t.symbol === newAlert.symbol);
    if (!token) return;

    const alert: Omit<PriceAlert, "id" | "createdAt"> = {
      symbol: newAlert.symbol,
      condition: newAlert.condition,
      targetValue: newAlert.targetValue,
      currentPrice: token.currentPrice,
      status: "active",
      notifyEmail: newAlert.notifyEmail,
      notifyPush: newAlert.notifyPush,
    };

    if (onCreateAlert) {
      onCreateAlert(alert);
    }

    // Add to local state
    const fullAlert: PriceAlert = {
      ...alert,
      id: Math.random().toString(36).substring(7),
      createdAt: Date.now(),
    };
    setAlerts((prev) => [fullAlert, ...prev]);

    // Reset form
    setNewAlert({
      symbol: tokens[0]?.symbol || "",
      condition: "above",
      targetValue: 0,
      notifyEmail: true,
      notifyPush: true,
    });
    setIsCreating(false);
  };

  const handleDeleteAlert = (alertId: string) => {
    if (onDeleteAlert) {
      onDeleteAlert(alertId);
    }
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
  };

  const handleSnoozeAlert = (alertId: string, hours: number) => {
    const duration = hours * 3600000; // Convert to milliseconds
    if (onSnoozeAlert) {
      onSnoozeAlert(alertId, duration);
    }
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === alertId
          ? { ...a, status: "snoozed" as AlertStatus, snoozeUntil: Date.now() + duration }
          : a
      )
    );
  };

  const handleDismissAlert = (alertId: string) => {
    if (onDismissAlert) {
      onDismissAlert(alertId);
    }
    setAlerts((prev) => prev.map((a) => (a.id === alertId ? { ...a, status: "dismissed" as AlertStatus } : a)));
  };

  const getConditionLabel = (condition: AlertCondition) => {
    const labels: Record<AlertCondition, string> = {
      above: "Above",
      below: "Below",
      percent_up: "% Up",
      percent_down: "% Down",
    };
    return labels[condition];
  };

  const getStatusColor = (status: AlertStatus) => {
    const colors: Record<AlertStatus, string> = {
      active: "bg-blue-100 text-blue-800",
      triggered: "bg-green-100 text-green-800",
      snoozed: "bg-yellow-100 text-yellow-800",
      dismissed: "bg-gray-100 text-gray-800",
    };
    return colors[status];
  };

  const activeAlerts = alerts.filter((a) => a.status === "active");
  const triggeredAlerts = alerts.filter((a) => a.status === "triggered");

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Price Alerts</CardTitle>
            <CardDescription>Get notified when prices hit your targets</CardDescription>
          </div>
          <Button
            variant={isCreating ? "ghost" : "default"}
            size="sm"
            onClick={() => setIsCreating(!isCreating)}
          >
            {isCreating ? "Cancel" : "+ New Alert"}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Create Alert Form */}
        {isCreating && (
          <div className="p-4 rounded-lg border bg-muted/50 space-y-4">
            <h3 className="font-medium">Create New Alert</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Token</Label>
                <Select value={newAlert.symbol} onValueChange={(v) => setNewAlert({ ...newAlert, symbol: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tokens.map((token) => (
                      <SelectItem key={token.symbol} value={token.symbol}>
                        {token.symbol} - ${token.currentPrice.toLocaleString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Condition</Label>
                <Select
                  value={newAlert.condition}
                  onValueChange={(v: AlertCondition) => setNewAlert({ ...newAlert, condition: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="above">Price Goes Above</SelectItem>
                    <SelectItem value="below">Price Goes Below</SelectItem>
                    <SelectItem value="percent_up">Increases by %</SelectItem>
                    <SelectItem value="percent_down">Decreases by %</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>
                Target {newAlert.condition.includes("percent") ? "Percentage" : "Price"}
              </Label>
              <Input
                type="number"
                value={newAlert.targetValue}
                onChange={(e) => setNewAlert({ ...newAlert, targetValue: parseFloat(e.target.value) })}
                placeholder={newAlert.condition.includes("percent") ? "e.g., 10" : "e.g., 50000"}
              />
            </div>

            <div className="space-y-3">
              <Label>Notifications</Label>
              <div className="flex items-center justify-between">
                <span className="text-sm">Email notification</span>
                <Switch
                  checked={newAlert.notifyEmail}
                  onCheckedChange={(checked) => setNewAlert({ ...newAlert, notifyEmail: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Push notification</span>
                <Switch
                  checked={newAlert.notifyPush}
                  onCheckedChange={(checked) => setNewAlert({ ...newAlert, notifyPush: checked })}
                />
              </div>
            </div>

            <Button className="w-full" onClick={handleCreateAlert}>
              Create Alert
            </Button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg border bg-card">
            <div className="flex items-center gap-2 mb-1">
              <Bell className="h-4 w-4 text-blue-500" />
              <p className="text-sm text-muted-foreground">Active Alerts</p>
            </div>
            <p className="text-2xl font-bold">{activeAlerts.length}</p>
          </div>
          <div className="p-4 rounded-lg border bg-card">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <p className="text-sm text-muted-foreground">Triggered</p>
            </div>
            <p className="text-2xl font-bold">{triggeredAlerts.length}</p>
          </div>
        </div>

        {/* Alert List */}
        <div className="space-y-3">
          <h3 className="font-medium">All Alerts ({alerts.length})</h3>
          {alerts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BellOff className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No alerts created yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {alerts.map((alert) => (
                <div key={alert.id} className="p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">{alert.symbol}</p>
                        <Badge variant="outline">{getConditionLabel(alert.condition)}</Badge>
                        <Badge className={getStatusColor(alert.status)}>{alert.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Target: {alert.condition.includes("percent") ? `${alert.targetValue}%` : `$${alert.targetValue.toLocaleString()}`}
                        {" · "}
                        Current: ${alert.currentPrice.toLocaleString()}
                      </p>
                      {alert.status === "snoozed" && alert.snoozeUntil && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Snoozed until {new Date(alert.snoozeUntil).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {alert.status === "triggered" && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSnoozeAlert(alert.id, 24)}
                          >
                            <Clock className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDismissAlert(alert.id)}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteAlert(alert.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
