
document.addEventListener("DOMContentLoaded", () => {
    // ========================================
    // 1. ELEMENTS AND VARIABLES
    // ========================================

    const DEFAULT_PROFILE_PICTURE =
        "../assets/images/profile-default.png";

    let currentUser = null;

    const profilePicture = document.getElementById("profile-picture");
    const profilePictureInput = document.getElementById(
        "profile-picture-input"
    );

    const profileName = document.getElementById("profile-name");
    const profileUsername = document.getElementById("profile-username");
    const profileEmail = document.getElementById("profile-email");
    const profileBio = document.getElementById("profile-bio");
    const profileLocation = document.getElementById("profile-location");

    const editProfileButton = document.getElementById(
        "edit-profile-button"
    );

    const editProfileForm = document.getElementById("edit-profile-form");
    const profileUpdateForm = document.getElementById(
        "profile-update-form"
    );

    const cancelProfileEdit = document.getElementById(
        "cancel-profile-edit"
    );

    const profileEditMessage = document.getElementById(
        "profile-edit-message"
    );

    const editName = document.getElementById("edit-name");
    const editUsername = document.getElementById("edit-username");
    const editEmail = document.getElementById("edit-email");
    const editLocation = document.getElementById("edit-location");
    const editBio = document.getElementById("edit-bio");

    const profileDetailName = document.getElementById(
        "profile-detail-name"
    );

    const profileDetailEmail = document.getElementById(
        "profile-detail-email"
    );

    const profileDetailLocation = document.getElementById(
        "profile-detail-location"
    );

    const profileSkillsList = document.getElementById(
        "profile-skills-list"
    );

    const newSkillInput = document.getElementById("new-skill");

    const addSkillButton = document.getElementById(
        "add-skill-button"
    );

    const totalPractice = document.getElementById(
        "profile-total-practice"
    );

    const averageWpm = document.getElementById(
        "profile-average-wpm"
    );

    const averageAccuracy = document.getElementById(
        "profile-accuracy"
    );

    const totalMinutes = document.getElementById(
        "profile-total-minutes"
    );

    const historyList = document.getElementById(
        "profile-history-list"
    );

    const achievementsList = document.getElementById(
        "profile-achievements-list"
    );

    // Skills are kept in the browser.
    // They are not saved to MySQL by the current server API.
    let skills = [];

    // ========================================
    // 2. HELPER FUNCTIONS
    // ========================================

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, (character) => {
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

    function showMessage(message, isError = false) {
        if (!profileEditMessage) return;

        profileEditMessage.textContent = message;
        profileEditMessage.style.color = isError
            ? "#e4474f"
            : "#22c55e";
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
            throw new Error(
                data.message || "Something went wrong."
            );
        }

        return data;
    }

    // ========================================
    // 3. DISPLAY USER PROFILE
    // ========================================

    function displayProfile(user) {
        if (!user) return;

        if (profileName) {
            profileName.textContent = user.full_name || "Your Name";
        }

        if (profileUsername) {
            profileUsername.textContent = user.username
                ? `@${user.username}`
                : "";
        }

        if (profileEmail) {
            profileEmail.textContent = user.email || "";
        }

        if (profileBio) {
            profileBio.textContent =
                user.bio || "No bio added yet.";
        }

        if (profileLocation) {
            profileLocation.textContent =
                user.location || "Location not set";
        }

        if (profileDetailName) {
            profileDetailName.textContent =
                user.full_name || "Not provided";
        }

        if (profileDetailEmail) {
            profileDetailEmail.textContent =
                user.email || "Not provided";
        }

        if (profileDetailLocation) {
            profileDetailLocation.textContent =
                user.location || "Not provided";
        }

        if (profilePicture) {
            profilePicture.onerror = () => {
                profilePicture.onerror = null;
                profilePicture.src = DEFAULT_PROFILE_PICTURE;
            };

            profilePicture.src =
                user.profile_picture || DEFAULT_PROFILE_PICTURE;
        }
    }

    // ========================================
    // 4. LOAD PROFILE
    // ========================================

    async function loadProfile() {
        try {
            const data = await apiRequest("/api/auth/session");

            currentUser = data.user;

            displayProfile(currentUser);

        } catch (error) {
            console.error("Load profile error:", error);

            if (error.message.includes("log in")) {
                window.location.href = "login.html";
                return;
            }

            alert("Unable to load your profile. Please try again.");
        }
    }

    // ========================================
    // 5. OPEN EDIT PROFILE FORM
    // ========================================

    if (editProfileButton && editProfileForm) {
        editProfileButton.addEventListener("click", () => {
            if (!currentUser) return;

            if (editName) {
                editName.value = currentUser.full_name || "";
            }

            if (editUsername) {
                editUsername.value = currentUser.username || "";
            }

            if (editEmail) {
                editEmail.value = currentUser.email || "";
            }

            if (editLocation) {
                editLocation.value = currentUser.location || "";
            }

            if (editBio) {
                editBio.value = currentUser.bio || "";
            }

            showMessage("");

            editProfileForm.hidden = false;
        });
    }

    // ========================================
    // 6. CANCEL PROFILE EDITING
    // ========================================

    if (cancelProfileEdit && editProfileForm) {
        cancelProfileEdit.addEventListener("click", () => {
            editProfileForm.hidden = true;
            showMessage("");
        });
    }

    // ========================================
    // 7. UPDATE PROFILE INFORMATION
    // ========================================

    if (profileUpdateForm) {
        profileUpdateForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            const profileData = {
                name: editName?.value.trim() || "",
                username: editUsername?.value.trim() || "",
                location: editLocation?.value.trim() || "",
                bio: editBio?.value.trim() || ""
            };

            if (!profileData.name || !profileData.username) {
                showMessage(
                    "Name and username are required.",
                    true
                );
                return;
            }

            const submitButton = profileUpdateForm.querySelector(
                'button[type="submit"]'
            );

            try {
                if (submitButton) submitButton.disabled = true;

                showMessage("Saving your profile...");

                const data = await apiRequest("/api/auth/profile", {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(profileData)
                });

                currentUser = data.user;

                displayProfile(currentUser);

                showMessage("Profile updated successfully!");

                setTimeout(() => {
                    if (editProfileForm) {
                        editProfileForm.hidden = true;
                    }
                }, 800);

            } catch (error) {
                console.error("Update profile error:", error);
                showMessage(error.message, true);

            } finally {
                if (submitButton) submitButton.disabled = false;
            }
        });
    }

    // ========================================
    // 8. UPLOAD AND SAVE PROFILE PICTURE
    // ========================================

    if (profilePictureInput && profilePicture) {
        profilePictureInput.addEventListener(
            "change",
            async (event) => {
                const file = event.target.files[0];

                if (!file) return;

                const allowedTypes = [
                    "image/jpeg",
                    "image/png",
                    "image/webp",
                    "image/gif"
                ];

                if (!allowedTypes.includes(file.type)) {
                    alert(
                        "Please select a JPG, PNG, WEBP, or GIF image."
                    );

                    profilePictureInput.value = "";
                    return;
                }

                if (file.size > 5 * 1024 * 1024) {
                    alert("Image must be 5 MB or smaller.");

                    profilePictureInput.value = "";
                    return;
                }

                const formData = new FormData();

                formData.append("profile_picture", file);

                const previousPicture =
                    currentUser?.profile_picture || null;

                try {
                    profilePictureInput.disabled = true;

                    const uploadButton = document.querySelector(
                        ".profile-picture-edit"
                    );

                    if (uploadButton) {
                        uploadButton.style.opacity = "0.5";
                    }

                    const response = await fetch(
                        "/api/auth/profile-picture",
                        {
                            method: "POST",
                            credentials: "same-origin",
                            body: formData
                        }
                    );

                    const data = await response.json().catch(() => ({}));

                    if (!response.ok || !data.success) {
                        throw new Error(
                            data.message ||
                            "Unable to upload profile picture."
                        );
                    }

                    // Update the displayed image.
                    profilePicture.src =
                        data.profile_picture + "?t=" + Date.now();

                    // Update the current user data.
                    if (currentUser) {
                        currentUser.profile_picture =
                            data.profile_picture;
                    }

                    alert("Profile picture saved successfully!");

                } catch (error) {
                    console.error(
                        "Profile picture upload error:",
                        error
                    );

                    // Restore the previous picture if upload fails.
                    profilePicture.src =
                        previousPicture || DEFAULT_PROFILE_PICTURE;

                    alert(
                        error.message ||
                        "Unable to upload profile picture."
                    );

                } finally {
                    profilePictureInput.disabled = false;
                    profilePictureInput.value = "";

                    const uploadButton = document.querySelector(
                        ".profile-picture-edit"
                    );

                    if (uploadButton) {
                        uploadButton.style.opacity = "1";
                    }
                }
            }
        );
    }

    // ========================================
    // 9. LOAD PRACTICE STATISTICS
    // ========================================

    async function loadPracticeStats() {
        try {
            const data = await apiRequest("/api/practice/stats");

            const stats = data.stats || {};

            if (totalPractice) {
                totalPractice.textContent =
                    stats.total_practice ?? 0;
            }

            if (averageWpm) {
                averageWpm.textContent =
                    stats.average_wpm ?? 0;
            }

            if (averageAccuracy) {
                averageAccuracy.textContent =
                    `${stats.average_accuracy ?? 0}%`;
            }

            if (totalMinutes) {
                const seconds = Number(stats.total_seconds) || 0;

                totalMinutes.textContent =
                    Math.floor(seconds / 60);
            }

        } catch (error) {
            console.error("Load statistics error:", error);
        }
    }

    // ========================================
    // 10. LOAD PRACTICE HISTORY
    // ========================================

    async function loadPracticeHistory() {
        if (!historyList) return;

        try {
            const data = await apiRequest(
                "/api/practice/sessions"
            );

            const sessions = data.sessions || [];

            if (sessions.length === 0) {
                historyList.innerHTML = `
                    <p class="empty-state">
                        No practice history yet.
                        Start practicing to see your progress here.
                    </p>
                `;
                return;
            }

            historyList.innerHTML = sessions.map((session) => {
                const date = session.created_at
                    ? new Date(session.created_at).toLocaleDateString()
                    : "Date unavailable";

                const duration = Number(
                    session.duration_seconds
                ) || 0;

                return `
                    <div class="history-item">
                        <div class="history-info">
                            <h4>${escapeHTML(session.language)}</h4>
                            <p>
                                ${escapeHTML(session.difficulty)}
                                · ${date}
                            </p>
                        </div>

                        <div class="history-stats">
                            <span>
                                ${escapeHTML(session.wpm)} WPM
                            </span>

                            <span>
                                ${escapeHTML(session.accuracy)}% Accuracy
                            </span>

                            <span>
                                ${duration}s
                            </span>
                        </div>
                    </div>
                `;
            }).join("");

        } catch (error) {
            console.error("Load practice history error:", error);

            historyList.innerHTML = `
                <p class="empty-state">
                    Unable to load practice history.
                </p>
            `;
        }
    }

    // ========================================
    // 11. PROFILE SKILLS
    // ========================================

    function displaySkills() {
        if (!profileSkillsList) return;

        if (skills.length === 0) {
            profileSkillsList.innerHTML = `
                <p class="empty-state">
                    No skills added yet.
                </p>
            `;
            return;
        }

        profileSkillsList.innerHTML = skills.map(
            (skill, index) => `
                <span class="skill-tag">
                    ${escapeHTML(skill)}
                    <button
                        type="button"
                        class="remove-skill"
                        data-index="${index}"
                        aria-label="Remove ${escapeHTML(skill)}"
                    >
                        &times;
                    </button>
                </span>
            `
        ).join("");
    }

    if (addSkillButton && newSkillInput) {
        addSkillButton.addEventListener("click", () => {
            const skill = newSkillInput.value.trim();

            if (!skill) return;

            if (
                skills.some(
                    existing =>
                        existing.toLowerCase() === skill.toLowerCase()
                )
            ) {
                alert("This skill has already been added.");
                return;
            }

            skills.push(skill);

            newSkillInput.value = "";

            displaySkills();
        });

        newSkillInput.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                addSkillButton.click();
            }
        });
    }

    if (profileSkillsList) {
        profileSkillsList.addEventListener("click", (event) => {
            const removeButton = event.target.closest(".remove-skill");

            if (!removeButton) return;

            const index = Number(removeButton.dataset.index);

            if (
                Number.isInteger(index) &&
                index >= 0 &&
                index < skills.length
            ) {
                skills.splice(index, 1);
                displaySkills();
            }
        });
    }

    // ========================================
    // 12. LOAD ACHIEVEMENTS
    // ========================================

    async function loadAchievements() {
        if (!achievementsList) return;

        try {
            const data = await apiRequest(
                "/api/practice/sessions"
            );

            const sessions = data.sessions || [];

            const totalSessions = sessions.length;

            const bestWpm = sessions.reduce(
                (best, session) =>
                    Math.max(best, Number(session.wpm) || 0),
                0
            );

            const achievements = [
                {
                    title: "First Practice",
                    description: "Complete your first practice session.",
                    unlocked: totalSessions >= 1
                },
                {
                    title: "Practice Enthusiast",
                    description: "Complete 10 practice sessions.",
                    unlocked: totalSessions >= 10
                },
                {
                    title: "Consistent Learner",
                    description: "Complete 25 practice sessions.",
                    unlocked: totalSessions >= 25
                },
                {
                    title: "Speed Starter",
                    description: "Reach 40 WPM in a practice session.",
                    unlocked: bestWpm >= 40
                },
                {
                    title: "Speed Master",
                    description: "Reach 60 WPM in a practice session.",
                    unlocked: bestWpm >= 60
                }
            ];

            achievementsList.innerHTML = achievements.map(
                achievement => `
                    <div class="achievement-item ${
                        achievement.unlocked ? "unlocked" : "locked"
                    }">
                        <div class="achievement-icon">
                            <i class="fa-solid ${
                                achievement.unlocked
                                    ? "fa-trophy"
                                    : "fa-lock"
                            }"></i>
                        </div>

                        <div class="achievement-info">
                            <h4>
                                ${achievement.title}
                            </h4>

                            <p>
                                ${achievement.description}
                            </p>

                            <span>
                                ${
                                    achievement.unlocked
                                        ? "Unlocked"
                                        : "Not yet unlocked"
                                }
                            </span>
                        </div>
                    </div>
                `
            ).join("");

        } catch (error) {
            console.error("Load achievements error:", error);

            achievementsList.innerHTML = `
                <p class="empty-state">
                    Unable to load achievements.
                </p>
            `;
        }
    }

    // ========================================
    // 13. INITIALIZE PROFILE PAGE
    // ========================================

    async function initializeProfile() {
        await loadProfile();

        if (!currentUser) return;

        await Promise.all([
            loadPracticeStats(),
            loadPracticeHistory(),
            loadAchievements()
        ]);

        displaySkills();
    }

    initializeProfile();
});
