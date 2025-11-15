/**
 * Course Thing Type - UI Configuration
 *
 * Defines how courses are rendered in the UI
 */

import type { ThingConfig } from "../types";

export const courseConfig: ThingConfig = {
  type: "course",

  properties: {
    title: "",
    description: "",
    thumbnail: "",
    price: 0,
    level: "beginner",
    duration: 0,
    instructor: "",
    tags: [],
    enrolled: 0,
    rating: 0,
    published: false,
  },

  ui: {
    type: "course",

    fields: {
      thumbnail: {
        component: "Image",
        aspect: "video",
        lazy: true,
        placeholder: "/images/course-placeholder.jpg",
      },

      title: {
        component: "Heading",
        size: "xl",
        weight: "bold",
        truncate: true,
      },

      description: {
        component: "Text",
        size: "sm",
        lines: 3,
        expandable: true,
      },

      price: {
        component: "Price",
        currency: "USD",
        format: "compact",
        badge: true,
        free: {
          label: "Free",
          badge: true,
        },
      },

      level: {
        component: "Badge",
        labels: {
          beginner: "Beginner",
          intermediate: "Intermediate",
          advanced: "Advanced",
        },
        colors: {
          beginner: "secondary",
          intermediate: "default",
          advanced: "destructive",
        },
        icon: "GraduationCap",
      },

      duration: {
        component: "Text",
        icon: "Clock",
        size: "sm",
        color: "muted",
        format: (minutes: number) => {
          const hours = Math.floor(minutes / 60);
          const mins = minutes % 60;
          return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
        },
      },

      instructor: {
        component: "Text",
        icon: "User",
        size: "sm",
        color: "muted",
      },

      tags: {
        component: "TagList",
        max: 3,
        color: "default",
        moreLabel: "+{count} more",
      },

      enrolled: {
        component: "Text",
        icon: "Users",
        size: "sm",
        color: "muted",
        format: (count: number) => `${count.toLocaleString()} students`,
      },

      rating: {
        component: "Text",
        icon: "Star",
        size: "sm",
        color: "muted",
        format: (rating: number) => rating.toFixed(1),
      },
    },

    views: {
      card: {
        fields: ["thumbnail", "title", "description", "instructor", "level", "duration", "price", "enrolled"],
        layout: "vertical",
      },

      list: {
        fields: ["thumbnail", "title", "instructor", "level", "duration", "enrolled", "price"],
        layout: "horizontal",
      },

      detail: {
        fields: "*", // All fields
        layout: "vertical",
      },

      table: {
        fields: ["title", "instructor", "level", "duration", "enrolled", "rating", "price"],
      },
    },

    actions: {
      primary: {
        action: "enroll",
        label: "Enroll Now",
        icon: "Check",
        variant: "default",
      },

      secondary: [
        {
          action: "preview",
          label: "Preview",
          icon: "Eye",
          variant: "outline",
        },
        {
          action: "share",
          label: "Share",
          icon: "Share2",
          variant: "ghost",
        },
      ],

      context: [
        {
          action: "bookmark",
          label: "Save for Later",
          icon: "Bookmark",
        },
        {
          action: "report",
          label: "Report Issue",
          icon: "Flag",
        },
      ],
    },

    connections: {
      enrolled_in: {
        label: "{count} students",
        display: "badge",
        icon: "Users",
      },

      taught_by: {
        label: "by {name}",
        display: "inline",
        icon: "User",
      },

      has_modules: {
        label: "{count} modules",
        display: "badge",
        icon: "BookOpen",
      },
    },

    empty: {
      icon: "BookOpen",
      title: "No courses yet",
      description: "Get started by creating your first course",
      action: {
        label: "Create Course",
        icon: "Plus",
        variant: "default",
      },
    },

    layouts: {
      grid: {
        columns: 3,
        gap: "lg",
        responsive: {
          sm: 1,
          md: 2,
          lg: 3,
          xl: 4,
        },
      },
    },
  },
};
