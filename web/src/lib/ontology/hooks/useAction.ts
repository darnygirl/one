/**
 * useAction Hook
 *
 * Executes actions on things (e.g., enroll, purchase, delete).
 * This hook will integrate with Effect.ts services and Convex mutations
 * when the backend is ready.
 */

import { useState } from "react";
import { type Thing } from "../types";

/**
 * Hook for executing actions on things
 *
 * @returns Object with executeAction function and loading state
 *
 * @example
 * ```tsx
 * const { executeAction, loading } = useAction();
 * await executeAction("enroll", course);
 * ```
 */
export function useAction() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const executeAction = async (action: string, thing: Thing) => {
    setLoading(true);
    setError(null);

    try {
      // TODO: Implement actual action execution via Effect.ts services
      // const program = Effect.gen(function* () {
      //   const service = yield* ThingService;
      //   return yield* service.executeAction(action, thing._id);
      // });
      // await run(program);

      // For now, just log the action
      console.log(`Executing action: ${action} on thing: ${thing._id}`);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Handle common actions
      switch (action) {
        case "enroll":
        case "purchase":
        case "addToCart":
          // Navigate to checkout
          window.location.href = `/checkout?thing=${thing._id}&action=${action}`;
          break;

        case "preview":
        case "read":
        case "quickView":
          // Navigate to detail page
          window.location.href = `/${thing.type}/${thing._id}`;
          break;

        case "edit":
          // Navigate to edit page
          window.location.href = `/edit/${thing.type}/${thing._id}`;
          break;

        case "delete":
          // Call delete mutation
          // await mutate(api.things.delete, { id: thing._id });
          console.log("Delete thing:", thing._id);
          break;

        case "share":
          // Use Web Share API
          if (navigator.share) {
            await navigator.share({
              title: thing.name,
              url: window.location.href,
            });
          }
          break;

        case "bookmark":
        case "wishlist":
        case "like":
          // Toggle state
          // await mutate(api.things.toggleFlag, { id: thing._id, flag: action });
          console.log("Toggle:", action, thing._id);
          break;

        default:
          console.warn(`Unknown action: ${action}`);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      console.error("Action failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { executeAction, loading, error };
}
