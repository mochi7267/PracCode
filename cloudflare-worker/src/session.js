
const SESSION_COOKIE = "praccode.sid";
const SESSION_DURATION = 60 * 60 * 24; // 24 hours

async function sign(value, secret) {
  if (!secret) {
    throw new Error("SESSION_SECRET is missing.");
  }

  const encoder = new TextEncoder();

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(value)
  );

  const bytes = new Uint8Array(signature);
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

async function hashToken(token) {
  const data = new TextEncoder().encode(token);
  const digest = await crypto.subtle.digest("SHA-256", data);

  const bytes = new Uint8Array(digest);
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary);
}

function readToken(request) {
  const cookieHeader = request.headers.get("Cookie") || "";

  const cookie = cookieHeader
    .split(";")
    .map(item => item.trim())
    .find(item => item.startsWith(`${SESSION_COOKIE}=`));

  if (!cookie) {
    return null;
  }

  return cookie.substring(SESSION_COOKIE.length + 1);
}

export async function createSession(userId, secret, db) {
  if (!db) {
    throw new Error("D1 database binding is missing.");
  }

  const expiresAt =
    Math.floor(Date.now() / 1000) + SESSION_DURATION;

  const value = `${userId}.${expiresAt}`;
  const signature = await sign(value, secret);
  const token = `${value}.${signature}`;
  const tokenHash = await hashToken(token);

  await db.prepare(`
    INSERT INTO auth_sessions (user_id, token_hash, expires_at)
    VALUES (?, ?, ?)
  `)
    .bind(userId, tokenHash, expiresAt)
    .run();

  return token;
}

export async function getSession(request, secret, db) {
  if (!secret || !db) {
    console.error("Session secret or D1 binding is missing.");
    return null;
  }

  const token = readToken(request);

  if (!token) {
    console.log("Session check: cookie not found.");
    return null;
  }

  const parts = token.split(".");

  if (parts.length !== 3) {
    console.log("Session check: invalid token format.");
    return null;
  }

  const [userId, expiresAt, signature] = parts;

  if (!/^\d+$/.test(userId) || !/^\d+$/.test(expiresAt)) {
    console.log("Session check: invalid user ID or expiry.");
    return null;
  }

  const expiry = Number(expiresAt);

  if (expiry <= Math.floor(Date.now() / 1000)) {
    console.log("Session check: expired token.");
    return null;
  }

  const expectedSignature = await sign(
    `${userId}.${expiresAt}`,
    secret
  );

  if (signature !== expectedSignature) {
    console.log("Session check: signature mismatch.");
    return null;
  }

  const tokenHash = await hashToken(token);

  const session = await db.prepare(`
    SELECT session_id
    FROM auth_sessions
    WHERE user_id = ?
      AND token_hash = ?
      AND expires_at > ?
      AND revoked_at IS NULL
    LIMIT 1
  `)
    .bind(
      Number(userId),
      tokenHash,
      Math.floor(Date.now() / 1000)
    )
    .first();

  if (!session) {
    console.log("Session check: session missing or revoked.");
    return null;
  }

  console.log("Session check: active session verified.");

  return Number(userId);
}

export async function revokeSession(request, db) {
  if (!db) {
    throw new Error("D1 database binding is missing.");
  }

  const token = readToken(request);

  if (!token) {
    return;
  }

  const tokenHash = await hashToken(token);

  await db.prepare(`
    UPDATE auth_sessions
    SET revoked_at = ?
    WHERE token_hash = ?
      AND revoked_at IS NULL
  `)
    .bind(Math.floor(Date.now() / 1000), tokenHash)
    .run();
}

export function sessionCookie(token, secure = true) {
  return [
    `${SESSION_COOKIE}=${token}`,
    "HttpOnly",
    "SameSite=None",
    "Path=/",
    `Max-Age=${SESSION_DURATION}`,
    secure ? "Secure" : "",
  ]
    .filter(Boolean)
    .join("; ");
}

export function clearSessionCookie(secure = true) {
  return [
    `${SESSION_COOKIE}=`,
    "HttpOnly",
    "SameSite=None",
    "Path=/",
    "Max-Age=0",
    secure ? "Secure" : "",
  ]
    .filter(Boolean)
    .join("; ");
}
