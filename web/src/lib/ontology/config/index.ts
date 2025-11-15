/**
 * ONE Platform - Ontology UI Registry
 *
 * Central registry of all thing type configurations.
 * Import and add new configs here as you create more thing types.
 */

import type { OntologyUIRegistry, ThingType, ThingConfig } from "../types";
import { courseConfig } from "./course";
import { productConfig } from "./product";
import { postConfig } from "./post";

/**
 * Ontology UI Configuration Registry
 *
 * Maps thing types to their UI configurations.
 * This is the single source of truth for how things are rendered.
 */
export const ontologyUIRegistry: Partial<OntologyUIRegistry> = {
  course: courseConfig,
  product: productConfig,
  post: postConfig,
  // Add more configs here as you create them...
};

/**
 * Get UI configuration for a thing type
 *
 * @param type - The thing type (e.g., "course", "product", "post")
 * @returns The UI configuration for the thing type
 * @throws Error if no configuration found for the type
 */
export function getThingConfig(type: ThingType): ThingConfig {
  const config = ontologyUIRegistry[type];

  if (!config) {
    // Return minimal fallback config for unknown types
    console.warn(`No UI config found for thing type: ${type}`);
    return {
      type,
      properties: {},
      ui: {
        type,
        fields: {
          name: {
            component: "Heading",
            size: "lg",
          },
        },
        views: {
          card: {
            fields: ["name"],
          },
        },
        actions: {},
        empty: {
          icon: "Box",
          title: `No ${type}s yet`,
          description: `Get started by creating your first ${type}`,
        },
      },
    };
  }

  return config;
}

/**
 * Check if a thing type has a registered configuration
 */
export function hasThingConfig(type: ThingType): boolean {
  return type in ontologyUIRegistry;
}

/**
 * Get all registered thing types
 */
export function getRegisteredThingTypes(): ThingType[] {
  return Object.keys(ontologyUIRegistry) as ThingType[];
}
