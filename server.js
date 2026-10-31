
// ========================================
// PRACCODE - SERVER.JS
// Node.js + Express + MySQL
// ========================================

require("dotenv").config();

const express = require("express");
const session = require("express-session");
const path = require("path");
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const fs = require("fs");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;

// ========================================
// MIDDLEWARE
// ========================================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========================================
// MYSQL DATABASE CONNECTION
// ========================================

const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "praccode_db",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// ========================================
// PROFILE PICTURE UPLOAD CONFIGURATION
// ========================================

const profilePicturesDir = path.join(
    __dirname,
    "uploads",
    "profile-pictures"
);

if (!fs.existsSync(profilePicturesDir)) {
    fs.mkdirSync(profilePicturesDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, profilePicturesDir);
    },

    filename: (_req, file, cb) => {
        const extension = {
            "image/jpeg": ".jpg",
            "image/png": ".png",
            "image/webp": ".webp",
            "image/gif": ".gif"
        }[file.mimetype];

        if (!extension) {
            return cb(new Error("Unsupported image format."));
        }

        cb(null, crypto.randomUUID() + extension);
    }
});

const uploadProfilePicture = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: (_req, file, cb) => {
        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif"
        ];

        if (!allowedTypes.includes(file.mimetype)) {
            return cb(
                new Error(
                    "Only JPG, PNG, WEBP, and GIF images are allowed."
                )
            );
        }

        cb(null, true);
    }
});

// ========================================
// SESSION CONFIGURATION
// ========================================

app.use(
    session({
        name: "praccode.sid",
        secret:
            process.env.SESSION_SECRET ||
            "praccode-session-secret-change-this",
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            maxAge: 24 * 60 * 60 * 1000
        }
    })
);

// ========================================
// STATIC FILES
// ========================================

app.use(
    "/PracCode",
    express.static(path.join(__dirname, "PracCode"))
);

app.use(
    "/assets",
    express.static(path.join(__dirname, "assets"))
);

app.use(
    "/uploads",
    express.static(path.join(__dirname, "uploads"))
);

app.get("/", (_req, res) => {
    res.redirect("/PracCode/index.html");
});

// ========================================
// HELPER FUNCTIONS
// ========================================

function cleanUser(row) {
    return {
        user_id: row.user_id,
        full_name: row.full_name,
        username: row.username,
        email: row.email,
        profile_picture: row.profile_picture,
        bio: row.bio,
        location: row.location,
        created_at: row.created_at
    };
}

// Authentication middleware.
function requireAuth(req, res, next) {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({
            success: false,
            message: "Please log in first."
        });
    }

    next();
}

// ========================================
// HEALTH CHECK
// ========================================

app.get("/api/health", async (_req, res) => {
    try {
        await pool.query("SELECT 1");

        res.json({
            success: true,
            message: "PracCode server and database are running."
        });

    } catch (err) {
        console.error("Health check error:", err);

        res.status(500).json({
            success: false,
            message: "Database connection failed."
        });
    }
});

// ========================================
// REGISTER
// ========================================

app.post("/api/auth/register", async (req, res) => {
    const fullName = String(
        req.body.full_name || req.body.name || ""
    ).trim();

    const username = String(req.body.username || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (!fullName || !username || !email || !password) {
        return res.status(400).json({
            success: false,
            message: "Please complete all required fields."
        });
    }

    if (password.length < 8) {
        return res.status(400).json({
            success: false,
            message: "Password must be at least 8 characters."
        });
    }

    try {
        const [existingUsers] = await pool.execute(
            `SELECT user_id
             FROM users
             WHERE username = ? OR email = ?
             LIMIT 1`,
            [username, email]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Username or email is already registered."
            });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const [result] = await pool.execute(
            `INSERT INTO users
             (full_name, username, email, password)
             VALUES (?, ?, ?, ?)`,
            [fullName, username, email, passwordHash]
        );

        req.session.userId = result.insertId;

        req.session.save((sessionError) => {
            if (sessionError) {
                console.error("Registration session error:", sessionError);

                return res.status(500).json({
                    success: false,
                    message:
                        "Account created, but session could not be started. Please log in."
                });
            }

            res.status(201).json({
                success: true,
                message: "Account created successfully.",
                user_id: result.insertId
            });
        });

    } catch (err) {
        console.error("Registration error:", err);

        res.status(500).json({
            success: false,
            message: "Unable to create your account."
        });
    }
});

// ========================================
// LOGIN
// ========================================

app.post("/api/auth/login", async (req, res) => {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Please enter your email and password."
        });
    }

    try {
        const [rows] = await pool.execute(
            `SELECT *
             FROM users
             WHERE email = ?
             LIMIT 1`,
            [email]
        );

        if (rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        const user = rows[0];

        const passwordMatches = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatches) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        if (user.is_active === 0) {
            return res.status(403).json({
                success: false,
                message: "Your account is currently inactive."
            });
        }

        req.session.regenerate((sessionError) => {
            if (sessionError) {
                console.error("Login session error:", sessionError);

                return res.status(500).json({
                    success: false,
                    message: "Unable to start your session."
                });
            }

            req.session.userId = user.user_id;

            req.session.save((saveError) => {
                if (saveError) {
                    console.error("Session save error:", saveError);

                    return res.status(500).json({
                        success: false,
                        message: "Unable to save your login session."
                    });
                }

                res.json({
                    success: true,
                    message: "Login successful.",
                    user: cleanUser(user)
                });
            });
        });

    } catch (err) {
        console.error("Login error:", err);

        res.status(500).json({
            success: false,
            message: "Unable to log in."
        });
    }
});

// ========================================
// GET CURRENT LOGGED-IN USER
// ========================================

app.get("/api/auth/session", requireAuth, async (req, res) => {
    try {
        const [rows] = await pool.execute(
            `SELECT
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
             LIMIT 1`,
            [req.session.userId]
        );

        if (rows.length === 0) {
            req.session.destroy(() => {});

            return res.status(404).json({
                success: false,
                message: "User account not found."
            });
        }

        res.json({
            success: true,
            user: cleanUser(rows[0])
        });

    } catch (err) {
        console.error("Session retrieval error:", err);

        res.status(500).json({
            success: false,
            message: "Unable to retrieve your account."
        });
    }
});

// ========================================
// LOGOUT
// ========================================

app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Logout error:", err);

            return res.status(500).json({
                success: false,
                message: "Unable to log out."
            });
        }

        res.clearCookie("praccode.sid");

        res.json({
            success: true,
            message: "Logged out successfully."
        });
    });
});

// ========================================
// UPDATE PROFILE API
// ========================================

app.put("/api/auth/profile", requireAuth, async (req, res) => {
    const fullName = String(
        req.body.name || req.body.full_name || ""
    ).trim();

    const username = String(req.body.username || "").trim();
    const bio = String(req.body.bio || "").trim();
    const location = String(req.body.location || "").trim();

    if (!fullName || !username) {
        return res.status(400).json({
            success: false,
            message: "Name and username are required."
        });
    }

    try {
        const [existingUsers] = await pool.execute(
            `SELECT user_id
             FROM users
             WHERE username = ? AND user_id != ?
             LIMIT 1`,
            [username, req.session.userId]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({
                success: false,
                message: "That username is already taken."
            });
        }

        await pool.execute(
            `UPDATE users
             SET
                full_name = ?,
                username = ?,
                bio = ?,
                location = ?
             WHERE user_id = ?`,
            [
                fullName,
                username,
                bio || null,
                location || null,
                req.session.userId
            ]
        );

        const [updatedUsers] = await pool.execute(
            `SELECT
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
             LIMIT 1`,
            [req.session.userId]
        );

        res.json({
            success: true,
            message: "Profile updated successfully.",
            user: cleanUser(updatedUsers[0])
        });

    } catch (err) {
        console.error("Profile update error:", err);

        res.status(500).json({
            success: false,
            message: "Unable to update your profile."
        });
    }
});

// ========================================
// UPLOAD PROFILE PICTURE API
// ========================================

app.post(
    "/api/auth/profile-picture",
    requireAuth,
    uploadProfilePicture.single("profile_picture"),
    async (req, res) => {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please select an image."
            });
        }

        const imagePath =
            `/uploads/profile-pictures/${req.file.filename}`;

        try {
            const [result] = await pool.execute(
                `UPDATE users
                 SET profile_picture = ?
                 WHERE user_id = ?`,
                [imagePath, req.session.userId]
            );

            if (result.affectedRows !== 1) {
                throw new Error("User account was not found.");
            }

            res.json({
                success: true,
                message: "Profile picture saved successfully.",
                profile_picture: imagePath
            });

        } catch (err) {
            console.error("Profile picture upload error:", err);

            fs.unlink(req.file.path, (unlinkError) => {
                if (unlinkError) {
                    console.error("Uploaded file cleanup error:", unlinkError);
                }
            });

            res.status(500).json({
                success: false,
                message: "Unable to save your profile picture."
            });
        }
    }
);

// ========================================
// SAVE A COMPLETED PRACTICE SESSION
// ========================================

app.post("/api/practice/sessions", requireAuth, async (req, res) => {
    const language = String(req.body.language || "HTML").trim();
    const difficulty = String(req.body.difficulty || "").trim();

    const durationSeconds = Number(req.body.duration_seconds);
    const wpm = Number(req.body.wpm);
    const accuracy = Number(req.body.accuracy);
    const errors = Number(req.body.errors);

    if (
        !difficulty ||
        !Number.isInteger(durationSeconds) ||
        durationSeconds < 1 ||
        durationSeconds > 180 ||
        !Number.isInteger(wpm) ||
        wpm < 0 ||
        !Number.isFinite(accuracy) ||
        accuracy < 0 ||
        accuracy > 100 ||
        !Number.isInteger(errors) ||
        errors < 0
    ) {
        return res.status(422).json({
            success: false,
            message: "Invalid practice session data."
        });
    }

    try {
        const [result] = await pool.execute(
            `INSERT INTO practice_sessions
             (
                user_id,
                language,
                difficulty,
                duration_seconds,
                wpm,
                accuracy,
                errors
             )
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                req.session.userId,
                language,
                difficulty,
                durationSeconds,
                wpm,
                accuracy,
                errors
            ]
        );

        res.status(201).json({
            success: true,
            message: "Practice session saved successfully.",
            session_id: result.insertId
        });

    } catch (err) {
        console.error("Save practice session error:", err);

        res.status(500).json({
            success: false,
            message: "Unable to save practice session."
        });
    }
});

// ========================================
// GET PRACTICE HISTORY
// ========================================

app.get("/api/practice/sessions", requireAuth, async (req, res) => {
    try {
        const [rows] = await pool.execute(
            `SELECT
                session_id,
                language,
                difficulty,
                duration_seconds,
                wpm,
                accuracy,
                errors,
                created_at
             FROM practice_sessions
             WHERE user_id = ?
             ORDER BY created_at DESC
             LIMIT 50`,
            [req.session.userId]
        );

        res.json({
            success: true,
            sessions: rows
        });

    } catch (err) {
        console.error("Load practice history error:", err);

        res.status(500).json({
            success: false,
            message: "Unable to load practice history."
        });
    }
});

// ========================================
// GET PRACTICE STATISTICS
// ========================================

app.get("/api/practice/stats", requireAuth, async (req, res) => {
    try {
        const [rows] = await pool.execute(
            `SELECT
                COUNT(*) AS total_practice,
                COALESCE(ROUND(AVG(wpm)), 0) AS average_wpm,
                COALESCE(ROUND(AVG(accuracy), 0), 0) AS average_accuracy,
                COALESCE(SUM(duration_seconds), 0) AS total_seconds
             FROM practice_sessions
             WHERE user_id = ?`,
            [req.session.userId]
        );

        res.json({
            success: true,
            stats: rows[0]
        });

    } catch (err) {
        console.error("Load practice statistics error:", err);

        res.status(500).json({
            success: false,
            message: "Unable to load practice statistics."
        });
    }
});

// ========================================
// GET LEADERBOARD
// ========================================

app.get("/api/leaderboard", requireAuth, async (req, res) => {
    const requestedDifficulty = String(
        req.query.difficulty || "All"
    ).trim();

    const allowedDifficulties = [
        "All",
        "Easy",
        "Medium",
        "Hard",
        "Advanced"
    ];

    if (!allowedDifficulties.includes(requestedDifficulty)) {
        return res.status(400).json({
            success: false,
            message: "Invalid difficulty filter."
        });
    }

    try {
        const [players] = await pool.execute(
            `SELECT
                u.user_id,
                u.full_name,
                u.username,
                u.profile_picture,
                best_session.language,
                best_session.difficulty,
                best_session.wpm,
                best_session.accuracy,
                best_session.created_at
             FROM users u

             INNER JOIN practice_sessions best_session
                ON best_session.session_id = (
                    SELECT ps.session_id
                    FROM practice_sessions ps
                    WHERE ps.user_id = u.user_id
                      AND (
                          ? = 'All'
                          OR ps.difficulty = ?
                      )
                    ORDER BY
                        ps.wpm DESC,
                        ps.accuracy DESC,
                        ps.created_at DESC,
                        ps.session_id DESC
                    LIMIT 1
                )

             ORDER BY
                best_session.wpm DESC,
                best_session.accuracy DESC,
                best_session.created_at ASC,
                u.user_id ASC`,
            [requestedDifficulty, requestedDifficulty]
        );

        const rankings = players.map((player, index) => ({
            rank: index + 1,
            user_id: player.user_id,
            name: player.full_name,
            username: `@${player.username}`,
            profile_picture: player.profile_picture,
            language: player.language,
            difficulty: player.difficulty,
            wpm: Number(player.wpm),
            accuracy: Number(player.accuracy),
            created_at: player.created_at,
            isCurrentUser:
                Number(player.user_id) === Number(req.session.userId)
        }));

        const currentPlayer = rankings.find(
            player => player.isCurrentUser
        );

        res.json({
            success: true,
            rankings,
            your_rank: currentPlayer ? currentPlayer.rank : null
        });

    } catch (err) {
        console.error("Leaderboard error:", err);

        res.status(500).json({
            success: false,
            message: "Unable to load leaderboard."
        });
    }
});

// ========================================
// ERROR HANDLER
// ========================================

app.use((err, _req, res, _next) => {
    console.error("Server error:", err);

    if (err instanceof multer.MulterError) {
        const message = err.code === "LIMIT_FILE_SIZE"
            ? "Image must be 5 MB or smaller."
            : "There was a problem uploading your image.";

        return res.status(400).json({
            success: false,
            message
        });
    }

    if (
        err.message ===
        "Only JPG, PNG, WEBP, and GIF images are allowed."
    ) {
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }

    res.status(500).json({
        success: false,
        message: "An unexpected server error occurred."
    });
});

// ========================================
// START SERVER
// ========================================

app.listen(PORT, async () => {
    console.log(`PracCode is running at http://localhost:${PORT}`);

    try {
        const connection = await pool.getConnection();

        console.log("MySQL connection successful.");

        connection.release();

    } catch (err) {
        console.error("MySQL connection failed:", err.message);
    }
});
