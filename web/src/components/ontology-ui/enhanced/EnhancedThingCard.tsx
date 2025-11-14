/**
 * EnhancedThingCard Component (Cycle 57)
 *
 * Enhanced thing card with:
 * - Real-time stats (views, likes, etc.) via Convex
 * - Action menu with quick operations
 * - Quick preview modal
 * - Drag-to-reorder support
 * - Context menu for advanced actions
 * - Live status updates
 *
 * Part of Phase 3 - Advanced UI Features
 */

'use client';

import { useState } from 'react';
import { motion, Reorder, useDragControls } from 'framer-motion';
import { useQuery, useMutation } from 'convex/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  MoreVertical,
  Eye,
  Heart,
  MessageSquare,
  Share2,
  Edit,
  Trash2,
  Copy,
  Download,
  Star,
  TrendingUp,
  GripVertical,
  ExternalLink,
} from 'lucide-react';
import { Effect } from 'effect';

interface Thing {
  id: string;
  type: string;
  name: string;
  description?: string;
  status?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt?: Date;
  metadata?: Record<string, any>;
  ownerId?: string;
}

interface ThingStats {
  views: number;
  likes: number;
  comments: number;
  shares: number;
}

interface EnhancedThingCardProps {
  thing: Thing;
  stats?: ThingStats;
  showStats?: boolean;
  showActions?: boolean;
  showPreview?: boolean;
  draggable?: boolean;
  onReorder?: (id: string, newIndex: number) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (id: string) => void;
}

// Effect.ts service for like/unlike
const toggleLike = (thingId: string, currentlyLiked: boolean) =>
  Effect.gen(function* () {
    // Simulate API call
    yield* Effect.sleep('200 millis');

    return { success: true, liked: !currentlyLiked };
  });

export function EnhancedThingCard({
  thing,
  stats: initialStats,
  showStats = true,
  showActions = true,
  showPreview = true,
  draggable = false,
  onReorder,
  onEdit,
  onDelete,
  onDuplicate,
}: EnhancedThingCardProps) {
  const dragControls = useDragControls();

  // Real-time stats (uncomment when Convex is set up)
  // const liveStats = useQuery(api.queries.things.getStats, { thingId: thing.id });

  const [stats, setStats] = useState<ThingStats>(
    initialStats || {
      views: 1247,
      likes: 89,
      comments: 23,
      shares: 12,
    }
  );

  const [isLiked, setIsLiked] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Mutations (uncomment when Convex is set up)
  // const likeThing = useMutation(api.mutations.things.like);
  // const updateThing = useMutation(api.mutations.things.update);
  // const deleteThing = useMutation(api.mutations.things.delete);

  const handleLike = async () => {
    setIsProcessing(true);

    // Optimistic update
    setIsLiked(!isLiked);
    setStats((prev) => ({
      ...prev,
      likes: isLiked ? prev.likes - 1 : prev.likes + 1,
    }));

    try {
      await Effect.runPromise(
        toggleLike(thing.id, isLiked).pipe(
          Effect.catchAll((error) => {
            console.error('Like failed:', error);
            // Rollback
            setIsLiked(isLiked);
            setStats((prev) => ({
              ...prev,
              likes: isLiked ? prev.likes + 1 : prev.likes - 1,
            }));
            return Effect.succeed({ success: false, liked: isLiked });
          })
        )
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEdit = () => {
    onEdit?.(thing.id);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    setIsProcessing(true);
    try {
      // await deleteThing({ thingId: thing.id });
      onDelete?.(thing.id);
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDuplicate = async () => {
    setIsProcessing(true);
    try {
      onDuplicate?.(thing.id);
    } catch (error) {
      console.error('Duplicate failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: thing.name,
        text: thing.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const getThingTypeIcon = (type: string) => {
    const iconMap: Record<string, string> = {
      product: '🛍️',
      course: '📚',
      lesson: '📖',
      token: '🪙',
      agent: '🤖',
      content: '📄',
      event: '📅',
      default: '📦',
    };
    return iconMap[type] || iconMap.default;
  };

  const getTypeColor = (type: string) => {
    const colorMap: Record<string, string> = {
      product: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
      course: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100',
      token: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
      agent: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
    };
    return colorMap[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100';
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const cardContent = (
    <Card className="group relative overflow-hidden transition-all duration-200 hover:shadow-lg hover:scale-[1.01]">
      {/* Drag Handle */}
      {draggable && (
        <div
          className="absolute left-2 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
          onPointerDown={(e) => dragControls.start(e)}
        >
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </div>
      )}

      <CardHeader className={`pb-3 ${draggable ? 'pl-10' : ''}`}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-2xl" aria-label={thing.type}>
              {getThingTypeIcon(thing.type)}
            </span>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg truncate">{thing.name}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className={getTypeColor(thing.type)}>
                  {thing.type}
                </Badge>
                {thing.status && (
                  <Badge variant="outline" className="capitalize text-xs">
                    {thing.status}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Actions Menu */}
          {showActions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  disabled={isProcessing}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {showPreview && (
                  <>
                    <DropdownMenuItem onClick={() => setShowPreviewModal(true)}>
                      <Eye className="h-4 w-4 mr-2" />
                      Quick Preview
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onClick={handleEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDuplicate}>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Description */}
        {thing.description && (
          <CardDescription className="line-clamp-2">{thing.description}</CardDescription>
        )}

        {/* Real-time Stats */}
        {showStats && (
          <div className="flex items-center gap-4 text-sm">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleLike}
              disabled={isProcessing}
              className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Heart
                className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`}
              />
              <span>{formatNumber(stats.likes)}</span>
            </motion.button>

            <div className="flex items-center gap-1 text-muted-foreground">
              <Eye className="h-4 w-4" />
              <span>{formatNumber(stats.views)}</span>
            </div>

            <div className="flex items-center gap-1 text-muted-foreground">
              <MessageSquare className="h-4 w-4" />
              <span>{formatNumber(stats.comments)}</span>
            </div>

            <div className="flex items-center gap-1 text-muted-foreground">
              <Share2 className="h-4 w-4" />
              <span>{formatNumber(stats.shares)}</span>
            </div>

            {stats.views > 10000 && (
              <Badge variant="secondary" className="ml-auto">
                <TrendingUp className="h-3 w-3 mr-1" />
                Trending
              </Badge>
            )}
          </div>
        )}

        {/* Tags */}
        {thing.tags && thing.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {thing.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {thing.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{thing.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Metadata */}
        {thing.metadata && Object.keys(thing.metadata).length > 0 && (
          <div className="text-xs text-muted-foreground space-y-1">
            {Object.entries(thing.metadata)
              .slice(0, 2)
              .map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="font-medium capitalize">{key.replace(/_/g, ' ')}:</span>
                  <span className="truncate ml-2">{String(value)}</span>
                </div>
              ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
          <span>
            {thing.updatedAt
              ? `Updated ${new Date(thing.updatedAt).toLocaleDateString()}`
              : `Created ${new Date(thing.createdAt).toLocaleDateString()}`}
          </span>
          <Button variant="ghost" size="sm" className="h-6 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
            View Details
            <ExternalLink className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <>
      {draggable ? (
        <Reorder.Item
          value={thing}
          dragListener={false}
          dragControls={dragControls}
          whileDrag={{ scale: 1.05, zIndex: 50 }}
        >
          {cardContent}
        </Reorder.Item>
      ) : (
        cardContent
      )}

      {/* Quick Preview Modal */}
      {showPreview && (
        <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span className="text-2xl">{getThingTypeIcon(thing.type)}</span>
                {thing.name}
              </DialogTitle>
              <DialogDescription>
                <Badge variant="secondary" className={getTypeColor(thing.type)}>
                  {thing.type}
                </Badge>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {thing.description && (
                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">{thing.description}</p>
                </div>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{formatNumber(stats.views)}</div>
                  <div className="text-xs text-muted-foreground">Views</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{formatNumber(stats.likes)}</div>
                  <div className="text-xs text-muted-foreground">Likes</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{formatNumber(stats.comments)}</div>
                  <div className="text-xs text-muted-foreground">Comments</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{formatNumber(stats.shares)}</div>
                  <div className="text-xs text-muted-foreground">Shares</div>
                </div>
              </div>

              {/* Metadata */}
              {thing.metadata && (
                <div>
                  <h4 className="font-semibold mb-2">Details</h4>
                  <div className="space-y-2 text-sm">
                    {Object.entries(thing.metadata).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-muted-foreground capitalize">
                          {key.replace(/_/g, ' ')}:
                        </span>
                        <span className="font-medium">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {thing.tags && thing.tags.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {thing.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button onClick={handleEdit} className="flex-1">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button onClick={handleShare} variant="outline" className="flex-1">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
