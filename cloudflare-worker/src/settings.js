
import { getSession } from "./session.js";

function json(data, status = 200) {
  return Response.json(data, { status });
}

export async function handleSettings(request, env, url) {
  if (url.pathname !== "/api/settings") {
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

  // GET SETTINGS
  if (request.method === "GET") {
    const settings = await env.DB.prepare(`
      SELECT theme, sound_effects, font_size
      FROM user_settings
      WHERE user_id = ?
      LIMIT 1
    `)
      .bind(userId)
      .first();

    return json({
      success: true,
      settings: settings || {
        theme: "light",
        sound_effects: 1,
        font_size: "medium",
      },
    });
  }

  // UPDATE SETTINGS
  if (
    request.method === "PUT" ||
    request.method === "PATCH"
  ) {
    let body;

    try {
      body = await request.json();
    } catch (error) {
      console.error("Settings JSON parsing error:", error);

      return json({
        success: false,
        message: "Invalid request data.",
      }, 400);
    }

    const theme = String(body.theme || "light");
    const soundEffects = Number(body.sound_effects ?? 1);
    const fontSize = String(body.font_size || "medium");

    if (!["light", "dark"].includes(theme)) {
      return json({
        success: false,
        message: "Invalid theme.",
      }, 400);
    }

    if (![0, 1].includes(soundEffects)) {
      return json({
        success: false,
        message: "Invalid sound setting.",
      }, 400);
    }

    if (!["small", "medium", "large"].includes(fontSize)) {
      return json({
        success: false,
        message: "Invalid font size.",
      }, 400);
    }

    try {
      await env.DB.prepare(`
        INSERT INTO user_settings
          (user_id, theme, sound_effects, font_size)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(user_id) DO UPDATE SET
          theme = excluded.theme,
          sound_effects = excluded.sound_effects,
          font_size = excluded.font_size,
          updated_at = CURRENT_TIMESTAMP
      `)
        .bind(userId, theme, soundEffects, fontSize)
        .run();

      return json({
        success: true,
        message: "Settings saved successfully.",
        settings: {
          theme,
          sound_effects: soundEffects,
          font_size: fontSize,
        },
      });
    } catch (error) {
      console.error("Settings update error:", error);

      return json({
        success: false,
        message: "Unable to save settings.",
      }, 500);
    }
  }

  return json({
    success: false,
    message: "Method not allowed.",
  }, 405);
}
