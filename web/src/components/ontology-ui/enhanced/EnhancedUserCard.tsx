/**
 * EnhancedUserCard Component (Cycle 55)
 *
 * Enhanced user card with:
 * - Live presence from Convex
 * - Activity stream with real-time updates
 * - Connection count
 * - Quick actions (message, follow)
 * - Status indicators
 * - Profile preview on hover
 *
 * Part of Phase 3 - Advanced UI Features
 */

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation } from 'convex/react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  MessageSquare,
  UserPlus,
  UserCheck,
  Users,
  Activity,
  MapPin,
  Calendar,
  MoreVertical,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';

interface User {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  role: 'platform_owner' | 'org_owner' | 'org_user' | 'customer';
  bio?: string;
  location?: string;
  joinedAt: Date;
  isOnline?: boolean;
  lastSeen?: Date;
  metadata?: Record<string, any>;
}

interface UserActivity {
  id: string;
  type: string;
  description: string;
  timestamp: Date;
}

interface EnhancedUserCardProps {
  user: User;
  currentUserId: string;
  showActions?: boolean;
  showActivity?: boolean;
  showConnections?: boolean;
  compact?: boolean;
}

export function EnhancedUserCard({
  user,
  currentUserId,
  showActions = true,
  showActivity = true,
  showConnections = true,
  compact = false,
}: EnhancedUserCardProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [showHoverCard, setShowHoverCard] = useState(false);

  // Real-time presence (uncomment when Convex is set up)
  // const presence = useQuery(api.queries.presence.get, { userId: user.id });
  // const activities = useQuery(api.queries.activity.getUserRecent, { userId: user.id, limit: 3 });
  // const connections = useQuery(api.queries.connections.count, { userId: user.id });

  // Mutations (uncomment when Convex is set up)
  // const followUser = useMutation(api.mutations.connections.follow);
  // const unfollowUser = useMutation(api.mutations.connections.unfollow);
  // const sendMessage = useMutation(api.mutations.messages.create);

  // Mock data
  const [connectionCount] = useState(127);
  const [recentActivities] = useState<UserActivity[]>([
    {
      id: '1',
      type: 'completed_lesson',
      description: 'Completed "Advanced React Patterns"',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
    },
    {
      id: '2',
      type: 'earned_badge',
      description: 'Earned "Quick Learner" badge',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    },
    {
      id: '3',
      type: 'commented',
      description: 'Commented on "TypeScript Best Practices"',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
    },
  ]);

  const handleFollow = async () => {
    // Optimistic update
    setIsFollowing(!isFollowing);

    try {
      // if (isFollowing) {
      //   await unfollowUser({ targetUserId: user.id });
      // } else {
      //   await followUser({ targetUserId: user.id });
      // }
      console.log('Follow toggled:', user.id);
    } catch (error) {
      // Rollback on error
      setIsFollowing(!isFollowing);
      console.error('Follow failed:', error);
    }
  };

  const handleMessage = () => {
    // Navigate to message or open chat
    console.log('Message user:', user.id);
  };

  const getRoleDisplay = (role: string) => {
    const roleMap: Record<string, string> = {
      platform_owner: 'Platform Owner',
      org_owner: 'Organization Owner',
      org_user: 'Member',
      customer: 'Customer',
    };
    return roleMap[role] || role;
  };

  const getRoleBadgeVariant = (role: string) => {
    const variantMap: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      platform_owner: 'destructive',
      org_owner: 'default',
      org_user: 'secondary',
      customer: 'outline',
    };
    return variantMap[role] || 'outline';
  };

  const formatLastSeen = (date?: Date) => {
    if (!date) return 'Unknown';
    const now = Date.now();
    const diff = now - new Date(date).getTime();
    const minutes = Math.floor(diff / 1000 / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const formatActivityTime = (date: Date) => {
    const now = Date.now();
    const diff = now - new Date(date).getTime();
    const minutes = Math.floor(diff / 1000 / 60);
    const hours = Math.floor(minutes / 60);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return new Date(date).toLocaleDateString();
  };

  const isCurrentUser = user.id === currentUserId;

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-lg border hover:shadow-md transition-all">
        <div className="relative">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          {user.isOnline && (
            <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{user.name}</p>
          {user.email && (
            <p className="text-sm text-muted-foreground truncate">{user.email}</p>
          )}
        </div>
        <Badge variant={getRoleBadgeVariant(user.role)} className="text-xs">
          {getRoleDisplay(user.role)}
        </Badge>
      </div>
    );
  }

  return (
    <HoverCard open={showHoverCard} onOpenChange={setShowHoverCard}>
      <HoverCardTrigger asChild>
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="group relative overflow-hidden transition-all duration-200 hover:shadow-lg">
            {/* Online Status Banner */}
            {user.isOnline && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-500" />
            )}

            <CardHeader className="pb-3">
              <div className="flex items-start gap-3">
                {/* Avatar with Online Indicator */}
                <div className="relative">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  {user.isOnline && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-green-500 border-2 border-background flex items-center justify-center"
                    >
                      <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
                    </motion.div>
                  )}
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold truncate">{user.name}</h3>
                    <Badge variant={getRoleBadgeVariant(user.role)} className="text-xs">
                      {getRoleDisplay(user.role)}
                    </Badge>
                  </div>
                  {user.email && (
                    <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    {user.isOnline ? (
                      <div className="flex items-center gap-1">
                        <Activity className="h-3 w-3 text-green-500" />
                        <span className="text-green-600 dark:text-green-400">Online</span>
                      </div>
                    ) : (
                      <span>Last seen {formatLastSeen(user.lastSeen)}</span>
                    )}
                  </div>
                </div>

                {/* Actions Menu */}
                {!isCurrentUser && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Profile</DropdownMenuItem>
                      <DropdownMenuItem onClick={handleMessage}>
                        Send Message
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-muted-foreground">
                        Report User
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Bio */}
              {user.bio && (
                <p className="text-sm text-muted-foreground line-clamp-2">{user.bio}</p>
              )}

              {/* Metadata */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                {user.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>{user.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>Joined {new Date(user.joinedAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Connection Count */}
              {showConnections && (
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{connectionCount}</span>
                  <span className="text-muted-foreground">connections</span>
                </div>
              )}

              {/* Recent Activity */}
              {showActivity && recentActivities.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Recent Activity
                    </h4>
                    <div className="space-y-2">
                      {recentActivities.map((activity) => (
                        <div key={activity.id} className="text-xs">
                          <p className="text-foreground">{activity.description}</p>
                          <p className="text-muted-foreground">
                            {formatActivityTime(activity.timestamp)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Action Buttons */}
              {showActions && !isCurrentUser && (
                <>
                  <Separator />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleMessage}
                      variant="default"
                      size="sm"
                      className="flex-1"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                    <Button
                      onClick={handleFollow}
                      variant={isFollowing ? 'outline' : 'secondary'}
                      size="sm"
                      className="flex-1"
                    >
                      {isFollowing ? (
                        <>
                          <UserCheck className="h-4 w-4 mr-2" />
                          Following
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Follow
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </HoverCardTrigger>

      {/* Hover Card Preview */}
      <HoverCardContent className="w-80" align="start">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-semibold">{user.name}</p>
              <p className="text-sm text-muted-foreground">{getRoleDisplay(user.role)}</p>
            </div>
          </div>

          {user.bio && (
            <p className="text-sm text-muted-foreground">{user.bio}</p>
          )}

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-center p-2 bg-muted rounded">
              <div className="font-bold">{connectionCount}</div>
              <div className="text-xs text-muted-foreground">Connections</div>
            </div>
            <div className="text-center p-2 bg-muted rounded">
              <div className="font-bold">{recentActivities.length}</div>
              <div className="text-xs text-muted-foreground">Recent Activities</div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button size="sm" variant="default" className="flex-1" onClick={handleMessage}>
              Message
            </Button>
            <Button size="sm" variant="outline">View Profile</Button>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
