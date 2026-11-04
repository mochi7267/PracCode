
import bcrypt from "bcryptjs";

import {
  createSession,
  getSession,
  revokeSession,
  sessionCookie,
  clearSessionCookie,
} from "./session.js";

function json(data, status = 200, headers = {}) {
  return Response.json(data, { status, headers });
}

function getCookieSecurity(request) {
  const url = new URL(request.url);

  return (
    url.protocol === "https:" &&
    url.hostname !== "127.0.0.1" &&
    url.hostname !== "localhost"
  );
}

function cleanUser(user) {
  return {
    user_id: user.user_id,
    full_name: user.full_name,
    username: user.username,
    email: user.email,
    profile_picture: user.profile_picture,
    bio: user.bio,
    location: user.location,
    created_at: user.created_at,
  };
}

export async function handleAuth(request, env, url) {
  const path = url.pathname;
  const method = request.method;

  // REGISTER
  if (method === "POST" && path === "/api/auth/register") {
    let body;

    try {
      body = await request.json();
    } catch {
      return json(
        { success: false, message: "Invalid request data." },
        400
      );
    }

    const fullName = String(body.full_name || body.name || "").trim();
    const username = String(body.username || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    if (!fullName || !username || !email || !password) {
      return json(
        {
          success: false,
          message: "Please complete all required fields.",
        },
        400
      );
    }

    if (password.length < 8) {
      return json(
        {
          success: false,
          message: "Password must be at least 8 characters.",
        },
        400
      );
    }

    try {
      const existing = await env.DB.prepare(`
        SELECT user_id FROM users
        WHERE username = ? COLLATE NOCASE
           OR email = ? COLLATE NOCASE
        LIMIT 1
      `)
        .bind(username, email)
        .first();

      if (existing) {
        return json(
          {
            success: false,
            message: "Username or email is already registered.",
          },
          409
        );
      }

      const passwordHash = await bcrypt.hash(password, 12);

      const result = await env.DB.prepare(`
        INSERT INTO users (full_name, username, email, password)
        VALUES (?, ?, ?, ?)
      `)
        .bind(fullName, username, email, passwordHash)
        .run();

      const userId = result.meta.last_row_id;

      const user = await env.DB.prepare(
        "SELECT * FROM users WHERE user_id = ?"
      )
        .bind(userId)
        .first();

      if (!user) {
        throw new Error("Unable to retrieve the newly created account.");
      }

      const token = await createSession(
        userId,
        env.SESSION_SECRET,
        env.DB
      );

      return json(
        {
          success: true,
          message: "Account created successfully.",
          user: cleanUser(user),
        },
        201,
        {
          "Set-Cookie": sessionCookie(
            token,
            getCookieSecurity(request)
          ),
        }
      );
    } catch (error) {
      console.error("Registration error:", error);

      return json(
        {
          success: false,
          message: "Unable to create account.",
        },
        500
      );
    }
  }

  // LOGIN
  if (method === "POST" && path === "/api/auth/login") {
    let body;

    try {
      body = await request.json();
    } catch {
      return json(
        { success: false, message: "Invalid request data." },
        400
      );
    }

    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    if (!email || !password) {
      return json(
        {
          success: false,
          message: "Email and password are required.",
        },
        400
      );
    }

    try {
      const user = await env.DB.prepare(`
        SELECT * FROM users
        WHERE email = ? COLLATE NOCASE
        LIMIT 1
      `)
        .bind(email)
        .first();

      if (!user || !(await bcrypt.compare(password, user.password))) {
        return json(
          {
            success: false,
            message: "Invalid email or password.",
          },
          401
        );
      }

      const token = await createSession(
        user.user_id,
        env.SESSION_SECRET,
        env.DB
      );

      return json(
        {
          success: true,
          message: "Login successful.",
          user: cleanUser(user),
        },
        200,
        {
          "Set-Cookie": sessionCookie(
            token,
            getCookieSecurity(request)
          ),
        }
      );
    } catch (error) {
      console.error("Login error:", error);

      return json(
        {
          success: false,
          message: "Unable to log in.",
        },
        500
      );
    }
  }

  // CHECK SESSION
  if (method === "GET" && path === "/api/auth/session") {
    try {
      const userId = await getSession(
        request,
        env.SESSION_SECRET,
        env.DB
      );

      if (!userId) {
        return json(
          {
            success: false,
            authenticated: false,
          },
          401
        );
      }

      const user = await env.DB.prepare(
        "SELECT * FROM users WHERE user_id = ?"
      )
        .bind(userId)
        .first();

      if (!user) {
        return json(
          {
            success: false,
            authenticated: false,
          },
          401
        );
      }

      return json({
        success: true,
        authenticated: true,
        user: cleanUser(user),
      });
    } catch (error) {
      console.error("Session error:", error);

      return json(
        {
          success: false,
          message: "Unable to check session.",
        },
        500
      );
    }
  }

  // LOGOUT
  if (method === "POST" && path === "/api/auth/logout") {
    try {
      await revokeSession(request, env.DB);

      return json(
        {
          success: true,
          message: "Logged out successfully.",
        },
        200,
        {
          "Set-Cookie": clearSessionCookie(
            getCookieSecurity(request)
          ),
        }
      );
    } catch (error) {
      console.error("Logout error:", error);

      return json(
        {
          success: false,
          message: "Unable to log out.",
        },
        500
      );
    }
  }

  return null;
}
