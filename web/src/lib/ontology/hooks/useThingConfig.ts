/**
 * useThingConfig Hook
 *
 * Returns the UI configuration for a given thing type.
 * This is the primary hook used by the Card component to determine
 * how to render a thing.
 */

import { type ThingType, type ThingConfig } from "../types";
import { getThingConfig } from "../config";
import { useMemo } from "react";

/**
 * Get UI configuration for a thing type
 *
 * @param type - The thing type (e.g., "course", "product", "post")
 * @returns The complete UI configuration for the thing type
 *
 * @example
 * ```tsx
 * const config = useThingConfig("course");
 * console.log(config.ui.fields.title); // { component: "Heading", size: "xl", ... }
 * ```
 */
export function useThingConfig(type: ThingType): ThingConfig {
  const config = useMemo(() => {
    return getThingConfig(type);
  }, [type]);

  return config;
}
