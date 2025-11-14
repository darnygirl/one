/**
 * Better Auth Session Helper (Cycles 83-84)
 *
 * Gets current user session from auth_token cookie
 * Extracts userId and roles for OaaS authorization
 */

import type { AstroCookies } from "astro";
import { ConvexHttpClient } from "convex/browser";

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  role?: "platform_owner" | "staff" | "pro" | "customer";
  roles?: string[]; // For multi-role support
}

export interface Session {
  user: SessionUser | null;
  token: string | null;
}

const convex = new ConvexHttpClient(
  import.meta.env.PUBLIC_CONVEX_URL || import.meta.env.NEXT_PUBLIC_CONVEX_URL
);

/**
 * Get current session from Better Auth cookie
 */
export async function getSession(cookies: AstroCookies): Promise<Session> {
  const token = cookies.get("auth_token")?.value;

  if (!token) {
    return { user: null, token: null };
  }

  try {
    // Query Convex for user details
    const user = await convex.query("auth:getCurrentUser" as any, { token });

    if (!user) {
      return { user: null, token: null };
    }

    // Map Convex user to SessionUser
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name || null,
        role: user.role || "customer", // Default to customer
        roles: user.roles || [user.role || "customer"],
      },
      token,
    };
  } catch (error) {
    console.error("Session error:", error);
    return { user: null, token: null };
  }
}

/**
 * Get role-based price multiplier for OaaS
 *
 * - platform_owner: 0 (free)
 * - staff: 0 (free)
 * - pro: 0.5 (50% discount)
 * - customer: 1.0 (full price)
 */
export function getRolePriceMultiplier(role?: string): number {
  switch (role) {
    case "platform_owner":
    case "staff":
      return 0; // Free for internal users
    case "pro":
      return 0.5; // 50% discount for pro users
    case "customer":
    default:
      return 1.0; // Full price
  }
}

/**
 * Check if user has required role
 */
export function hasRole(
  user: SessionUser | null,
  requiredRole: string
): boolean {
  if (!user) return false;
  return user.roles?.includes(requiredRole) || user.role === requiredRole;
}
