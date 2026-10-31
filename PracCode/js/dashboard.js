
"use strict";

// ========================================
// PRACCODE - DASHBOARD JAVASCRIPT
// Connected to Node.js + MySQL API
// ========================================

document.addEventListener("DOMContentLoaded", () => {

    // ========================================
    // 1. ELEMENTS
    // ========================================

    const welcomeMessage = document.querySelector("#dashboard-welcome");

    const totalPractice = document.querySelector("#total-practice");
    const totalMinutes = document.querySelector("#total-minutes");
    const averageWPM = document.querySelector("#average-wpm");
    const accuracy = document.querySelector("#accuracy");

    const practiceHistory = document.querySelector("#practice-history");
    const achievementList = document.querySelector("#achievement-list");

    const sidebarToggle = document.querySelector("#sidebar-toggle");
    const dashboardSidebar = document.querySelector(".dashboard-sidebar");

    const completeChallengeButton = document.querySelector(
        "#complete-challenge"
    );

    const notificationButton = document.querySelector(
        "#dashboard-notifications"
    );

    const logoutButton = document.querySelector("#logout-button");

    const dashboardDate = document.querySelector("#dashboard-date");
    const dashboardYear = document.querySelector("#dashboard-year");

    const DEFAULT_PROFILE_PICTURE =
        "../assets/images/profile-default.png";

    let currentUser = null;
    let currentStats = null;
    let currentSessions = [];

    // ========================================
    // 2. HELPER FUNCTIONS
    // ========================================

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, character => {
            const entities = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"
            };

            return entities[character];
        });
    }

    async function apiRequest(url, options = {}) {

        const response = await fetch(url, {
            credentials: "same-origin",
            ...options,
            headers: {
                ...(options.headers || {})
            }
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok || data.success === false) {
            const error = new Error(
                data.message || "Unable to retrieve dashboard information."
            );

            error.status = response.status;

            throw error;
        }

        return data;
    }

    function formatDate(dateValue) {

        if (!dateValue) {
            return "Date unavailable";
        }

        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) {
            return "Date unavailable";
        }

        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
        });
    }

    function formatTimeAgo(dateValue) {

        if (!dateValue) return "Date unavailable";

        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) {
            return "Date unavailable";
        }

        const seconds = Math.floor(
            (Date.now() - date.getTime()) / 1000
        );

        if (seconds < 60) return "Just now";

        const minutes = Math.floor(seconds / 60);

        if (minutes < 60) {
            return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
        }

        const hours = Math.floor(minutes / 60);

        if (hours < 24) {
            return `${hours} hour${hours === 1 ? "" : "s"} ago`;
        }

        const days = Math.floor(hours / 24);

        if (days === 1) return "Yesterday";

        if (days < 7) return `${days} days ago`;

        return formatDate(dateValue);
    }

    function showEmptyState(container, message) {

        if (!container) return;

        container.innerHTML = `
            <div class="dashboard-empty">
                <p>${escapeHTML(message)}</p>
            </div>
        `;
    }

    // ========================================
    // 3. LOAD LOGGED-IN USER
    // ========================================

    async function loadDashboardUser() {

        try {

            const data = await apiRequest("/api/auth/session");

            currentUser = data.user;

            displayDashboardUser(currentUser);

        } catch (error) {

            console.error("Dashboard user error:", error);

            if (error.status === 401 || error.status === 404) {
                window.location.href = "login.html";
                return;
            }

            showEmptyState(
                practiceHistory,
                "Unable to load your account information."
            );
        }
    }

    function displayDashboardUser(user) {

        if (!user) return;

        const firstName = user.full_name
            ? user.full_name.trim().split(/\s+/)[0]
            : "Developer";

        // Welcome message.
        if (welcomeMessage) {

            const hour = new Date().getHours();

            let greeting = "Good evening";

            if (hour < 12) {
                greeting = "Good morning";
            } else if (hour < 18) {
                greeting = "Good afternoon";
            }

            welcomeMessage.textContent =
                `${greeting}, ${firstName}! 👋`;
        }

        // Sidebar user information.
        const sidebarUserInfo = document.querySelector(
            ".dashboard-sidebar .dashboard-user-info"
        );

        if (sidebarUserInfo) {

            sidebarUserInfo.innerHTML = `
                <strong>${escapeHTML(user.full_name || "Developer")}</strong>
                <span>@${escapeHTML(user.username || "user")}</span>
            `;
        }

        // Display profile picture in both dashboard avatars.
        const avatars = document.querySelectorAll(
            ".dashboard-user-avatar"
        );

        avatars.forEach(avatar => {

            avatar.innerHTML = "";

            const image = document.createElement("img");

            image.src = user.profile_picture || DEFAULT_PROFILE_PICTURE;

            image.alt = "Profile picture";

            image.style.width = "100%";
            image.style.height = "100%";
            image.style.objectFit = "cover";
            image.style.borderRadius = "50%";

            image.onerror = () => {
                image.onerror = null;
                image.src = DEFAULT_PROFILE_PICTURE;
            };

            avatar.appendChild(image);
        });
    }

    // ========================================
    // 4. LOAD REAL MYSQL STATISTICS
    // ========================================

    async function loadDashboardStats() {

        try {

            const data = await apiRequest("/api/practice/stats");

            currentStats = data.stats || {};

            displayDashboardStats(currentStats);

        } catch (error) {

            console.error("Dashboard statistics error:", error);

            if (totalPractice) totalPractice.textContent = "—";
            if (totalMinutes) totalMinutes.textContent = "—";
            if (averageWPM) averageWPM.textContent = "—";
            if (accuracy) accuracy.textContent = "—";
        }
    }

    function displayDashboardStats(stats) {

        if (totalPractice) {
            totalPractice.textContent =
                Number(stats.total_practice) || 0;
        }

        if (totalMinutes) {

            const seconds = Number(stats.total_seconds) || 0;

            totalMinutes.textContent = Math.floor(seconds / 60);
        }

        if (averageWPM) {
            averageWPM.textContent =
                Number(stats.average_wpm) || 0;
        }

        if (accuracy) {

            accuracy.textContent =
                `${Number(stats.average_accuracy) || 0}%`;
        }
    }

    // ========================================
    // 5. LOAD RECENT PRACTICE SESSIONS
    // ========================================

    async function loadPracticeHistory() {

        if (!practiceHistory) return;

        try {

            const data = await apiRequest(
                "/api/practice/sessions"
            );

            currentSessions = data.sessions || [];

            displayPracticeHistory(currentSessions);

        } catch (error) {

            console.error("Practice history error:", error);

            showEmptyState(
                practiceHistory,
                "Unable to load your recent practice sessions."
            );
        }
    }

    function displayPracticeHistory(sessions) {

        if (!practiceHistory) return;

        if (!sessions || sessions.length === 0) {

            practiceHistory.innerHTML = `
                <div class="dashboard-empty">
                    <p>⌨️</p>
                    <p>No practice sessions yet.</p>
                    <p>Start practicing to see your activity here!</p>
                </div>
            `;

            return;
        }

        const recentSessions = sessions.slice(0, 5);

        practiceHistory.innerHTML = recentSessions.map(session => {

            const language = escapeHTML(session.language || "Coding");

            const difficulty = escapeHTML(
                session.difficulty || "Practice"
            );

            const wpm = Number(session.wpm) || 0;

            const accuracyValue = Number(session.accuracy) || 0;

            const duration = Number(session.duration_seconds) || 0;

            const date = formatTimeAgo(session.created_at);

            return `
                <div class="dashboard-activity-item">

                    <div class="dashboard-activity-info">

                        <h4>${language} - ${difficulty}</h4>

                        <p>${date}</p>

                    </div>

                    <div class="dashboard-activity-result">

                        <strong>${wpm} WPM</strong>

                        <p>${accuracyValue}% Accuracy</p>

                        <small>${duration}s</small>

                    </div>

                </div>
            `;

        }).join("");
    }

    // ========================================
    // 6. ACHIEVEMENTS
    // ========================================

    function displayAchievements() {

        if (!achievementList) return;

        const total = Number(currentStats?.total_practice) || 0;

        const bestWPM = currentSessions.reduce(
            (best, session) =>
                Math.max(best, Number(session.wpm) || 0),
            0
        );

        const bestAccuracy = currentSessions.reduce(
            (best, session) =>
                Math.max(best, Number(session.accuracy) || 0),
            0
        );

        const achievements = [

            {
                name: "First Practice",
                description: "Complete your first typing practice.",
                icon: "🥇",
                unlocked: total >= 1
            },

            {
                name: "Speed Beginner",
                description: "Reach 30 WPM.",
                icon: "⚡",
                unlocked: bestWPM >= 30
            },

            {
                name: "Accuracy Master",
                description: "Reach 95% accuracy.",
                icon: "🎯",
                unlocked: bestAccuracy >= 95
            },

            {
                name: "Practice Enthusiast",
                description: "Complete 10 practice sessions.",
                icon: "🔥",
                unlocked: total >= 10
            },

            {
                name: "Practice Champion",
                description: "Complete 50 practice sessions.",
                icon: "🏆",
                unlocked: total >= 50
            }
        ];

        achievementList.innerHTML = achievements.map(achievement => {

            return `
                <div class="dashboard-achievement-card ${
                    achievement.unlocked ? "unlocked" : "locked"
                }">

                    <span class="dashboard-achievement-icon">
                        ${achievement.icon}
                    </span>

                    <h4>${achievement.name}</h4>

                    <p>${achievement.description}</p>

                    <span class="achievement-status">
                        ${
                            achievement.unlocked
                                ? "✓ Unlocked"
                                : "🔒 Locked"
                        }
                    </span>

                </div>
            `;

        }).join("");
    }

    // ========================================
    // 7. QUICK ACTION BUTTONS
    // ========================================

    const quickActionButtons = document.querySelectorAll(
        "[data-dashboard-action]"
    );

    quickActionButtons.forEach(button => {

        button.addEventListener("click", () => {

            const action = button.dataset.dashboardAction;

            const destinations = {

                practice: "typing-arena.html",

                leaderboard: "leaderboard.html",

                profile: "profile.html",

                about: "about.html"

            };

            if (destinations[action]) {

                window.location.href = destinations[action];

            }
        });
    });

    // ========================================
    // 8. MOBILE SIDEBAR
    // ========================================

    if (sidebarToggle && dashboardSidebar) {

        sidebarToggle.setAttribute("aria-expanded", "false");

        sidebarToggle.addEventListener("click", () => {

            const isOpen = dashboardSidebar.classList.toggle("open");

            sidebarToggle.setAttribute(
                "aria-expanded",
                String(isOpen)
            );
        });
    }

    const sidebarLinks = document.querySelectorAll(
        ".dashboard-nav a"
    );

    sidebarLinks.forEach(link => {

        link.addEventListener("click", () => {

            if (dashboardSidebar) {
                dashboardSidebar.classList.remove("open");
            }

            if (sidebarToggle) {
                sidebarToggle.setAttribute("aria-expanded", "false");
            }
        });
    });

    // ========================================
    // 9. DAILY CHALLENGE
    // ========================================

    const CHALLENGE_STORAGE_KEY = "pracCodeDailyChallenge";

    function getTodayDate() {

        const today = new Date();

        const year = today.getFullYear();

        const month = String(today.getMonth() + 1).padStart(2, "0");

        const day = String(today.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    function loadChallengeData() {

        try {

            const saved = localStorage.getItem(
                CHALLENGE_STORAGE_KEY
            );

            return saved
                ? JSON.parse(saved)
                : { date: getTodayDate(), completed: false };

        } catch (error) {

            console.warn("Challenge data error:", error);

            return {
                date: getTodayDate(),
                completed: false
            };
        }
    }

    let challengeData = loadChallengeData();

    if (challengeData.date !== getTodayDate()) {

        challengeData = {
            date: getTodayDate(),
            completed: false
        };

        localStorage.setItem(
            CHALLENGE_STORAGE_KEY,
            JSON.stringify(challengeData)
        );
    }

    function updateChallengeButton() {

        if (!completeChallengeButton) return;

        if (challengeData.completed) {

            completeChallengeButton.disabled = true;

            completeChallengeButton.textContent =
                "Challenge Completed! ✓";

        } else {

            completeChallengeButton.disabled = false;

            completeChallengeButton.textContent =
                "Mark as Completed";
        }
    }

    if (completeChallengeButton) {

        completeChallengeButton.addEventListener("click", () => {

            if (challengeData.completed) return;

            const confirmed = window.confirm(
                "Have you completed today's typing challenge?"
            );

            if (!confirmed) return;

            challengeData = {
                date: getTodayDate(),
                completed: true
            };

            localStorage.setItem(
                CHALLENGE_STORAGE_KEY,
                JSON.stringify(challengeData)
            );

            updateChallengeButton();

            alert(
                "Congratulations! You completed today's challenge."
            );
        });
    }

    updateChallengeButton();

    // ========================================
    // 10. NOTIFICATIONS
    // ========================================

    if (notificationButton) {

        notificationButton.addEventListener("click", () => {

            const total = Number(
                currentStats?.total_practice
            ) || 0;

            if (total === 0) {

                alert(
                    "Welcome to PracCode! Start your first practice session today."
                );

            } else {

                alert(
                    `You have completed ${total} practice session(s). Keep improving!`
                );
            }
        });
    }

    // ========================================
    // 11. LOGOUT
    // ========================================

    if (logoutButton) {

        logoutButton.addEventListener("click", async () => {

            const confirmed = window.confirm(
                "Are you sure you want to log out?"
            );

            if (!confirmed) return;

            try {

                await apiRequest("/api/auth/logout", {
                    method: "POST"
                });

                window.location.href = "login.html";

            } catch (error) {

                console.error("Logout error:", error);

                alert("Unable to log out. Please try again.");
            }
        });
    }

    // ========================================
    // 12. CURRENT DATE AND FOOTER YEAR
    // ========================================

    if (dashboardDate) {

        dashboardDate.textContent =
            new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
            });
    }

    if (dashboardYear) {

        dashboardYear.textContent =
            new Date().getFullYear();
    }

    // ========================================
    // 13. INITIALIZE DASHBOARD
    // ========================================

    async function initializeDashboard() {

        await loadDashboardUser();

        if (!currentUser) return;

        await Promise.all([
            loadDashboardStats(),
            loadPracticeHistory()
        ]);

        displayAchievements();
    }

    initializeDashboard();

});

// ========================================
// END OF DASHBOARD JAVASCRIPT
// ========================================
