/**
 * Course Card Component (Interactive)
 * Displays course with badges, wishlist, and quick enroll
 * Adapted from ProductCard pattern
 * Requires client:load hydration
 */

'use client';

import { useState } from 'react';
import type { CourseCatalog } from '@/types/course';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { Clock, Users, Award, BookOpen } from 'lucide-react';

interface CourseCardProps {
  course: CourseCatalog;
  showProgress?: boolean;
}

// Check if course is new (created within last 30 days)
const isNewCourse = (createdAt: Date) => {
  const daysSinceCreated = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
  return daysSinceCreated <= 30;
};

// Check if limited spots (less than 20 remaining)
const isLimitedSpots = (inventory?: number) => {
  return inventory !== undefined && inventory > 0 && inventory < 20;
};

// Format duration (minutes to hours/minutes)
const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
};

function CourseCard({ course, showProgress = false }: CourseCardProps) {
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);

  const handleEnroll = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsEnrolling(true);

    // TODO: Implement enrollment logic
    // For now, just simulate
    setTimeout(() => {
      setIsEnrolling(false);
      // Redirect to course or checkout
      window.location.href = `/courses/${course.slug}/enroll`;
    }, 600);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // TODO: Implement wishlist logic
    console.log('Toggle wishlist for course:', course.id);
  };

  const hasDiscount = course.compareAtPrice && course.compareAtPrice > course.price;
  const discountPercent = hasDiscount && course.compareAtPrice
    ? Math.round(((course.compareAtPrice - course.price) / course.compareAtPrice) * 100)
    : 0;

  // Check if already enrolled (based on progress field)
  const isEnrolled = course.progress !== undefined && course.progress >= 0;

  return (
    <div className="group relative overflow-hidden rounded-lg border border-border bg-card transition-all duration-200 hover:shadow-lg hover:scale-[1.02]">
      {/* Course Thumbnail */}
      <a href={`/courses/${course.slug}`} className="block">
        <div className="aspect-video overflow-hidden bg-muted">
          <img
            src={course.thumbnail}
            alt={course.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
            loading="lazy"
          />
        </div>
      </a>

      {/* Badges */}
      <div className="absolute left-2 top-2 flex flex-col gap-2">
        {course.inStock === false && (
          <Badge variant="secondary" className="bg-muted text-muted-foreground">
            Enrollment Closed
          </Badge>
        )}
        {course.featured && (
          <Badge className="bg-primary text-primary-foreground">
            Featured
          </Badge>
        )}
        {hasDiscount && (
          <Badge variant="destructive" className="font-bold">
            -{discountPercent}% OFF
          </Badge>
        )}
        {isNewCourse(course.createdAt) && (
          <Badge className="bg-green-600 text-white">
            New
          </Badge>
        )}
        {course.certificate && (
          <Badge className="bg-purple-600 text-white">
            <Award className="mr-1 h-3 w-3" />
            Certificate
          </Badge>
        )}
        {isLimitedSpots(course.inventory) && course.inStock !== false && (
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <Badge
              variant="destructive"
              className="bg-red-600 text-white font-bold shadow-lg border-0"
            >
              Only {course.inventory} spots left!
            </Badge>
          </motion.div>
        )}
      </div>

      {/* Wishlist Button */}
      <div className="absolute right-2 top-2">
        <button
          onClick={handleWishlistToggle}
          className="rounded-full bg-background/90 p-2 opacity-0 shadow transition-all duration-200 group-hover:opacity-100 hover:scale-110 hover:bg-background"
          aria-label="Add to wishlist"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>
      </div>

      {/* Course Info */}
      <div className="p-4">
        {/* Level Badge */}
        <div className="mb-2">
          <Badge
            variant={
              course.level === 'beginner'
                ? 'secondary'
                : course.level === 'advanced'
                ? 'default'
                : 'outline'
            }
            className="text-xs"
          >
            {course.level.charAt(0).toUpperCase() + course.level.slice(1).replace('-', ' ')}
          </Badge>
        </div>

        {/* Title */}
        <a href={`/courses/${course.slug}`}>
          <h3 className="text-base font-semibold text-foreground line-clamp-2 hover:text-primary transition-colors">
            {course.title}
          </h3>
        </a>

        {/* Instructor */}
        <div className="mt-2 flex items-center gap-2">
          {course.instructorAvatar && (
            <img
              src={course.instructorAvatar}
              alt={course.instructor}
              className="h-6 w-6 rounded-full object-cover"
            />
          )}
          <span className="text-sm text-muted-foreground">{course.instructor}</span>
        </div>

        {/* Stats */}
        <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{formatDuration(course.duration)}</span>
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            <span>{course.lessonsCount} lessons</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{course.enrolled.toLocaleString()}</span>
          </div>
        </div>

        {/* Rating */}
        {course.rating && (
          <div className="mt-2 flex items-center gap-2">
            <div className="flex items-center">
              <span className="mr-1 text-sm font-semibold">{course.rating.toFixed(1)}</span>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(course.rating!)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
            {course.reviewCount && (
              <span className="text-sm text-muted-foreground">({course.reviewCount})</span>
            )}
          </div>
        )}

        {/* Progress (if enrolled) */}
        {showProgress && isEnrolled && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-muted-foreground">Your progress</span>
              <span className="font-semibold">{course.progress}%</span>
            </div>
            <Progress value={course.progress} className="h-2" />
          </div>
        )}

        {/* Price */}
        <div className="mt-3 flex items-center gap-2">
          {hasDiscount && course.compareAtPrice && (
            <span className="text-sm text-muted-foreground line-through">
              ${course.compareAtPrice.toFixed(2)}
            </span>
          )}
          <span className="text-xl font-bold text-foreground">
            {course.price === 0 ? 'Free' : `$${course.price.toFixed(2)}`}
          </span>
        </div>

        {/* Enroll Button */}
        <Button
          onClick={handleEnroll}
          disabled={course.inStock === false || isEnrolling || isEnrolled}
          className="mt-4 w-full transition-all duration-200"
          size="sm"
        >
          {isEnrolling ? (
            <>
              <svg
                className="mr-2 h-4 w-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Enrolling...
            </>
          ) : course.inStock === false ? (
            'Enrollment Closed'
          ) : isEnrolled ? (
            <>
              <BookOpen className="mr-2 h-4 w-4" />
              Continue Learning
            </>
          ) : (
            <>
              <svg
                className="mr-2 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              {course.price === 0 ? 'Enroll Free' : 'Enroll Now'}
            </>
          )}
        </Button>

        {/* Limited Spots Warning */}
        {isLimitedSpots(course.inventory) && course.inStock !== false && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400"
          >
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span>Only {course.inventory} spots left - enroll soon!</span>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// Export both default and named for compatibility
export default CourseCard;
export { CourseCard };
