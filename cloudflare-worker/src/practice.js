
import { getSession } from "./session.js";

function json(data, status = 200) {
  return Response.json(data, { status });
}

export async function handlePractice(request, env, url) {
  const path = url.pathname;
  const method = request.method;

  // Only handle supported practice routes.
  const isSessionsRoute = path === "/api/practice/sessions";
  const isStatsRoute = path === "/api/practice/stats";

  if (
    !isSessionsRoute &&
    !isStatsRoute
  ) {
    return null;
  }

  if (
    (isSessionsRoute && !["GET", "POST"].includes(method)) ||
    (isStatsRoute && method !== "GET")
  ) {
    return null;
  }

  // Verify that the session is active in D1.
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

  // Get practice history.
  if (isSessionsRoute && method === "GET") {
    const result = await env.DB.prepare(`
      SELECT *
      FROM practice_sessions
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 50
    `)
      .bind(userId)
      .all();

    return json({
      success: true,
      sessions: result.results,
    });
  }

  // Save a practice session.
  if (isSessionsRoute && method === "POST") {
    let body;

    try {
      body = await request.json();
    } catch {
      return json({
        success: false,
        message: "Invalid request data.",
      }, 400);
    }

    const language = String(body.language || "HTML").trim();
    const difficulty = String(body.difficulty || "Easy").trim();
    const duration = Number(body.duration_seconds);
    const wpm = Number(body.wpm);
    const accuracy = Number(body.accuracy);
    const errors = Number(body.errors);

    if (
      !Number.isInteger(duration) ||
      duration < 1 ||
      duration > 180 ||
      !Number.isInteger(wpm) ||
      wpm < 0 ||
      !Number.isFinite(accuracy) ||
      accuracy < 0 ||
      accuracy > 100 ||
      !Number.isInteger(errors) ||
      errors < 0
    ) {
      return json({
        success: false,
        message: "Invalid practice session values.",
      }, 400);
    }

    const result = await env.DB.prepare(`
      INSERT INTO practice_sessions
      (
        user_id,
        language,
        difficulty,
        duration_seconds,
        wpm,
        accuracy,
        errors
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)
      .bind(
        userId,
        language,
        difficulty,
        duration,
        wpm,
        accuracy,
        errors
      )
      .run();

    return json({
      success: true,
      message: "Practice session saved.",
      session_id: result.meta.last_row_id,
    }, 201);
  }

  // Get practice statistics.
  if (isStatsRoute && method === "GET") {
    const stats = await env.DB.prepare(`
      SELECT
        COUNT(*) AS total_sessions,
        COALESCE(ROUND(AVG(wpm), 2), 0) AS average_wpm,
        COALESCE(ROUND(AVG(accuracy), 2), 0) AS average_accuracy,
        COALESCE(SUM(duration_seconds), 0) AS total_duration
      FROM practice_sessions
      WHERE user_id = ?
    `)
      .bind(userId)
      .first();

    return json({
      success: true,
      stats,
    });
  }

  return null;
}
