
import { getSession } from "./session.js";

function json(data, status = 200) {
  return Response.json(data, { status });
}

export async function handleLeaderboard(request, env, url) {
  if (
    url.pathname !== "/api/leaderboard" ||
    request.method !== "GET"
  ) {
    return null;
  }

  // Check whether the current user has an active session.
  const userId = await getSession(
    request,
    env.SESSION_SECRET,
    env.DB
  );

  const difficulty = url.searchParams.get("difficulty") || "All";

  const allowedDifficulties = [
    "All",
    "Easy",
    "Medium",
    "Hard",
    "Advanced",
  ];

  if (!allowedDifficulties.includes(difficulty)) {
    return json({
      success: false,
      message: "Invalid difficulty.",
    }, 400);
  }

  try {
    const filter =
      difficulty === "All" ? "" : "AND ps.difficulty = ?";

    const query = `
      SELECT
        u.user_id,
        u.full_name AS name,
        u.username,
        u.profile_picture,
        ps.language,
        ps.difficulty,
        ps.wpm,
        ps.accuracy,
        ps.created_at
      FROM practice_sessions ps
      INNER JOIN users u ON u.user_id = ps.user_id
      WHERE ps.session_id = (
        SELECT ps2.session_id
        FROM practice_sessions ps2
        WHERE ps2.user_id = ps.user_id
        ${difficulty === "All" ? "" : "AND ps2.difficulty = ?"}
        ORDER BY
          ps2.wpm DESC,
          ps2.accuracy DESC,
          ps2.created_at ASC
        LIMIT 1
      )
      ${filter}
      ORDER BY
        ps.wpm DESC,
        ps.accuracy DESC,
        ps.created_at ASC,
        u.user_id ASC
      LIMIT 100
    `;

    const statement = env.DB.prepare(query);

    const result = difficulty === "All"
      ? await statement.all()
      : await statement.bind(difficulty, difficulty).all();

    const rankings = result.results.map((row, index) => ({
      ...row,
      username: `@${row.username}`,
      rank: index + 1,
      isCurrentUser: Number(row.user_id) === Number(userId),
    }));

    return json({
      success: true,
      rankings,
      your_rank:
        rankings.find(row => row.isCurrentUser)?.rank || null,
    });
  } catch (error) {
    console.error("Leaderboard error:", error);

    return json({
      success: false,
      message: "Unable to load leaderboard.",
    }, 500);
  }
}
