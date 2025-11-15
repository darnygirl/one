import { z } from "zod";

// Base schemas
export const LessonSchema = z.object({
  name: z.string(),
  value: z.string()
});

export const ModuleDetailsSchema = z.object({
  overview: z.string(),
  benefits: z.array(z.string()),
  implementation: z.array(z.string())
});

export const ModuleSchema = z.object({
  title: z.string(),
  description: z.string(),
  features: z.array(z.string()),
  details: ModuleDetailsSchema.optional()
});

export const CourseDetailsSchema = z.object({
  badge: z.string(),
  title: z.string(),
  subtitle: z.string(),
  originalPrice: z.string(),
  currentPrice: z.string(),
  guarantee: z.string(),
  ctaText: z.string(),
  valueProposition: z.string(),
  spots: z.object({
    total: z.number(),
    remaining: z.number()
  }),
  launchDate: z.string()
});

// Derived types
export type Lesson = z.infer<typeof LessonSchema>;
export type ModuleDetails = z.infer<typeof ModuleDetailsSchema>;
export type Module = z.infer<typeof ModuleSchema>;
export type CourseDetails = z.infer<typeof CourseDetailsSchema>;

// Component Props
export interface ModuleContentProps {
  module?: Module;
  lessons?: Lesson[];
  moduleNumber?: number;
}

export interface CourseHeroProps {
  courseDetails: CourseDetails;
  heroStats: {
    value: string;
    label: string;
  }[];
}

// Legacy interfaces (to be migrated)
export interface LegacyModule {
  title: string;
  description: string;
  objective: string;
  mainDescription: string;
  output: string;
  lessons: Lesson[];
}

// ============================================================================
// Course Catalog Types (for e-learning marketplace)
// ============================================================================

/**
 * Course interface for catalog/marketplace display
 * Similar to Product but adapted for e-learning
 */
export interface CourseCatalog {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  thumbnail: string;
  images: string[];
  instructor: string;
  instructorAvatar?: string;
  category: string;
  tags: string[];
  level: 'beginner' | 'intermediate' | 'advanced' | 'all-levels';
  duration: number; // in minutes
  lessonsCount: number;
  enrolled: number;
  rating?: number;
  reviewCount?: number;
  featured?: boolean;
  certificate?: boolean;
  language: string;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
  progress?: number; // For enrolled students (0-100)
  inStock?: boolean; // For limited enrollment courses
  inventory?: number; // For limited enrollment courses
}

export interface CourseEnrollment {
  id: string;
  courseId: string;
  userId: string;
  enrolledAt: Date;
  progress: number; // 0-100
  completedLessons: string[]; // Lesson IDs
  lastAccessedAt: Date;
  certificateEarned?: boolean;
  certificateIssuedAt?: Date;
}

export interface CourseReview {
  id: string;
  courseId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title?: string;
  content: string;
  createdAt: Date;
  verified?: boolean; // Verified purchase
  helpful?: number;
}

export interface CourseCategory {
  id: string;
  slug: string;
  name: string;
  description?: string;
  image?: string;
  courseCount: number;
  parentCategory?: string;
}

export interface Instructor {
  id: string;
  name: string;
  bio: string;
  avatar?: string;
  title?: string;
  expertise: string[];
  coursesCount: number;
  studentsCount: number;
  rating?: number;
  reviewCount?: number;
  socialLinks?: {
    website?: string;
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
}

// ============================================================================
// Quiz & Assessment Types
// ============================================================================

export type QuestionType = 'multiple-choice' | 'true-false' | 'short-answer';

export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface QuizQuestionData {
  id: string;
  type: QuestionType;
  question: string;
  options?: QuizOption[]; // For multiple choice
  correctAnswer: string | boolean; // Index/id for MCQ, boolean for T/F, string for short answer
  explanation?: string;
  points: number;
}

export interface Quiz {
  id: string;
  lessonId: string;
  title: string;
  description?: string;
  questions: QuizQuestionData[];
  passingScore: number; // Percentage
  timeLimit?: number; // in minutes
  attemptsAllowed?: number;
}

export interface QuizAnswer {
  questionId: string;
  answer: string | boolean;
  isCorrect: boolean;
  timeSpent?: number; // seconds
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  answers: QuizAnswer[];
  score: number;
  percentage: number;
  passed: boolean;
  startedAt: Date;
  completedAt: Date;
  timeSpent: number; // seconds
}

export interface QuizProgress {
  currentQuestionIndex: number;
  answers: QuizAnswer[];
  startTime: Date;
  timeElapsed: number; // seconds
}

// ============================================================================
// Progress Tracking Types
// ============================================================================

export interface LessonProgressData {
  id: string;
  lessonId: string;
  userId: string;
  courseId: string;
  status: 'not-started' | 'in-progress' | 'completed';
  progress: number; // 0-100
  timeSpent: number; // in seconds
  lastAccessedAt: Date;
  completedAt?: Date;
  quizScore?: number; // If lesson has a quiz
  quizPassed?: boolean;
}

export interface CourseProgressData {
  id: string;
  courseId: string;
  userId: string;
  overallProgress: number; // 0-100
  lessonsCompleted: number;
  lessonsTotal: number;
  quizzesCompleted: number;
  quizzesTotal: number;
  averageQuizScore: number; // 0-100
  timeSpent: number; // Total time in seconds
  enrolledAt: Date;
  lastAccessedAt: Date;
  estimatedCompletion?: Date;
  certificateEligible: boolean;
  certificateEarned?: boolean;
  certificateIssuedAt?: Date;
}

export interface ProgressMilestone {
  id: string;
  title: string;
  description: string;
  threshold: number; // Progress percentage to unlock
  icon?: string;
  unlockedAt?: Date;
}

export interface LearningStreak {
  currentStreak: number; // days
  longestStreak: number; // days
  lastActivityDate: Date;
  totalActiveDays: number;
} 