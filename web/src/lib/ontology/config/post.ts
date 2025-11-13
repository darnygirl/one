/**
 * Post Thing Type - UI Configuration
 *
 * Defines how blog posts are rendered in the UI
 */

import type { ThingConfig } from "../types";

export const postConfig: ThingConfig = {
  type: "post",

  properties: {
    title: "",
    excerpt: "",
    content: "",
    coverImage: "",
    author: "",
    publishedAt: 0,
    readTime: 0,
    tags: [],
    views: 0,
    likes: 0,
    comments: 0,
    featured: false,
  },

  ui: {
    type: "post",

    fields: {
      coverImage: {
        component: "Image",
        aspect: "wide",
        lazy: true,
        placeholder: "/images/post-placeholder.jpg",
      },

      title: {
        component: "Heading",
        size: "2xl",
        weight: "bold",
        truncate: false,
      },

      excerpt: {
        component: "Text",
        size: "md",
        lines: 3,
        expandable: true,
      },

      content: {
        component: "Markdown",
        className: "prose prose-lg",
        expandable: true,
      },

      author: {
        component: "Text",
        icon: "User",
        size: "sm",
        color: "muted",
      },

      publishedAt: {
        component: "Date",
        format: "relative",
        icon: "Calendar",
        size: "sm",
        color: "muted",
      },

      readTime: {
        component: "Text",
        icon: "Clock",
        size: "sm",
        color: "muted",
        format: (minutes: number) => `${minutes} min read`,
      },

      tags: {
        component: "TagList",
        max: 5,
        color: "secondary",
      },

      views: {
        component: "Text",
        icon: "Eye",
        size: "sm",
        color: "muted",
        format: (count: number) => count.toLocaleString(),
      },

      likes: {
        component: "Text",
        icon: "Heart",
        size: "sm",
        color: "muted",
        format: (count: number) => count.toLocaleString(),
      },

      comments: {
        component: "Text",
        icon: "MessageSquare",
        size: "sm",
        color: "muted",
        format: (count: number) => `${count} comments`,
      },

      featured: {
        component: "Badge",
        label: "Featured",
        color: "default",
        showOnlyIf: "featured",
      },
    },

    views: {
      card: {
        fields: ["coverImage", "title", "excerpt", "author", "publishedAt", "readTime", "tags"],
        layout: "vertical",
      },

      list: {
        fields: ["coverImage", "title", "excerpt", "author", "publishedAt", "readTime"],
        layout: "horizontal",
      },

      detail: {
        fields: ["coverImage", "title", "author", "publishedAt", "readTime", "content", "tags", "views", "likes", "comments"],
        layout: "vertical",
      },

      table: {
        fields: ["title", "author", "publishedAt", "views", "likes", "comments"],
      },
    },

    actions: {
      primary: {
        action: "read",
        label: "Read Article",
        icon: "BookOpen",
        variant: "default",
      },

      secondary: [
        {
          action: "like",
          label: "Like",
          icon: "Heart",
          variant: "outline",
        },
        {
          action: "bookmark",
          label: "Save",
          icon: "Bookmark",
          variant: "ghost",
        },
      ],

      context: [
        {
          action: "share",
          label: "Share Article",
          icon: "Share2",
        },
        {
          action: "report",
          label: "Report",
          icon: "Flag",
        },
      ],
    },

    connections: {
      authored_by: {
        label: "by {name}",
        display: "avatar",
        icon: "User",
      },

      tagged_with: {
        label: "in {name}",
        display: "badge",
        max: 5,
      },

      commented_by: {
        label: "{count} comments",
        display: "badge",
        icon: "MessageSquare",
      },
    },

    empty: {
      icon: "FileText",
      title: "No posts yet",
      description: "Share your thoughts by writing your first post",
      action: {
        label: "Write Post",
        icon: "Plus",
        variant: "default",
      },
    },

    layouts: {
      grid: {
        columns: 2,
        gap: "lg",
        responsive: {
          sm: 1,
          md: 2,
          lg: 3,
        },
      },
    },
  },
};
