
import { getSession } from "./session.js";

function json(data, status = 200) {
  return Response.json(data, { status });
}

export async function handleProfile(request, env, url) {
  const path = url.pathname;

  if (path !== "/api/auth/profile") {
    return null;
  }

  const userId = await getSession(
    request,
    env.SESSION_SECRET,
    env.DB
  );

  if (!userId) {
    return json({
      success: false,
      message: "Please log in first.",
    }, 401);
  }

  // GET PROFILE
  if (request.method === "GET") {
    const user = await env.DB.prepare(`
      SELECT
        user_id,
        full_name,
        username,
        email,
        profile_picture,
        bio,
        location,
        created_at
      FROM users
      WHERE user_id = ?
    `)
      .bind(userId)
      .first();

    if (!user) {
      return json({
        success: false,
        message: "User not found.",
      }, 404);
    }

    return json({
      success: true,
      user,
    });
  }

  // UPDATE PROFILE
  if (
    request.method === "PUT" ||
    request.method === "PATCH"
  ) {
    let body;

    try {
      body = await request.json();
    } catch {
      return json({
        success: false,
        message: "Invalid request data.",
      }, 400);
    }

    const fullName = String(
      body.full_name ?? body.name ?? ""
    ).trim();

    const username = String(
      body.username ?? ""
    ).trim();

    const bio = String(body.bio ?? "").trim();
    const location = String(body.location ?? "").trim();

    if (!fullName || !username) {
      return json({
        success: false,
        message: "Full name and username are required.",
      }, 400);
    }

    try {
      const existing = await env.DB.prepare(`
        SELECT user_id
        FROM users
        WHERE username = ? COLLATE NOCASE
          AND user_id != ?
        LIMIT 1
      `)
        .bind(username, userId)
        .first();

      if (existing) {
        return json({
          success: false,
          message: "That username is already taken.",
        }, 409);
      }

      await env.DB.prepare(`
        UPDATE users
        SET
          full_name = ?,
          username = ?,
          bio = ?,
          location = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `)
        .bind(
          fullName,
          username,
          bio,
          location,
          userId
        )
        .run();

      const user = await env.DB.prepare(`
        SELECT
          user_id,
          full_name,
          username,
          email,
          profile_picture,
          bio,
          location,
          created_at
        FROM users
        WHERE user_id = ?
      `)
        .bind(userId)
        .first();

      return json({
        success: true,
        message: "Profile updated successfully.",
        user,
      });
    } catch (error) {
      console.error("Profile update error:", error);

      return json({
        success: false,
        message: "Unable to update profile.",
      }, 500);
    }
  }

  return json({
    success: false,
    message: "Method not allowed.",
  }, 405);
}
