---
title: E-commerce & E-learning Suite - Quick Reference
dimension: things
category: plans
tags: ecommerce, elearning, quick-reference
related_dimensions: all
scope: global
created: 2025-01-13
version: 1.0.0
---

# E-commerce & E-learning Suite - Quick Reference

**One-page overview of the 100-cycle plan**

---

## 🎯 Mission

Build a complete component suite for selling products and delivering courses, with beautiful landing pages.

**Total:** 150+ components, 15,000+ lines of TypeScript

---

## 📦 What Gets Built

### E-commerce (40 cycles)
- ✅ Product catalog & detail pages
- ✅ Shopping cart & checkout
- ✅ Stripe payments
- ✅ Order management
- ✅ Reviews & ratings
- ✅ Wishlist & favorites
- ✅ Inventory tracking
- ✅ Digital product delivery
- ✅ Subscriptions & bundles
- ✅ Discount codes

### E-learning (30 cycles)
- ✅ Course catalog & detail pages
- ✅ Video lessons & player
- ✅ Quizzes & assessments
- ✅ Progress tracking
- ✅ Certificates
- ✅ Student dashboard
- ✅ Instructor dashboard
- ✅ Course builder
- ✅ Discussions & Q&A
- ✅ Learning paths

### Landing Pages (10 cycles)
- ✅ Hero blocks (5 variants)
- ✅ Feature blocks (6 variants)
- ✅ Pricing tables
- ✅ Testimonials
- ✅ CTAs
- ✅ Stats & metrics
- ✅ Team sections
- ✅ FAQ blocks
- ✅ Newsletter forms
- ✅ Footer & navigation

### Advanced Features (20 cycles)
- ✅ Gamification (badges, points)
- ✅ Affiliate system
- ✅ Analytics & insights
- ✅ A/B testing
- ✅ Email marketing
- ✅ Multi-currency
- ✅ Multi-language
- ✅ SEO optimization
- ✅ Accessibility (WCAG AA)
- ✅ Mobile optimization

---

## 🗓️ 10 Phases

| Phase | Cycles | Focus | Deliverables |
|-------|--------|-------|--------------|
| **1** | 1-10 | E-commerce Foundation | Products, inventory, search |
| **2** | 11-20 | Cart & Checkout | Shopping cart, Stripe, orders |
| **3** | 21-30 | E-learning Foundation | Courses, lessons, enrollment |
| **4** | 31-40 | Course Delivery | Player, progress, certificates |
| **5** | 41-50 | Landing Pages | Hero, features, pricing, CTAs |
| **6** | 51-60 | Advanced E-commerce | Bundles, subscriptions, analytics |
| **7** | 61-70 | Advanced E-learning | Paths, gamification, AI features |
| **8** | 71-80 | Marketing | SEO, email, referrals, loyalty |
| **9** | 81-90 | Integration & Polish | Testing, docs, performance |
| **10** | 91-100 | Launch | Deployment, demos, release |

---

## 🏗️ Component Categories

### Products & Commerce (35 components)
```
ProductCard, ProductDetail, ProductGallery, VariantSelector,
CartDrawer, CartItem, CheckoutWizard, PaymentForm,
OrderStatus, OrderTracking, ReviewList, ReviewForm,
WishlistPage, InventoryTracker, BundleBuilder, etc.
```

### Courses & Learning (30 components)
```
CourseCard, CourseDetail, CoursePlayer, VideoPlayer,
LessonContent, QuizQuestion, QuizResults, ProgressBar,
Certificate, StudentDashboard, InstructorDashboard,
CourseBuilder, DiscussionThread, NotesEditor, etc.
```

### Landing Page Blocks (25 components)
```
HeroSimple, HeroSplit, HeroBackground, HeroVideo,
FeaturesGrid, FeatureCards, PricingTable, PricingCard,
TestimonialSlider, CTABanner, CTASplit, StatsGrid,
TeamGrid, FAQAccordion, NewsletterForm, FooterMultiColumn, etc.
```

### Advanced Features (20 components)
```
SearchAutocomplete, FilterPanel, SortDropdown,
InfiniteScroll, AffiliateLinks, LeaderboardCard,
BadgeDisplay, ChatWidget, ExitIntentModal,
CountdownTimer, AnalyticsDashboard, etc.
```

### Support & Admin (15 components)
```
AdminDashboard, UserManagement, AnalyticsOverview,
ErrorBoundary, LoadingStates, EmptyStates,
SuccessMessages, ErrorMessages, etc.
```

---

## 🎨 Design System

### Built on shadcn/ui
- Card, Button, Badge, Avatar
- Dialog, Drawer, Sheet
- Form, Input, Select, Checkbox
- Table, Tabs, Accordion
- All Radix UI primitives

### Custom Components
- VideoPlayer (custom controls)
- CoursePlayer (theater mode)
- ProductGallery (lightbox)
- CheckoutWizard (multi-step)
- CertificateGenerator (PDF)

---

## 💻 Tech Stack

**Frontend:**
- Astro 5 (SSR + Islands)
- React 19 (Interactive components)
- shadcn/ui (Component library)
- Tailwind v4 (Styling)
- Framer Motion (Animations)

**Backend:**
- Convex (Database + Real-time)
- Effect.ts (Business logic)
- Better Auth (Authentication)

**Integrations:**
- Stripe (Payments + Subscriptions)
- Resend (Transactional email)
- Cloudflare Pages (Hosting)
- Google Analytics 4 (Analytics)

---

## 📊 Key Metrics

**Performance:**
- Lighthouse score: 90+ on all pages
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Bundle size: < 200KB (gzipped)

**Quality:**
- Test coverage: 80%+
- WCAG AA compliant
- Mobile-first responsive
- TypeScript 100%

**Scale:**
- 150+ components
- 15,000+ lines of code
- 100% documented
- Production-ready

---

## 🚀 Getting Started

### Phase 1 (Cycles 1-10)
Start here for e-commerce basics:

```bash
# Cycle 1: Product Schema
web/src/lib/ontology/types/product.ts

# Cycle 2: Product Components
web/src/components/ecommerce/products/

# Cycle 3: Product Detail Page
web/src/pages/products/[id].astro
```

### Phase 3 (Cycles 21-30)
Start here for e-learning basics:

```bash
# Cycle 21: Course Schema
web/src/lib/ontology/types/course.ts

# Cycle 22: Course Components
web/src/components/elearning/courses/

# Cycle 23: Course Detail Page
web/src/pages/courses/[id].astro
```

### Phase 5 (Cycles 41-50)
Start here for landing pages:

```bash
# Cycle 41: Hero Blocks
web/src/components/blocks/hero/

# Cycle 43: Pricing Tables
web/src/components/blocks/pricing/

# Cycle 45: CTA Blocks
web/src/components/blocks/cta/
```

---

## 🎯 Use Cases

### E-commerce Store
**Cycles needed:** 1-20, 51-60
**Components:** 50+
**Examples:**
- Physical products (clothing, books)
- Digital products (ebooks, templates)
- Subscriptions (monthly boxes)

### Online Course Platform
**Cycles needed:** 21-40, 61-70
**Components:** 40+
**Examples:**
- Video courses
- Live cohorts
- Certification programs

### Hybrid Platform
**Cycles needed:** All 100 cycles
**Components:** 150+
**Examples:**
- Course + supporting products
- Membership + exclusive content
- SaaS + educational resources

### Product Landing Page
**Cycles needed:** 41-50, 71-80
**Components:** 30+
**Examples:**
- SaaS product page
- Course launch page
- Event registration

---

## 📁 Directory Structure

```
web/src/
├── components/
│   ├── ontology/          # ✅ Already built (30 components)
│   ├── ecommerce/         # 🔨 Phase 1-2, 6 (50 components)
│   │   ├── products/      # Catalog, detail, reviews
│   │   ├── cart/          # Cart, checkout
│   │   ├── checkout/      # Payment, shipping
│   │   ├── orders/        # Order tracking
│   │   └── admin/         # Product management
│   ├── elearning/         # 🔨 Phase 3-4, 7 (40 components)
│   │   ├── courses/       # Catalog, detail
│   │   ├── lessons/       # Video, text, quiz
│   │   ├── progress/      # Tracking, certificates
│   │   ├── student/       # Dashboard, notes
│   │   └── instructor/    # Dashboard, builder
│   └── blocks/            # 🔨 Phase 5, 8 (30 components)
│       ├── hero/          # 5 hero variants
│       ├── features/      # Feature showcases
│       ├── pricing/       # Pricing tables
│       ├── testimonials/  # Social proof
│       ├── cta/           # Conversion blocks
│       ├── stats/         # Metrics display
│       ├── team/          # Team sections
│       ├── faq/           # FAQ sections
│       └── footer/        # Site footers
│
├── lib/
│   ├── services/          # Effect.ts business logic
│   │   ├── ProductService.ts
│   │   ├── CartService.ts
│   │   ├── CourseService.ts
│   │   ├── EnrollmentService.ts
│   │   └── PaymentService.ts
│   └── utils/
│       ├── pricing.ts     # Price calculations
│       ├── progress.ts    # Progress tracking
│       └── formatting.ts  # Display helpers
│
└── pages/
    ├── products/
    │   ├── index.astro    # Product catalog
    │   └── [id].astro     # Product detail
    ├── courses/
    │   ├── index.astro    # Course catalog
    │   ├── [id].astro     # Course detail
    │   └── learn/
    │       └── [id].astro # Course player
    ├── cart.astro
    ├── checkout.astro
    └── dashboard/
        ├── student.astro
        └── instructor.astro
```

---

## 🎁 Bonus Features

**Included in the plan:**
- Dark mode support
- Mobile optimization
- Accessibility (WCAG AA)
- SEO optimization
- Performance optimization
- Analytics integration
- Email notifications
- Multi-currency
- Multi-language
- Offline support
- PWA ready

---

## 📚 Documentation Deliverables

1. **Component Library** (Cycle 93)
   - Live component gallery
   - Interactive demos
   - Code examples

2. **Getting Started Guide** (Cycle 92)
   - Installation
   - First product
   - First course

3. **Video Tutorials** (Cycle 94)
   - Setup walkthrough
   - E-commerce tutorial
   - E-learning tutorial

4. **API Reference** (Cycle 81)
   - All components documented
   - Props & types
   - Usage patterns

5. **Migration Guide** (Cycle 95)
   - Import from Shopify
   - Import from Teachable
   - CSV import

---

## ✅ Launch Checklist (Cycle 99)

### Security
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] Rate limiting
- [ ] Input sanitization
- [ ] Secure headers

### Performance
- [ ] Lighthouse 90+
- [ ] Bundle size optimized
- [ ] Images optimized
- [ ] Code splitting
- [ ] Lazy loading

### Accessibility
- [ ] WCAG AA compliant
- [ ] Screen reader tested
- [ ] Keyboard navigation
- [ ] Color contrast
- [ ] Focus management

### SEO
- [ ] Meta tags
- [ ] Structured data
- [ ] Sitemap
- [ ] Robots.txt
- [ ] Open Graph

### Legal
- [ ] Terms of service
- [ ] Privacy policy
- [ ] Cookie consent
- [ ] GDPR compliance
- [ ] PCI compliance (Stripe)

---

## 🎉 Launch Day (Cycle 100)

**Deliverables:**
- 🚀 Live production site
- 📦 npm package published
- 📖 Documentation site live
- 🎥 Tutorial videos published
- 📢 Press release
- 🐦 Social media announcement
- 📧 Email to community
- 🏷️ Version 1.0.0 tag

---

**Ready to build the future of e-commerce and e-learning!** 🚀

[View Full Plan](./ecommerce-elearning-suite-100-cycles.md)
