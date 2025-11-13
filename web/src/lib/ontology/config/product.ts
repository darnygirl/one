/**
 * Product Thing Type - UI Configuration
 *
 * Defines how products are rendered in the UI
 */

import type { ThingConfig } from "../types";

export const productConfig: ThingConfig = {
  type: "product",

  properties: {
    name: "",
    description: "",
    image: "",
    price: 0,
    compareAtPrice: 0,
    inventory: 0,
    sku: "",
    tags: [],
    category: "",
    featured: false,
  },

  ui: {
    type: "product",

    fields: {
      image: {
        component: "Image",
        aspect: "square",
        lazy: true,
        fallback: "/images/product-placeholder.jpg",
      },

      name: {
        component: "Heading",
        size: "lg",
        weight: "semibold",
        truncate: true,
      },

      description: {
        component: "Text",
        size: "sm",
        lines: 2,
        expandable: true,
      },

      price: {
        component: "Price",
        currency: "USD",
        format: "full",
        size: "lg",
      },

      compareAtPrice: {
        component: "Price",
        currency: "USD",
        format: "full",
        size: "sm",
        strikethrough: true,
        showOnlyIf: "compareAtPrice",
      },

      inventory: {
        component: "Badge",
        labels: {
          0: "Out of Stock",
          default: "{value} in stock",
        },
        colors: {
          0: "destructive",
          default: "secondary",
        },
        format: (stock: number) => {
          if (stock === 0) return 0;
          if (stock < 10) return `Low stock: ${stock}`;
          return `${stock} in stock`;
        },
      },

      sku: {
        component: "Text",
        size: "xs",
        color: "muted",
        label: "SKU:",
      },

      tags: {
        component: "TagList",
        max: 4,
        color: "secondary",
      },

      category: {
        component: "Badge",
        variant: "outline",
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
        fields: ["image", "name", "description", "price", "compareAtPrice", "inventory"],
        layout: "vertical",
      },

      list: {
        fields: ["image", "name", "price", "inventory", "category"],
        layout: "horizontal",
      },

      detail: {
        fields: "*",
        layout: "vertical",
      },

      table: {
        fields: ["name", "sku", "category", "price", "inventory"],
      },
    },

    actions: {
      primary: {
        action: "addToCart",
        label: "Add to Cart",
        icon: "ShoppingCart",
        variant: "default",
      },

      secondary: [
        {
          action: "wishlist",
          label: "Add to Wishlist",
          icon: "Heart",
          variant: "outline",
        },
        {
          action: "quickView",
          label: "Quick View",
          icon: "Eye",
          variant: "ghost",
        },
      ],

      context: [
        {
          action: "share",
          label: "Share Product",
          icon: "Share2",
        },
        {
          action: "compare",
          label: "Add to Compare",
          icon: "BarChart3",
        },
      ],
    },

    connections: {
      purchased_by: {
        label: "{count} sold",
        display: "badge",
        icon: "ShoppingBag",
      },

      related_to: {
        label: "Related products",
        display: "list",
        max: 4,
      },
    },

    empty: {
      icon: "Package",
      title: "No products yet",
      description: "Start selling by adding your first product",
      action: {
        label: "Add Product",
        icon: "Plus",
        variant: "default",
      },
    },

    layouts: {
      grid: {
        columns: 4,
        gap: "md",
        responsive: {
          sm: 2,
          md: 3,
          lg: 4,
          xl: 5,
        },
      },
    },
  },
};
