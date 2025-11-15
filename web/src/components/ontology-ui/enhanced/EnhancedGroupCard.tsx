/**
 * EnhancedGroupCard Component (Cycle 56)
 *
 * Enhanced group card with:
 * - Real-time member count via Convex
 * - Recent activity preview
 * - Join/leave buttons with optimistic updates
 * - Stats dashboard
 * - Live participant indicators
 * - Nested group visualization
 *
 * Part of Phase 3 - Advanced UI Features
 */

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation } from 'convex/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Users,
  Activity,
  TrendingUp,
  UserPlus,
  UserMinus,
  Settings,
  BarChart3,
  MessageSquare,
  FileText,
  Calendar,
} from 'lucide-react';

interface Group {
  id: string;
  name: string;
  description?: string;
  parentGroupId?: string;
  createdAt: Date;
  metadata?: Record<string, any>;
}

interface GroupStats {
  memberCount: number;
  activeMembers: number;
  totalContent: number;
  weeklyActivity: number;
  growth: number; // percentage
}

interface RecentActivity {
  id: string;
  type: string;
  description: string;
  timestamp: Date;
  userId: string;
  userName: string;
  userAvatar?: string;
}

interface EnhancedGroupCardProps {
  group: Group;
  currentUserId: string;
  showStats?: boolean;
  showActivity?: boolean;
  showActions?: boolean;
}

export function EnhancedGroupCard({
  group,
  currentUserId,
  showStats = true,
  showActivity = true,
  showActions = true,
}: EnhancedGroupCardProps) {
  const [isMember, setIsMember] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  // Real-time data (uncomment when Convex is set up)
  // const groupStats = useQuery(api.queries.groups.getStats, { groupId: group.id });
  // const recentActivity = useQuery(api.queries.activity.getGroupRecent, {
  //   groupId: group.id,
  //   limit: 5
  // });
  // const membership = useQuery(api.queries.groups.checkMembership, {
  //   groupId: group.id,
  //   userId: currentUserId
  // });

  // Mutations (uncomment when Convex is set up)
  // const joinGroup = useMutation(api.mutations.groups.join);
  // const leaveGroup = useMutation(api.mutations.groups.leave);

  // Mock data
  const [stats, setStats] = useState<GroupStats>({
    memberCount: 1247,
    activeMembers: 342,
    totalContent: 89,
    weeklyActivity: 156,
    growth: 12.5,
  });

  const [activities] = useState<RecentActivity[]>([
    {
      id: '1',
      type: 'member_joined',
      description: 'joined the group',
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      userId: 'user1',
      userName: 'Sarah Chen',
      userAvatar: undefined,
    },
    {
      id: '2',
      type: 'content_created',
      description: 'created a new post',
      timestamp: new Date(Date.now() - 1000 * 60 * 45),
      userId: 'user2',
      userName: 'John Smith',
    },
    {
      id: '3',
      type: 'event_scheduled',
      description: 'scheduled a meeting',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      userId: 'user3',
      userName: 'Maria Garcia',
    },
  ]);

  const handleJoinLeave = async () => {
    setIsJoining(true);

    // Optimistic update
    setIsMember(!isMember);
    setStats((prev) => ({
      ...prev,
      memberCount: isMember ? prev.memberCount - 1 : prev.memberCount + 1,
    }));

    try {
      // if (isMember) {
      //   await leaveGroup({ groupId: group.id });
      // } else {
      //   await joinGroup({ groupId: group.id });
      // }
      console.log('Membership toggled:', group.id);
    } catch (error) {
      // Rollback on error
      setIsMember(!isMember);
      setStats((prev) => ({
        ...prev,
        memberCount: isMember ? prev.memberCount + 1 : prev.memberCount - 1,
      }));
      console.error('Join/leave failed:', error);
    } finally {
      setIsJoining(false);
    }
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

  const activityIcons: Record<string, any> = {
    member_joined: UserPlus,
    content_created: FileText,
    event_scheduled: Calendar,
    message_sent: MessageSquare,
  };

  const isNested = !!group.parentGroupId;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="group relative overflow-hidden transition-all duration-200 hover:shadow-lg">
        {/* Growth Indicator */}
        {stats.growth > 0 && (
          <div className="absolute top-0 right-0 bg-gradient-to-l from-green-500 to-transparent h-1 w-32" />
        )}

        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🏢</span>
                <CardTitle className="flex items-center gap-2">
                  <span>{group.name}</span>
                  {isNested && (
                    <Badge variant="outline" className="text-xs">
                      Nested
                    </Badge>
                  )}
                </CardTitle>
              </div>
              {group.description && (
                <CardDescription className="mt-1">{group.description}</CardDescription>
              )}
            </div>

            {showActions && (
              <Button
                onClick={handleJoinLeave}
                disabled={isJoining}
                variant={isMember ? 'outline' : 'default'}
                size="sm"
              >
                {isJoining ? (
                  'Processing...'
                ) : isMember ? (
                  <>
                    <UserMinus className="h-4 w-4 mr-2" />
                    Leave
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Join
                  </>
                )}
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Stats Grid */}
          {showStats && (
            <div className="grid grid-cols-2 gap-3">
              {/* Member Count */}
              <motion.div
                key={stats.memberCount}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                className="p-3 bg-muted rounded-lg"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Members</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">{stats.memberCount.toLocaleString()}</span>
                  {stats.growth > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +{stats.growth}%
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.activeMembers} active this week
                </p>
              </motion.div>

              {/* Activity Count */}
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Activity</span>
                </div>
                <div className="text-2xl font-bold">{stats.weeklyActivity}</div>
                <p className="text-xs text-muted-foreground mt-1">actions this week</p>
              </div>

              {/* Content Count */}
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Content</span>
                </div>
                <div className="text-2xl font-bold">{stats.totalContent}</div>
                <p className="text-xs text-muted-foreground mt-1">posts & resources</p>
              </div>

              {/* Engagement */}
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Engagement</span>
                </div>
                <div className="text-2xl font-bold">
                  {Math.round((stats.activeMembers / stats.memberCount) * 100)}%
                </div>
                <Progress
                  value={(stats.activeMembers / stats.memberCount) * 100}
                  className="h-1 mt-2"
                />
              </div>
            </div>
          )}

          {/* Recent Activity */}
          {showActivity && activities.length > 0 && (
            <>
              <Separator />
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Recent Activity
                  </h4>
                  <Button variant="ghost" size="sm" className="h-7 text-xs">
                    View All
                  </Button>
                </div>

                <div className="space-y-3">
                  {activities.map((activity) => {
                    const Icon = activityIcons[activity.type] || Activity;

                    return (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-start gap-3"
                      >
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm">
                            <span className="font-medium">{activity.userName}</span>{' '}
                            <span className="text-muted-foreground">{activity.description}</span>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatActivityTime(activity.timestamp)}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* Footer Actions */}
          <Separator />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Created {new Date(group.createdAt).toLocaleDateString()}</span>
            <div className="flex items-center gap-2">
              {isMember && (
                <Button variant="ghost" size="sm" className="h-7">
                  <Settings className="h-3 w-3 mr-1" />
                  Settings
                </Button>
              )}
              <Button variant="ghost" size="sm" className="h-7">
                View Group →
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
