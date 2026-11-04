
import { handleAuth } from "./auth.js";
import { handlePractice } from "./practice.js";
import { handleLeaderboard } from "./leaderboard.js";
import { handleProfile } from "./profile.js";
import { handleAchievements } from "./achievements.js";
import { handleSettings } from "./settings.js";

const ALLOWED_ORIGIN = "https://praccode.pages.dev";

function addCorsHeaders(response, origin) {
  const headers = new Headers(response.headers);

  if (origin === ALLOWED_ORIGIN) {
    headers.set("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
    headers.set("Access-Control-Allow-Credentials", "true");
    headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, PATCH, DELETE, OPTIONS"
    );
    headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
    headers.set("Vary", "Origin");
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin");

    try {
      // Handle CORS preflight requests.
      if (request.method === "OPTIONS") {
        return addCorsHeaders(
          new Response(null, { status: 204 }),
          origin
        );
      }

      // API health check.
      if (url.pathname === "/api/health") {
        return addCorsHeaders(
          Response.json({
            success: true,
            message: "PracCode API is running!",
          }),
          origin
        );
      }

      // Database connection test.
      if (url.pathname === "/api/db-test") {
        const result = await env.DB
          .prepare("SELECT COUNT(*) AS total FROM users")
          .first();

        return addCorsHeaders(
          Response.json({
            success: true,
            database: "Connected",
            users: result.total,
          }),
          origin
        );
      }

      // API route handlers.
      const handlers = [
        handleAuth,
        handlePractice,
        handleLeaderboard,
        handleProfile,
        handleAchievements,
        handleSettings,
      ];

      for (const handler of handlers) {
        const response = await handler(request, env, url);

        if (response) {
          return addCorsHeaders(response, origin);
        }
      }

      // Route not found.
      return addCorsHeaders(
        Response.json({
          success: false,
          message: "Route not found",
        }, { status: 404 }),
        origin
      );

    } catch (error) {
      console.error("API Error:", error);

      return addCorsHeaders(
        Response.json({
          success: false,
          message: "Internal server error.",
        }, { status: 500 }),
        origin
      );
    }
  },
};
