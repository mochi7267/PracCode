
import { getSession } from "./session.js";

function json(data, status = 200) {
  return Response.json(data, { status });
}

export async function handleAchievements(request, env, url) {
  if (
    url.pathname !== "/api/achievements" ||
    request.method !== "GET"
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

  try {
    const result = await env.DB.prepare(`
      SELECT
        a.achievement_id,
        a.achievement_name,
        a.description,
        a.icon,
        a.requirement,
        ua.unlocked_at,
        CASE
          WHEN ua.user_achievement_id IS NOT NULL THEN 1
          ELSE 0
        END AS is_unlocked
      FROM achievements a
      LEFT JOIN user_achievements ua
        ON a.achievement_id = ua.achievement_id
        AND ua.user_id = ?
      ORDER BY a.achievement_id ASC
    `)
      .bind(userId)
      .all();

    return json({
      success: true,
      achievements: result.results,
    });
  } catch (error) {
    console.error("Achievements error:", error);

    return json({
      success: false,
      message: "Unable to load achievements.",
    }, 500);
  }
}
