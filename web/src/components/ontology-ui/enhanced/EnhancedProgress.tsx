/**
 * EnhancedProgress Component (Cycle 54)
 *
 * Enhanced progress tracker with:
 * - Achievements with Effect.ts
 * - XP system with level progression
 * - Streak tracking with persistence
 * - Milestone notifications
 * - Real-time progress updates
 * - Gamification elements
 *
 * Part of Phase 3 - Advanced UI Features
 */

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation } from 'convex/react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Trophy,
  Award,
  Flame,
  Star,
  TrendingUp,
  Target,
  Zap,
  Lock,
  CheckCircle2,
} from 'lucide-react';
import { Effect } from 'effect';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  xp: number;
  unlocked: boolean;
  unlockedAt?: Date;
  progress?: number;
  requirement: number;
  category: 'learning' | 'social' | 'milestone' | 'special';
}

interface StreakData {
  current: number;
  longest: number;
  lastActivityDate: Date;
}

interface XPData {
  current: number;
  level: number;
  nextLevelXP: number;
  totalXP: number;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  threshold: number;
  reward: string;
  completed: boolean;
  completedAt?: Date;
}

interface EnhancedProgressProps {
  userId: string;
  courseId?: string;
  groupId: string;
}

// Effect.ts service for XP calculation
const calculateXP = (activities: any[]) =>
  Effect.gen(function* () {
    const baseXP = activities.reduce((sum, activity) => sum + (activity.xp || 0), 0);
    const bonusMultiplier = 1.0;

    const totalXP = Math.floor(baseXP * bonusMultiplier);
    const level = Math.floor(Math.sqrt(totalXP / 100)) + 1;
    const nextLevelXP = Math.pow(level, 2) * 100;
    const currentLevelXP = Math.pow(level - 1, 2) * 100;
    const progressToNext = ((totalXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;

    return { totalXP, level, nextLevelXP, currentLevelXP, progressToNext };
  });

export function EnhancedProgress({ userId, courseId, groupId }: EnhancedProgressProps) {
  // Real-time data (uncomment when Convex is set up)
  // const progressData = useQuery(api.queries.progress.get, { userId, courseId });
  // const claimAchievement = useMutation(api.mutations.achievements.claim);

  const [xpData, setXpData] = useState<XPData>({
    current: 0,
    level: 1,
    nextLevelXP: 100,
    totalXP: 0,
  });

  const [streakData, setStreakData] = useState<StreakData>({
    current: 5,
    longest: 12,
    lastActivityDate: new Date(),
  });

  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: '1',
      title: 'First Steps',
      description: 'Complete your first lesson',
      icon: '🎯',
      xp: 50,
      unlocked: true,
      unlockedAt: new Date(),
      progress: 100,
      requirement: 1,
      category: 'learning',
    },
    {
      id: '2',
      title: 'Quick Learner',
      description: 'Complete 10 lessons',
      icon: '⚡',
      xp: 200,
      unlocked: true,
      progress: 100,
      requirement: 10,
      category: 'learning',
    },
    {
      id: '3',
      title: 'Knowledge Seeker',
      description: 'Complete 50 lessons',
      icon: '📚',
      xp: 500,
      unlocked: false,
      progress: 60,
      requirement: 50,
      category: 'learning',
    },
    {
      id: '4',
      title: 'Perfect Score',
      description: 'Get 100% on a quiz',
      icon: '💯',
      xp: 300,
      unlocked: true,
      progress: 100,
      requirement: 1,
      category: 'milestone',
    },
    {
      id: '5',
      title: 'Week Warrior',
      description: 'Maintain a 7-day streak',
      icon: '🔥',
      xp: 400,
      unlocked: false,
      progress: 71,
      requirement: 7,
      category: 'special',
    },
  ]);

  const [milestones, setMilestones] = useState<Milestone[]>([
    {
      id: '1',
      title: '25% Complete',
      description: 'You\'re making great progress!',
      threshold: 25,
      reward: '50 XP',
      completed: true,
      completedAt: new Date(),
    },
    {
      id: '2',
      title: 'Halfway There',
      description: 'You\'re halfway through the course!',
      threshold: 50,
      reward: '100 XP + Special Badge',
      completed: true,
      completedAt: new Date(),
    },
    {
      id: '3',
      title: 'Almost Done',
      description: 'Just a little more to go!',
      threshold: 75,
      reward: '150 XP',
      completed: false,
    },
    {
      id: '4',
      title: 'Course Master',
      description: 'Complete the entire course!',
      threshold: 100,
      reward: '500 XP + Certificate',
      completed: false,
    },
  ]);

  const [showLevelUpAnimation, setShowLevelUpAnimation] = useState(false);
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);

  // Calculate XP on mount
  useEffect(() => {
    const activities = [
      { xp: 50 },
      { xp: 100 },
      { xp: 75 },
    ];

    Effect.runPromise(
      calculateXP(activities).pipe(
        Effect.catchAll((error) => {
          console.error('XP calculation failed:', error);
          return Effect.succeed({
            totalXP: 0,
            level: 1,
            nextLevelXP: 100,
            currentLevelXP: 0,
            progressToNext: 0,
          });
        })
      )
    ).then((result) => {
      setXpData({
        current: result.progressToNext,
        level: result.level,
        nextLevelXP: result.nextLevelXP,
        totalXP: result.totalXP,
      });
    });
  }, []);

  const handleClaimAchievement = async (achievementId: string) => {
    const achievement = achievements.find((a) => a.id === achievementId);
    if (!achievement || achievement.unlocked) return;

    // Optimistic update
    setAchievements((prev) =>
      prev.map((a) =>
        a.id === achievementId
          ? { ...a, unlocked: true, unlockedAt: new Date() }
          : a
      )
    );

    setNewAchievements([achievement]);
    setTimeout(() => setNewAchievements([]), 5000);

    // Submit to backend (uncomment when Convex is set up)
    // await claimAchievement({ achievementId, userId });
  };

  const categoryColors = {
    learning: 'bg-blue-500',
    social: 'bg-green-500',
    milestone: 'bg-purple-500',
    special: 'bg-orange-500',
  };

  const categoryLabels = {
    learning: 'Learning',
    social: 'Social',
    milestone: 'Milestone',
    special: 'Special',
  };

  const getLevelName = (level: number): string => {
    if (level < 5) return 'Beginner';
    if (level < 10) return 'Intermediate';
    if (level < 20) return 'Advanced';
    if (level < 30) return 'Expert';
    return 'Master';
  };

  return (
    <div className="space-y-6">
      {/* Achievement Notifications */}
      <AnimatePresence>
        {newAchievements.map((achievement) => (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="fixed top-4 right-4 z-50 max-w-md"
          >
            <Card className="border-2 border-yellow-500 shadow-2xl">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <p className="font-semibold text-yellow-600 dark:text-yellow-400 text-sm">
                      Achievement Unlocked!
                    </p>
                    <p className="font-bold">{achievement.title}</p>
                    <p className="text-sm text-muted-foreground">+{achievement.xp} XP</p>
                  </div>
                  <Trophy className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* XP and Level Card */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold">Level {xpData.level}</h3>
              <p className="text-white/80">{getLevelName(xpData.level)}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{xpData.totalXP}</div>
              <div className="text-sm text-white/80">Total XP</div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Progress to Level {xpData.level + 1}</span>
              <span>{xpData.totalXP} / {xpData.nextLevelXP} XP</span>
            </div>
            <div className="h-3 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${xpData.current}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full bg-white rounded-full"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Streak Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-500" />
              Learning Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold mb-1">{streakData.current}</div>
              <p className="text-sm text-muted-foreground">days in a row 🔥</p>
              <div className="mt-3 pt-3 border-t">
                <p className="text-xs text-muted-foreground">
                  Longest: {streakData.longest} days
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Achievements Progress */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Trophy className="h-4 w-4 text-yellow-500" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold mb-1">
                {achievements.filter((a) => a.unlocked).length}
              </div>
              <p className="text-sm text-muted-foreground">
                of {achievements.length} unlocked
              </p>
              <div className="mt-3">
                <Progress
                  value={(achievements.filter((a) => a.unlocked).length / achievements.length) * 100}
                  className="h-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Milestone */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-green-500" />
              Next Milestone
            </CardTitle>
          </CardHeader>
          <CardContent>
            {milestones.find((m) => !m.completed) ? (
              <div className="text-center">
                <div className="text-2xl font-bold mb-1">
                  {milestones.find((m) => !m.completed)?.threshold}%
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {milestones.find((m) => !m.completed)?.title}
                </p>
                <Badge variant="secondary" className="mt-2">
                  {milestones.find((m) => !m.completed)?.reward}
                </Badge>
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-green-500" />
                <p className="text-sm">All milestones complete!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Achievements Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {achievements.map((achievement) => (
              <motion.div
                key={achievement.id}
                whileHover={{ scale: achievement.unlocked ? 1 : 1.02 }}
                className={`p-4 rounded-lg border-2 transition-all ${
                  achievement.unlocked
                    ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950'
                    : 'border-border bg-muted/30'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`text-3xl ${achievement.unlocked ? 'grayscale-0' : 'grayscale opacity-50'}`}
                  >
                    {achievement.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold truncate">{achievement.title}</h4>
                      <Badge
                        variant="outline"
                        className={categoryColors[achievement.category]}
                      >
                        {categoryLabels[achievement.category]}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {achievement.description}
                    </p>

                    {achievement.unlocked ? (
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">
                          <Zap className="h-3 w-3 mr-1" />
                          +{achievement.xp} XP
                        </Badge>
                        {achievement.unlockedAt && (
                          <span className="text-xs text-muted-foreground">
                            {new Date(achievement.unlockedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">
                            {achievement.progress}% / 100%
                          </span>
                        </div>
                        <Progress value={achievement.progress} className="h-1" />
                        {achievement.progress === 100 && (
                          <Button
                            onClick={() => handleClaimAchievement(achievement.id)}
                            size="sm"
                            className="w-full mt-2"
                          >
                            <Award className="h-4 w-4 mr-2" />
                            Claim Reward
                          </Button>
                        )}
                      </div>
                    )}
                  </div>

                  {!achievement.unlocked && (
                    <Lock className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Milestones Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Course Milestones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {milestones.map((milestone, index) => (
              <div key={milestone.id} className="relative">
                {index !== milestones.length - 1 && (
                  <div className="absolute left-5 top-12 bottom-0 w-0.5 bg-border" />
                )}

                <div className="flex items-start gap-4">
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                      milestone.completed
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'bg-background border-border text-muted-foreground'
                    }`}
                  >
                    {milestone.completed ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <span className="text-sm font-bold">{milestone.threshold}%</span>
                    )}
                  </div>

                  <div className="flex-1 pb-8">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="font-semibold mb-1">{milestone.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {milestone.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary" className="text-xs">
                            {milestone.reward}
                          </Badge>
                          {milestone.completed && milestone.completedAt && (
                            <span className="text-xs text-muted-foreground">
                              {new Date(milestone.completedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>

                      {milestone.completed && (
                        <Badge variant="default" className="bg-green-500">
                          ✓ Complete
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
