/**
 * OaaS Proxy Route (Cycles 83-84)
 *
 * Forwards requests to Cloudflare Worker with Better Auth headers
 * Appends X-Auth-User and X-Auth-Roles for role-based pricing
 */

import type { APIRoute } from "astro";
import { getSession } from "@/lib/auth/session";

export const prerender = false;

// Worker URL (update when deployed)
const WORKER_URL =
  import.meta.env.OAAS_WORKER_URL || "https://one.ie/oaas";

export const ALL: APIRoute = async ({ request, cookies, params }) => {
  const { path } = params;
  const url = new URL(request.url);

  // Get session from Better Auth
  const session = await getSession(cookies);

  // Build Worker URL with same path and query params
  const workerUrl = new URL(`/oaas/${path || ""}`, WORKER_URL);
  workerUrl.search = url.search;

  // Clone request headers
  const headers = new Headers(request.headers);

  // Add auth headers if session exists
  if (session.user) {
    headers.set("X-Auth-User", session.user.id);
    headers.set("X-Auth-Roles", (session.user.roles || []).join(","));
    headers.set("X-Auth-Email", session.user.email);
  }

  // Forward request to Worker
  try {
    const response = await fetch(workerUrl.toString(), {
      method: request.method,
      headers,
      body: request.method !== "GET" && request.method !== "HEAD"
        ? await request.text()
        : undefined,
    });

    // Clone response with original headers
    const responseHeaders = new Headers(response.headers);

    // Add CORS headers for frontend access
    responseHeaders.set("Access-Control-Allow-Origin", url.origin);
    responseHeaders.set("Access-Control-Allow-Credentials", "true");

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("OaaS Worker proxy error:", error);

    return new Response(
      JSON.stringify({
        error: "worker_unavailable",
        message: "OaaS Worker is currently unavailable. Please try again.",
      }),
      {
        status: 503,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
};
