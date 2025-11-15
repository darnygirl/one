/**
 * EntityDisplay - Right panel for displaying any entity
 *
 * Cycle 80: Production-ready entity display panel with:
 * - Adapts layout based on entity type (person/thing/connection/event)
 * - Quick actions toolbar
 * - Related entities sidebar
 * - Activity timeline
 * - Responsive and accessible
 */

'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Share2,
  Copy,
  ExternalLink,
  Clock,
  Users,
  Link2,
  Activity,
} from 'lucide-react';
import type { Thing, Person, Connection, Event, Dimension } from '../types';

type Entity = Thing | Person | Connection | Event;

interface EntityDisplayProps {
  entity: Entity | null;
  dimension: Dimension;
  relatedEntities?: Entity[];
  recentEvents?: Event[];
  onAction?: (action: string, entity: Entity) => void;
  className?: string;
}

export function EntityDisplay({
  entity,
  dimension,
  relatedEntities = [],
  recentEvents = [],
  onAction,
  className,
}: EntityDisplayProps) {
  const [activeTab, setActiveTab] = useState('details');

  if (!entity) {
    return (
      <div className={cn('flex h-full items-center justify-center', className)}>
        <div className="text-center space-y-2">
          <div className="text-4xl text-muted-foreground">📭</div>
          <p className="text-sm text-muted-foreground">
            Select an entity to view details
          </p>
        </div>
      </div>
    );
  }

  const actions = [
    { id: 'edit', label: 'Edit', icon: Edit },
    { id: 'share', label: 'Share', icon: Share2 },
    { id: 'copy', label: 'Copy', icon: Copy },
    { id: 'open', label: 'Open', icon: ExternalLink },
    { id: 'delete', label: 'Delete', icon: Trash2, variant: 'destructive' as const },
  ];

  return (
    <div className={cn('flex h-full flex-col', className)}>
      {/* Header */}
      <div className="border-b p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-xl font-bold truncate">
                {'name' in entity ? entity.name : 'Entity'}
              </h2>
              {'status' in entity && entity.status && (
                <Badge variant="outline">{entity.status}</Badge>
              )}
            </div>

            {'description' in entity && entity.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {entity.description}
              </p>
            )}
          </div>

          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-5 w-5" />
            <span className="sr-only">More options</span>
          </Button>
        </div>

        {/* Quick actions */}
        <div className="flex flex-wrap gap-2 mt-4">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.id}
                variant={action.variant || 'outline'}
                size="sm"
                onClick={() => onAction?.(action.id, entity)}
                className="gap-2"
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{action.label}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="mx-6 mt-4">
          <TabsTrigger value="details" className="gap-2">
            <Activity className="h-4 w-4" />
            Details
          </TabsTrigger>
          <TabsTrigger value="related" className="gap-2">
            <Link2 className="h-4 w-4" />
            Related
            {relatedEntities.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {relatedEntities.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="activity" className="gap-2">
            <Clock className="h-4 w-4" />
            Activity
            {recentEvents.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {recentEvents.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1">
          <div className="p-6">
            <TabsContent value="details" className="mt-0 space-y-4">
              {/* Metadata */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Information
                </h3>

                <div className="grid gap-3">
                  {'type' in entity && (
                    <DetailRow label="Type" value={entity.type} />
                  )}

                  {'_creationTime' in entity && (
                    <DetailRow
                      label="Created"
                      value={new Date(entity._creationTime).toLocaleDateString()}
                    />
                  )}

                  {'updatedAt' in entity && entity.updatedAt && (
                    <DetailRow
                      label="Updated"
                      value={new Date(entity.updatedAt).toLocaleDateString()}
                    />
                  )}

                  {'email' in entity && entity.email && (
                    <DetailRow label="Email" value={entity.email} />
                  )}

                  {'role' in entity && entity.role && (
                    <DetailRow label="Role" value={entity.role} />
                  )}
                </div>
              </div>

              {/* Tags */}
              {'tags' in entity && entity.tags && entity.tags.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {entity.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Metadata */}
              {'metadata' in entity && entity.metadata && Object.keys(entity.metadata).length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Metadata
                    </h3>
                    <div className="grid gap-3">
                      {Object.entries(entity.metadata).map(([key, value]) => (
                        <DetailRow
                          key={key}
                          label={key}
                          value={String(value)}
                        />
                      ))}
                    </div>
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="related" className="mt-0 space-y-4">
              {relatedEntities.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No related entities
                </div>
              ) : (
                relatedEntities.map((related) => (
                  <div
                    key={related._id}
                    className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors cursor-pointer"
                  >
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {'name' in related ? related.name : 'Related entity'}
                      </p>
                      {'type' in related && (
                        <p className="text-sm text-muted-foreground">
                          {related.type}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="activity" className="mt-0 space-y-4">
              {recentEvents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No recent activity
                </div>
              ) : (
                <div className="space-y-3">
                  {recentEvents.map((event) => (
                    <div key={event._id} className="flex items-start gap-3 p-3 rounded-lg border">
                      <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{event.type}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(event.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </div>
        </ScrollArea>
      </Tabs>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-right">{value}</span>
    </div>
  );
}
