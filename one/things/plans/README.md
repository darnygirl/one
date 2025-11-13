---
title: E-commerce & E-learning Suite - Planning Index
dimension: things
category: plans
tags: index, planning, roadmap, components
related_dimensions: all
scope: global
created: 2025-01-13
version: 1.0.0
---

# 📚 E-commerce & E-learning Suite Planning Index

**Your complete guide to building a world-class e-commerce and e-learning platform**

---

## 🎯 Quick Navigation

| Document | Purpose | When to Use |
|----------|---------|-------------|
| **[Quick Reference](./ecommerce-elearning-quick-reference.md)** | One-page overview | Starting out, quick lookup |
| **[100-Cycle Plan](./ecommerce-elearning-suite-100-cycles.md)** | Complete roadmap | Detailed planning, cycle execution |
| **[Component Inventory](./component-inventory-map.md)** | What we have | Understanding existing work |
| **[Build Next Priorities](./build-next-priorities.md)** | What to build | Sprint planning, prioritization |
| **This Index** | Navigation hub | Finding the right document |

---

## 📊 Current Status

```
OVERALL PROGRESS: 45% Complete
████████████████████░░░░░░░░░░░░░░░░░░░░  45/100 cycles

Components Built: 200+  (ahead of original 150 estimate!)
Lines of Code:    ~28,000 LOC
Production Ready: ✅ Yes
```

### By Category

| Category | Components | Completion | Status |
|----------|------------|------------|--------|
| 🛒 **E-commerce** | 44 | 85% | ✅ Nearly complete |
| 🎓 **E-learning** | 21 | 52% | 🔨 Needs MVP components |
| 🎯 **Landing Pages** | 4 | 30% | 🔨 Needs variants |
| 📱 **Dashboard** | 20 | 80% | ✅ Production ready |
| 🔮 **Ontology UI** | 25 | 100% | ✅ Complete |
| 🎨 **shadcn/ui** | 54 | 100% | ✅ Complete |
| 🎭 **Specialty** | 15+ | Varies | 🔨 Various states |

---

## 🗺️ Document Guide

### 1. Quick Reference (Start Here!)

**File:** [`ecommerce-elearning-quick-reference.md`](./ecommerce-elearning-quick-reference.md)

**What's Inside:**
- One-page mission overview
- Component categories (125+ components)
- 10 phases at a glance
- Tech stack summary
- Getting started paths
- Use case examples

**Best For:**
- ✅ First-time readers
- ✅ Quick lookups
- ✅ Sharing with team
- ✅ Understanding scope

**Read Time:** 5 minutes

---

### 2. 100-Cycle Plan (The Bible)

**File:** [`ecommerce-elearning-suite-100-cycles.md`](./ecommerce-elearning-suite-100-cycles.md)

**What's Inside:**
- Complete 100-cycle roadmap
- 10 phases × 10 cycles each
- Detailed deliverables per cycle
- Component specifications
- Integration patterns
- Launch checklist

**Best For:**
- ✅ Cycle-by-cycle execution
- ✅ Detailed planning
- ✅ Understanding dependencies
- ✅ Long-term roadmap

**Read Time:** 30-60 minutes (reference document)

---

### 3. Component Inventory Map (What We Have)

**File:** [`component-inventory-map.md`](./component-inventory-map.md)

**What's Inside:**
- Complete inventory of 200+ components
- Beautiful file system maps
- Component tables by category
- Dependency hierarchy
- Design patterns
- Integration points
- Mapping to 100-cycle plan

**Best For:**
- ✅ Understanding existing work
- ✅ Finding components
- ✅ Avoiding duplication
- ✅ Learning architecture

**Highlights:**
- 📊 Executive summary tables
- 🎨 Visual architecture layers
- 📁 Complete file system map
- 🎯 Component dependency map
- 📊 Progress analysis

**Read Time:** 15-20 minutes

---

### 4. Build Next Priorities (What to Build)

**File:** [`build-next-priorities.md`](./build-next-priorities.md)

**What's Inside:**
- 10 priority component gaps
- 4 critical MVP blockers
- Sprint planning (4 sprints)
- Component templates
- Quick wins list
- Design patterns
- ROI priority matrix
- Code examples

**Best For:**
- ✅ Sprint planning
- ✅ Prioritizing work
- ✅ Understanding gaps
- ✅ Getting started quickly

**Highlights:**
- 🔴 Critical priorities (video player, quizzes, progress, catalog)
- 🟡 High priorities (certificates, lesson renderer, landing blocks)
- 🟢 Medium priorities (subscriptions, bundles, upsells)
- ⚡ Quick wins (10 components in 20 hours)
- 📋 Ready-to-use templates

**Read Time:** 10-15 minutes

---

## 🚀 Getting Started Paths

### Path 1: "I'm New Here"

1. **Read:** [Quick Reference](./ecommerce-elearning-quick-reference.md) (5 min)
2. **Skim:** [Component Inventory](./component-inventory-map.md) (10 min)
3. **Review:** [Build Next Priorities](./build-next-priorities.md) (10 min)
4. **Start Building:** Pick a quick win from priorities doc

**Total Time:** 25 minutes to full context

---

### Path 2: "I Want to Build E-commerce"

1. **Review:** [Component Inventory → E-commerce Section](./component-inventory-map.md#-e-commerce-components-44-total) (5 min)
2. **Check:** Existing components in `web/src/components/ecommerce/`
3. **Reference:** `web/src/pages/shop/product-landing.astro` (beautiful example)
4. **Build:** Extend existing patterns

**Status:** 85% complete - nearly done!

---

### Path 3: "I Want to Build E-learning"

1. **Read:** [Build Next Priorities → Critical Section](./build-next-priorities.md#-critical---must-build-for-mvp-4-priorities) (10 min)
2. **Review:** [Component Inventory → E-learning Section](./component-inventory-map.md#-course--e-learning-components-21-total) (5 min)
3. **Start With:**
   - Cycle 29-30: Course Catalog (copy product patterns)
   - Cycle 33-34: Video Player (use VideoJS)
   - Cycle 35-36: Quiz System (use templates)
   - Cycle 37-38: Progress Tracking (extend Timeline)

**Status:** 52% complete - needs MVP focus

---

### Path 4: "I Want to Build Landing Pages"

1. **Review:** [Component Inventory → Landing Blocks](./component-inventory-map.md#-landing-page-blocks-4-core--extensible) (3 min)
2. **Check:** Existing components in `web/src/components/landing/`
3. **Reference:** Course components for patterns (`web/src/components/course/`)
4. **Build:** Hero/Feature/CTA variants (follow templates)

**Status:** 30% complete - need 21 more variants

---

### Path 5: "I'm Planning a Sprint"

1. **Review:** [Build Next Priorities → Sprint Planning](./build-next-priorities.md#-recommended-build-order) (5 min)
2. **Choose Sprint:**
   - Sprint 1: E-learning MVP (video, quiz, progress, catalog)
   - Sprint 2: Content & Polish (lesson renderer, certificates)
   - Sprint 3: Landing Variants (21 new blocks)
   - Sprint 4: Revenue Features (subscriptions, bundles, upsells)
3. **Use Templates:** Copy from priorities doc
4. **Track:** Update cycle progress in 100-cycle plan

**Each Sprint:** 2 weeks, clear deliverables

---

## 📚 Key Concepts

### The 6-Dimension Ontology

All components are built on the universal ontology:

1. **GROUPS** - Multi-tenant containers
2. **PEOPLE** - Users, creators, instructors
3. **THINGS** - Products, courses, posts (66+ types)
4. **CONNECTIONS** - Relationships between things
5. **EVENTS** - Audit trail (created, purchased, completed)
6. **KNOWLEDGE** - Labels, vectors, search

**Read:** `one/knowledge/ontology.md`

### The Cycle System

- **Cycle** = One concrete step (< 3k tokens)
- **Phase** = 10 cycles with common theme
- **100 Cycles** = Complete suite (start to launch)

**Benefits:**
- 98% context reduction (150k → 3k tokens)
- 5x faster execution
- Flawless execution ("do the next thing, perfectly")

**Read:** `one/knowledge/todo.md`

### Template-First Development

**CRITICAL PRINCIPLE:** Always reuse existing patterns.

```
User wants: "Course catalog"
✅ DO:  Copy ProductCard → CourseCard
❌ DON'T: Build from scratch
```

**Patterns to Reuse:**
- Product → Course
- Cart → Enrollment
- Wishlist → Saved Courses
- Reviews → Course Reviews

**Read:** Root `CLAUDE.md` → Template-First Development

---

## 🎯 Success Metrics

### Current State (2025-01-13)

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| **Components** | 150 | 200+ | ✅ 133% |
| **Lines of Code** | 15,000 | 28,000 | ✅ 187% |
| **E-commerce** | 100% | 85% | 🔨 Near target |
| **E-learning** | 100% | 52% | 🔨 Needs work |
| **Landing Pages** | 100% | 30% | 🔨 Needs work |
| **Ontology UI** | 100% | 100% | ✅ Complete |
| **Overall** | 100% | 45% | 🔨 On track |

### Next Milestone (Sprint 1 Complete)

- E-learning: 52% → 85% (+33%)
- Overall: 45% → 60% (+15%)
- MVP blockers: Cleared ✅

### Final Milestone (All 4 Sprints)

- E-commerce: 85% → 100%
- E-learning: 52% → 100%
- Landing Pages: 30% → 100%
- Overall: 45% → 80%

---

## 🎨 Architecture at a Glance

```
┌─────────────────────────────────────────────────────────────┐
│                    📱 PAGES & ROUTES                        │
│   /shop  /products  /courses  /learn  /dashboard           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│           🎭 FEATURE COMPONENTS (Business Logic)            │
│   E-commerce (44) • Course (21) • Shop (17) • More         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│            🔮 ONTOLOGY UI (Universal Renderer)              │
│   Card • Field • Actions • Layouts • Search (25 total)     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              🎨 shadcn/ui (Design System)                   │
│   Button • Card • Dialog • Form • 50+ more                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                ⚡ Radix UI Primitives                       │
│   Accessible, unstyled components                           │
└─────────────────────────────────────────────────────────────┘
```

**Key Principle:** Build up from foundation, compose complex from simple.

---

## 🔗 Related Documentation

### Core Documentation

| Document | Location | Purpose |
|----------|----------|---------|
| **Ontology Spec** | `one/knowledge/ontology.md` | 6-dimension model |
| **Architecture** | `one/knowledge/architecture.md` | System architecture |
| **Workflow** | `one/connections/workflow.md` | Development process |
| **Rules** | `one/knowledge/rules.md` | Golden rules |
| **CLAUDE.md** | Root directory | Claude Code instructions |

### Component Documentation

| Document | Location | Purpose |
|----------|----------|---------|
| **Ontology Components** | `web/src/components/ontology/COMPONENTS.md` | Ontology UI reference |
| **Product Landing** | `web/src/pages/shop/product-landing.astro` | Beautiful reference |
| **Template Guide** | `web/src/pages/shop/TEMPLATE-README.md` | Template usage |

### Example Applications

| Example | Location | Purpose |
|---------|----------|---------|
| **Shop Example** | `web/src/pages/shop/` | E-commerce reference |
| **Course Example** | `web/src/pages/courses/` (planned) | E-learning reference |
| **Ontology Demo** | `web/src/pages/ontology-demo.astro` | Universal renderer demo |

---

## 💡 Tips & Best Practices

### 1. Start with Existing Patterns

```
New Feature Request: "User wants course catalog"

✅ DO THIS:
1. Review component-inventory-map.md
2. Find similar: ProductCard, ProductGrid exist
3. Copy pattern: CourseCard = ProductCard with course props
4. Build in < 1 hour

❌ DON'T DO THIS:
1. Build from scratch
2. Reinvent the wheel
3. Spend hours on solved problems
```

### 2. Use the Priority Matrix

Priority order:
1. 🔴 **Critical** - MVP blockers (video, quiz, progress, catalog)
2. 🟡 **High** - MVP enhancers (certificates, lessons, landing blocks)
3. 🟢 **Medium** - Growth features (subscriptions, bundles, upsells)

Build in order. Don't jump to 🟢 before 🔴 is done.

### 3. Follow the Quick Wins

**10 components in 20 hours:**
- CourseCard (copy ProductCard)
- CourseGrid (copy ProductGrid)
- CourseFilters (copy FilterSidebar)
- ProgressBar (use shadcn Progress)
- CompletionBadge (use shadcn Badge)
- VideoControls (standard controls)
- QuizMultipleChoice (RadioGroup + Button)
- LessonNavigation (Prev/Next buttons)
- CertificateBadge (Badge + icon)
- HeroSplit (copy Hero, split layout)

**Result:** 50% of MVP components in 1 sprint!

### 4. Use Component Templates

Every priority in `build-next-priorities.md` has:
- ✅ Code template
- ✅ Component structure
- ✅ Props interface
- ✅ Implementation guide

**Copy, customize, ship.**

### 5. Compose, Don't Rebuild

```typescript
// ✅ GOOD - Compose with existing
function CourseCard({ course }) {
  return (
    <Card>
      <PriceDisplay price={course.price} />
      <ReviewStars rating={course.rating} />
      <Button>Enroll</Button>
    </Card>
  );
}

// ❌ BAD - Rebuild everything
function CourseCard({ course }) {
  return (
    <div>
      <div>${course.price}</div>  {/* rebuilding PriceDisplay */}
      <div>⭐⭐⭐⭐⭐</div>          {/* rebuilding ReviewStars */}
      <button>Enroll</button>    {/* rebuilding Button */}
    </div>
  );
}
```

---

## 🚀 Next Actions

### Right Now (Today)

1. ✅ **Read this index** - Orient yourself
2. ✅ **Pick a document** - Choose based on your path
3. ✅ **Review existing components** - See what we have
4. ✅ **Pick a quick win** - Start building

### This Week (Sprint Planning)

1. 🎯 **Review Build Next Priorities** - Understand gaps
2. 🎯 **Choose Sprint 1 or custom sprint** - Pick focus
3. 🎯 **Use templates** - Copy, don't rebuild
4. 🎯 **Ship MVP components** - Focus on critical path

### This Month (MVP Complete)

1. 🚀 **Complete Sprint 1** - E-learning MVP
2. 🚀 **Complete Sprint 2** - Content & polish
3. 🚀 **Reach 65% completion** - Major milestone
4. 🚀 **Launch e-learning beta** - Test with users

---

## 🎉 Summary

### What These Documents Give You

1. **Complete Visibility** - Know what exists (200+ components)
2. **Clear Priorities** - Know what to build (10 priority gaps)
3. **Proven Patterns** - Copy existing work (don't reinvent)
4. **Ready Templates** - Start coding immediately (copy & customize)
5. **Realistic Timeline** - 4 sprints to 80% (8 weeks)

### The Big Picture

```
We have MORE than we thought (200+ components)
We're AHEAD of schedule (45% at planning checkpoint)
We know EXACTLY what to build next (10 priorities)
We have TEMPLATES ready (quick wins + complex)
We can reach MVP in ONE MONTH (Sprint 1 + 2)
```

### Your Action Items

- [ ] Read Quick Reference (5 min)
- [ ] Review Component Inventory (15 min)
- [ ] Study Build Next Priorities (10 min)
- [ ] Pick a quick win (1 hour)
- [ ] Ship your first component (today!)

---

**🎨 Beautiful planning for beautiful products.**

**Last Updated:** 2025-01-13
**Version:** 1.0.0
**Status:** ✅ Planning Complete, Ready to Build

**Questions?** All documentation is in `/one/things/plans/` and `/one/knowledge/`
