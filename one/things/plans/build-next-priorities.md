---
title: Build Next - Priority Component Gaps
dimension: things
category: plans
tags: priorities, gaps, roadmap, mvp
related_dimensions: all
scope: global
created: 2025-01-13
version: 1.0.0
---

# 🎯 Build Next: Priority Component Gaps

**What to build next to complete the E-commerce & E-learning Suite**

> **TL;DR:** We have 200+ components (ahead of schedule!), but need 20 critical components to reach MVP. Focus on e-learning core: video player, quizzes, progress tracking, and course catalog.

---

## 📊 Progress Snapshot

```
OVERALL PROGRESS: 45% Complete
████████████████████░░░░░░░░░░░░░░░░░░░░  45/100 cycles

E-commerce:    ████████████████████░░  85% (17/20 cycles)
E-learning:    ██████████░░░░░░░░░░  52% (10/20 cycles)  ← FOCUS HERE
Landing Pages: ██████░░░░░░░░░░░░░░  30% (3/10 cycles)
Advanced:      ░░░░░░░░░░░░░░░░░░░░   0% (0/50 cycles)
```

**Key Insight:** E-commerce is nearly done (85%). E-learning needs attention (52%). Focus on e-learning MVP to achieve parity.

---

## 🔴 CRITICAL - Must Build for MVP (4 priorities)

### 1. 🎥 Video Player System (Cycles 33-34)

**Why Critical:** Core e-learning experience depends on video playback

**Components Needed:**
```
VideoPlayer/
├── VideoPlayer.tsx           # Main player component
├── VideoControls.tsx         # Play, pause, seek
├── VideoProgress.tsx         # Progress bar
├── VideoSettings.tsx         # Speed, quality
├── VideoTimestamp.tsx        # Timestamp links
└── VideoTranscript.tsx       # Synced transcript
```

**Features:**
- ▶️ Play/pause/seek controls
- ⏩ Playback speed (0.5x - 2x)
- 📱 Responsive (theater mode)
- 📊 Progress tracking integration
- 🎯 Timestamp links
- 📝 Synced transcript
- ⌨️ Keyboard shortcuts

**Reference:** Use VideoJS or Plyr as base, customize with shadcn/ui styling

**Effort:** 2 cycles (Medium complexity)

---

### 2. ❓ Quiz & Assessment System (Cycles 35-36)

**Why Critical:** Required for certificates and learning validation

**Components Needed:**
```
Quiz/
├── QuizQuestion.tsx          # Single question
├── QuizMultipleChoice.tsx    # MCQ variant
├── QuizTrueFalse.tsx         # True/false variant
├── QuizShortAnswer.tsx       # Text input variant
├── QuizResults.tsx           # Score display
├── QuizReview.tsx            # Review answers
└── QuizProgress.tsx          # Question progress
```

**Features:**
- ✅ Multiple question types (MCQ, T/F, Short answer)
- ⏱️ Timed quizzes (optional)
- 📊 Instant feedback
- 🎯 Score calculation
- 📈 Progress indicator
- 🔄 Retry logic
- 📝 Answer explanations

**Reference:** Similar pattern to existing `CheckoutProgress` component

**Effort:** 2 cycles (Medium complexity)

---

### 3. 📊 Progress Tracking (Cycles 37-38)

**Why Critical:** Users need to see completion status

**Components Needed:**
```
Progress/
├── CourseProgress.tsx        # Overall course %
├── LessonProgress.tsx        # Lesson completion
├── ProgressBar.tsx           # Visual bar
├── ProgressCircle.tsx        # Circular progress
├── CompletionBadge.tsx       # Completion indicator
└── ProgressTimeline.tsx      # Timeline view
```

**Features:**
- 📊 Course completion percentage
- ✅ Lesson completion checkmarks
- 🎯 Module progress
- ⏱️ Time spent tracking
- 📈 Progress history
- 🔔 Milestone notifications
- 📊 Visual progress indicators

**Reference:** Extend existing `ThingTimeline` component pattern

**Effort:** 2 cycles (Medium complexity)

---

### 4. 📚 Course Catalog (Cycles 29-30)

**Why Critical:** Users need to discover and browse courses

**Components Needed:**
```
Catalog/
├── CourseCard.tsx            # Course display card
├── CourseGrid.tsx            # Grid layout
├── CourseList.tsx            # List layout
├── CourseFilters.tsx         # Filter sidebar
├── CourseSearch.tsx          # Search bar
└── CourseSortDropdown.tsx    # Sort options
```

**Features:**
- 🎴 Course cards with thumbnails
- 🔍 Search by title/instructor
- 🎯 Filter by level/category/price
- 📊 Sort by popularity/rating/date
- 📱 Responsive grid
- ♾️ Infinite scroll / Pagination
- 🔖 Wishlist integration

**Reference:** Copy pattern from existing `ProductCard`, `ProductGrid`, `FilterSidebar`

**Effort:** 2 cycles (Low-Medium complexity) - Can reuse e-commerce patterns!

---

## 🟡 HIGH PRIORITY - MVP Enhancement (3 priorities)

### 5. 🎓 Certificates (Cycles 39-40)

**Why Important:** Motivation and validation for course completion

**Components Needed:**
```
Certificate/
├── Certificate.tsx           # Certificate display
├── CertificatePreview.tsx    # Preview modal
├── CertificateDownload.tsx   # PDF generation
├── CertificateVerify.tsx     # Verification page
└── CertificateBadge.tsx      # Mini badge display
```

**Features:**
- 📜 Beautiful certificate design
- 📥 PDF download (react-pdf)
- 🔗 Shareable link
- ✅ Verification system
- 🎨 Customizable templates
- 📧 Email delivery
- 🐦 Social sharing

**Reference:** Use react-pdf for PDF generation

**Effort:** 2 cycles (Medium-High complexity)

---

### 6. 📖 Lesson Content Renderer (Cycles 31-32)

**Why Important:** Core content delivery mechanism

**Components Needed:**
```
Lesson/
├── LessonViewer.tsx          # Main viewer
├── LessonContent.tsx         # Content renderer
├── LessonVideo.tsx           # Video lesson
├── LessonText.tsx            # Text lesson
├── LessonCode.tsx            # Code lesson
├── LessonResources.tsx       # Downloads/links
└── LessonNavigation.tsx      # Prev/next
```

**Features:**
- 📹 Video lessons (VideoPlayer integration)
- 📝 Text/Markdown lessons
- 💻 Code lessons with syntax highlighting
- 📎 Downloadable resources
- ⬅️➡️ Previous/Next navigation
- 🔖 Bookmarks
- 📝 Notes taking

**Reference:** Extend existing `Markdown` field component

**Effort:** 2 cycles (Medium complexity)

---

### 7. 🎯 Landing Block Variants (Cycles 41-50)

**Why Important:** Need variety for beautiful landing pages

**Components Needed:**
```
blocks/
├── hero/
│   ├── HeroSimple.tsx        # ✅ Exists as Hero.tsx
│   ├── HeroSplit.tsx         # ❌ Needs building
│   ├── HeroBackground.tsx    # ❌ Needs building
│   ├── HeroVideo.tsx         # ❌ Needs building
│   └── HeroAnimated.tsx      # ❌ Needs building
├── features/
│   ├── FeaturesGrid.tsx      # ✅ Exists as Features.tsx
│   ├── FeaturesCards.tsx     # ❌ Needs building
│   ├── FeaturesTabs.tsx      # ❌ Needs building
│   ├── FeaturesAccordion.tsx # ❌ Needs building
│   ├── FeaturesTimeline.tsx  # ❌ Needs building
│   └── FeaturesComparison.tsx # ❌ Needs building
├── testimonials/
│   ├── TestimonialSlider.tsx # ❌ Needs building
│   ├── TestimonialGrid.tsx   # ❌ Needs building
│   └── TestimonialWall.tsx   # ❌ Needs building
├── cta/
│   ├── CTASimple.tsx         # ✅ Exists as CTA.tsx
│   ├── CTASplit.tsx          # ❌ Needs building
│   ├── CTAFullWidth.tsx      # ❌ Needs building
│   └── CTAWithImage.tsx      # ❌ Needs building
├── stats/
│   ├── StatsGrid.tsx         # ❌ Needs building
│   ├── StatsCards.tsx        # ❌ Needs building (different from StatsCard)
│   └── StatsAnimated.tsx     # ❌ Needs building
└── team/
    ├── TeamGrid.tsx          # ❌ Needs building
    ├── TeamCards.tsx         # ❌ Needs building
    └── TeamCircular.tsx      # ❌ Needs building
```

**Status:**
- ✅ 4 components exist (Hero, Features, CTA, Footer)
- ❌ 21 components needed

**Reference:** Study existing course components for inspiration (HeroSection, KeyFeatures have good patterns)

**Effort:** 5 cycles (Low complexity, repetitive patterns)

---

## 🟢 MEDIUM PRIORITY - Growth Features (3 priorities)

### 8. 💳 Subscriptions (Cycles 51-52)

**Why Important:** Recurring revenue model

**Components Needed:**
```
Subscription/
├── SubscriptionPicker.tsx    # Plan selection
├── SubscriptionCard.tsx      # Plan card
├── SubscriptionUpgrade.tsx   # Upgrade flow
├── SubscriptionCancel.tsx    # Cancel flow
└── SubscriptionBilling.tsx   # Billing portal
```

**Features:**
- 💰 Stripe recurring payments
- 📅 Monthly/annual billing
- ⬆️ Upgrade/downgrade
- 🔄 Billing portal
- 📧 Payment notifications

**Reference:** Extend existing `PaymentForm` component

**Effort:** 2 cycles (Medium complexity)

---

### 9. 📦 Product Bundles (Cycles 53-54)

**Why Important:** Increase average order value

**Components Needed:**
```
Bundle/
├── BundleCard.tsx            # Bundle display
├── BundleBuilder.tsx         # Create bundle
├── BundleItems.tsx           # Items list
└── BundleSavings.tsx         # Savings display
```

**Features:**
- 📦 Pre-made bundles
- 🛠️ Custom bundles
- 💰 Bundle pricing
- 📊 Savings calculator
- ✅ Bundle validation

**Reference:** Extend existing `ProductCard` pattern

**Effort:** 2 cycles (Medium complexity)

---

### 10. 🎯 Upsells & Cross-sells (Cycles 55-56)

**Why Important:** Increase revenue per transaction

**Components Needed:**
```
Upsell/
├── UpsellModal.tsx           # Upsell popup
├── CrossSellCarousel.tsx     # Related products
├── FrequentlyBoughtTogether.tsx # FBT section
└── UpgradeSuggestion.tsx     # Upgrade prompts
```

**Features:**
- 🎁 One-click upsells
- 🔄 Related products
- 📦 Frequently bought together
- ⬆️ Upgrade suggestions
- 🎯 Smart recommendations

**Reference:** Extend existing `RecommendationsCarousel` component

**Effort:** 2 cycles (Medium complexity)

---

## 📋 Component Priority Matrix

| Priority | Component | Cycles | Complexity | Impact | Effort | ROI |
|----------|-----------|--------|------------|--------|--------|-----|
| 🔴 **1** | Video Player | 33-34 | Medium | 🔥🔥🔥🔥🔥 | 2 | ⭐⭐⭐⭐⭐ |
| 🔴 **2** | Quiz System | 35-36 | Medium | 🔥🔥🔥🔥🔥 | 2 | ⭐⭐⭐⭐⭐ |
| 🔴 **3** | Progress Tracking | 37-38 | Medium | 🔥🔥🔥🔥🔥 | 2 | ⭐⭐⭐⭐⭐ |
| 🔴 **4** | Course Catalog | 29-30 | Low-Med | 🔥🔥🔥🔥🔥 | 2 | ⭐⭐⭐⭐⭐ |
| 🟡 **5** | Certificates | 39-40 | Med-High | 🔥🔥🔥🔥 | 2 | ⭐⭐⭐⭐ |
| 🟡 **6** | Lesson Renderer | 31-32 | Medium | 🔥🔥🔥🔥 | 2 | ⭐⭐⭐⭐ |
| 🟡 **7** | Landing Blocks | 41-50 | Low | 🔥🔥🔥 | 5 | ⭐⭐⭐ |
| 🟢 **8** | Subscriptions | 51-52 | Medium | 🔥🔥🔥 | 2 | ⭐⭐⭐⭐ |
| 🟢 **9** | Bundles | 53-54 | Medium | 🔥🔥 | 2 | ⭐⭐⭐ |
| 🟢 **10** | Upsells | 55-56 | Medium | 🔥🔥 | 2 | ⭐⭐⭐ |

**Legend:**
- 🔴 Critical (MVP blockers)
- 🟡 High Priority (MVP enhancers)
- 🟢 Medium Priority (Growth features)

---

## 🎯 Recommended Build Order

### Sprint 1: E-learning MVP (2 weeks)

**Goal:** Reach 85% e-learning completion (parity with e-commerce)

```
Week 1:
✅ Cycle 29-30: Course Catalog (CourseCard, CourseGrid, CourseFilters)
✅ Cycle 33-34: Video Player System (VideoPlayer, Controls, Progress)

Week 2:
✅ Cycle 35-36: Quiz System (QuizQuestion, QuizResults, Multiple types)
✅ Cycle 37-38: Progress Tracking (CourseProgress, LessonProgress, Timeline)
```

**Outcome:** Complete e-learning MVP - courses can be created, browsed, watched, quizzed, and tracked.

---

### Sprint 2: Content & Polish (2 weeks)

**Goal:** Content delivery and course completion

```
Week 3:
✅ Cycle 31-32: Lesson Content Renderer (LessonViewer, Multiple content types)
✅ Cycle 39-40: Certificates (Certificate generation, PDF, Verification)

Week 4:
✅ Polish & testing
✅ Documentation updates
✅ Bug fixes
```

**Outcome:** Complete e-learning experience with certificates. 100% of core e-learning done.

---

### Sprint 3: Landing Page Variants (2 weeks)

**Goal:** Beautiful, varied landing page options

```
Week 5-6:
✅ Cycle 41-50: Landing Block Variants
  - 4 Hero variants
  - 5 Feature variants
  - 3 Testimonial variants
  - 3 CTA variants
  - 3 Stats variants
  - 3 Team variants
```

**Outcome:** 25+ landing blocks for gorgeous product/course pages.

---

### Sprint 4: Revenue Features (2 weeks)

**Goal:** Maximize revenue per customer

```
Week 7:
✅ Cycle 51-52: Subscriptions (Recurring payments, Stripe integration)
✅ Cycle 53-54: Product Bundles (Bundle builder, Savings display)

Week 8:
✅ Cycle 55-56: Upsells & Cross-sells (Upsell modals, FBT sections)
✅ Testing & optimization
```

**Outcome:** Advanced monetization features in place.

---

## 📊 What This Achieves

### After Sprint 1 (E-learning MVP):
```
E-commerce:    ████████████████████░░  85%  (unchanged)
E-learning:    ████████████████████░░  85%  (+33% improvement)
Landing Pages: ██████░░░░░░░░░░░░░░  30%  (unchanged)
Advanced:      ░░░░░░░░░░░░░░░░░░░░   0%  (unchanged)

OVERALL:       █████████████░░░░░░░░  60%  (+15% improvement)
```

### After Sprint 2 (Content & Polish):
```
E-commerce:    ████████████████████░░  85%
E-learning:    ████████████████████  100%  (+15% improvement)
Landing Pages: ██████░░░░░░░░░░░░░░  30%
Advanced:      ░░░░░░░░░░░░░░░░░░░░   0%

OVERALL:       ███████████████░░░░░░  65%  (+5% improvement)
```

### After Sprint 3 (Landing Blocks):
```
E-commerce:    ████████████████████░░  85%
E-learning:    ████████████████████  100%
Landing Pages: ████████████████████  100%  (+70% improvement)
Advanced:      ░░░░░░░░░░░░░░░░░░░░   0%

OVERALL:       ██████████████████░░░  75%  (+10% improvement)
```

### After Sprint 4 (Revenue Features):
```
E-commerce:    ████████████████████  100%  (+15% improvement)
E-learning:    ████████████████████  100%
Landing Pages: ████████████████████  100%
Advanced:      ██████░░░░░░░░░░░░░░  12%  (+12% improvement)

OVERALL:       ███████████████████░░  80%  (+5% improvement)
```

---

## 🎨 Design Patterns to Follow

### 1. Reuse E-commerce Patterns for Course Catalog

```typescript
// ProductCard pattern
<ProductCard product={product} />

// Should become CourseCard (same pattern!)
<CourseCard course={course} />

// ProductGrid → CourseGrid
// FilterSidebar → CourseFilters
// ProductSearch → CourseSearch
```

**Why:** We've already solved these problems for products. Copy the pattern!

### 2. Compose with Existing Components

```typescript
// Use existing shadcn/ui components
import { Card, Badge, Button } from "@/components/ui";
import { PriceDisplay, ReviewStars } from "@/components/ecommerce/static";

// Compose new components
function CourseCard({ course }) {
  return (
    <Card>
      <PriceDisplay price={course.price} />
      <ReviewStars rating={course.rating} />
      <Button>Enroll</Button>
    </Card>
  );
}
```

**Why:** Don't rebuild what exists. Compose with proven components.

### 3. Follow Interactive/Static Split

```typescript
// Static (server-rendered)
course/static/
├── CourseInfo.tsx
├── CourseStats.tsx
└── CourseDescription.tsx

// Interactive (client-side)
course/interactive/
├── CourseCard.tsx
├── EnrollButton.tsx
└── WishlistButton.tsx
```

**Why:** Matches existing e-commerce pattern, optimizes performance.

### 4. Use Ontology Config Pattern

```typescript
// Define course thing type config
export const courseConfig: ThingConfig = {
  type: "course",
  ui: {
    fields: {
      title: { component: "Heading", size: "xl" },
      price: { component: "Price", currency: "USD" },
      instructor: { component: "Text", icon: "User" },
      // ... more fields
    },
    views: {
      card: { fields: ["thumbnail", "title", "price", "instructor"] },
      list: { fields: ["title", "instructor", "level", "duration"] },
    },
  },
};
```

**Why:** Consistent with ontology system, enables universal rendering.

---

## 🚀 Quick Wins

### Can Build in < 1 Hour Each

1. **CourseCard** - Copy ProductCard, adjust props
2. **CourseGrid** - Copy ProductGrid, adjust types
3. **CourseFilters** - Copy FilterSidebar, adjust filters
4. **ProgressBar** - Use shadcn/ui Progress component
5. **CompletionBadge** - Use shadcn/ui Badge component

### Can Build in < 4 Hours Each

6. **VideoControls** - Standard play/pause/seek UI
7. **QuizMultipleChoice** - RadioGroup + Button
8. **LessonNavigation** - Previous/Next buttons
9. **CertificateBadge** - Badge with icon
10. **HeroSplit** - Copy Hero, adjust layout

**Total: 10 quick components in ~20 hours = 50% of MVP components!**

---

## 📚 Component Templates

### Template: CourseCard (Copy ProductCard)

```typescript
// web/src/components/course/interactive/CourseCard.tsx
'use client';

import { useState } from 'react';
import type { Course } from '@/types/course';
import { PriceDisplay } from '@/components/ecommerce/static/PriceDisplay';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface CourseCardProps {
  course: Course;
  showProgress?: boolean;
}

export function CourseCard({ course, showProgress = false }: CourseCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-lg border bg-card">
      {/* Thumbnail */}
      <img src={course.thumbnail} alt={course.title} className="aspect-video" />

      {/* Badge */}
      <Badge variant={course.level === 'beginner' ? 'secondary' : 'default'}>
        {course.level}
      </Badge>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-semibold">{course.title}</h3>
        <p className="text-sm text-muted-foreground">{course.instructor}</p>

        {showProgress && (
          <Progress value={course.progress} className="mt-2" />
        )}

        <div className="mt-4 flex items-center justify-between">
          <PriceDisplay price={course.price} currency="USD" />
          <Button>Enroll</Button>
        </div>
      </div>
    </div>
  );
}
```

### Template: VideoPlayer (Use VideoJS)

```typescript
// web/src/components/course/interactive/VideoPlayer.tsx
'use client';

import { useRef, useEffect } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
}

export function VideoPlayer({ src, poster, onProgress, onComplete }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    if (!videoRef.current) return;

    const player = videojs(videoRef.current, {
      controls: true,
      playbackRates: [0.5, 1, 1.5, 2],
      fluid: true,
    });

    player.on('timeupdate', () => {
      const progress = (player.currentTime() / player.duration()) * 100;
      onProgress?.(progress);
    });

    player.on('ended', () => {
      onComplete?.();
    });

    playerRef.current = player;

    return () => {
      player.dispose();
    };
  }, [src]);

  return (
    <div data-vjs-player>
      <video ref={videoRef} className="video-js" poster={poster}>
        <source src={src} type="video/mp4" />
      </video>
    </div>
  );
}
```

### Template: QuizMultipleChoice

```typescript
// web/src/components/course/interactive/QuizMultipleChoice.tsx
'use client';

import { useState } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface QuizMultipleChoiceProps {
  question: string;
  options: Option[];
  onAnswer: (isCorrect: boolean) => void;
}

export function QuizMultipleChoice({ question, options, onAnswer }: QuizMultipleChoiceProps) {
  const [selected, setSelected] = useState<string>();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    const selectedOption = options.find(o => o.id === selected);
    if (selectedOption) {
      setSubmitted(true);
      onAnswer(selectedOption.isCorrect);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{question}</h3>

      <RadioGroup value={selected} onValueChange={setSelected}>
        {options.map((option) => (
          <div key={option.id} className="flex items-center space-x-2">
            <RadioGroupItem value={option.id} id={option.id} disabled={submitted} />
            <Label htmlFor={option.id} className="flex-1">
              {option.text}
              {submitted && option.id === selected && (
                <Badge variant={option.isCorrect ? 'default' : 'destructive'} className="ml-2">
                  {option.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                </Badge>
              )}
            </Label>
          </div>
        ))}
      </RadioGroup>

      {!submitted && (
        <Button onClick={handleSubmit} disabled={!selected}>
          Submit Answer
        </Button>
      )}
    </div>
  );
}
```

---

## 🎉 Summary

### What We Have
- ✅ 200+ components (ahead of schedule!)
- ✅ Beautiful e-commerce suite (85% complete)
- ✅ Solid e-learning foundation (52% complete)
- ✅ Universal ontology UI system (100% complete)

### What We Need
- 🔴 4 critical component groups (MVP blockers)
- 🟡 3 high-priority groups (MVP enhancers)
- 🟢 3 medium-priority groups (growth features)

### How to Build It
- 🎯 Follow existing patterns (course = product patterns)
- 🎨 Compose with existing components
- 📋 Use component templates
- ⚡ Quick wins first (10 components in 20 hours)

### Timeline
- **Sprint 1 (2 weeks):** E-learning MVP → 60% overall
- **Sprint 2 (2 weeks):** Content & polish → 65% overall
- **Sprint 3 (2 weeks):** Landing blocks → 75% overall
- **Sprint 4 (2 weeks):** Revenue features → 80% overall

**🚀 8 weeks to 80% complete. Let's build!**

---

**Last Updated:** 2025-01-13
**Version:** 1.0.0
**Next Action:** Start Sprint 1, Cycle 29-30 (Course Catalog)
