
// ========================================
// PRACCODE - LEADERBOARD JAVASCRIPT
// MySQL + Profile Pictures + Live Rankings
// ========================================

let leaderboardPlayers = [];
let selectedDifficulty = "All";
let selectedSort = "wpm";
let visiblePlayers = 5;
let isLoading = false;

const REFRESH_INTERVAL = 15000;

const leaderboardContainer = document.querySelector("#leaderboard-list");
const loadMoreButton = document.querySelector("#load-more-players");
const difficultyFilters = document.querySelectorAll("[data-difficulty]");
const sortSelect = document.querySelector("#leaderboard-sort");
const userRankElement = document.querySelector("#your-rank");


// ========================================
// HELPER: CREATE TABLE CELL
// ========================================

function createCell(content, className = "") {
    const cell = document.createElement("td");
    const span = document.createElement("span");

    span.textContent = content;

    if (className) {
        span.className = className;
    }

    cell.appendChild(span);
    return cell;
}


// ========================================
// HELPER: DISPLAY PLAYER AVATAR
// ========================================

function displayAvatar(element, player) {
    if (!element) return;

    element.innerHTML = "";

    const name = player.name || "Player";
    const initial = name.charAt(0).toUpperCase();

    if (!player.profile_picture) {
        element.textContent = initial;
        return;
    }

    const image = document.createElement("img");

    image.src = player.profile_picture;
    image.alt = `${name}'s profile picture`;

    image.style.width = "100%";
    image.style.height = "100%";
    image.style.objectFit = "cover";
    image.style.borderRadius = "50%";

    image.onerror = () => {
        image.remove();
        element.textContent = initial;
    };

    element.appendChild(image);
}


// ========================================
// SORT PLAYERS
// ========================================

function getSortedPlayers() {
    const sortedPlayers = [...leaderboardPlayers];

    if (selectedSort === "wpm") {
        sortedPlayers.sort((a, b) =>
            b.wpm - a.wpm ||
            b.accuracy - a.accuracy
        );

    } else if (selectedSort === "accuracy") {
        sortedPlayers.sort((a, b) =>
            b.accuracy - a.accuracy ||
            b.wpm - a.wpm
        );

    } else if (selectedSort === "name") {
        sortedPlayers.sort((a, b) =>
            a.name.localeCompare(b.name)
        );
    }

    return sortedPlayers;
}


// ========================================
// DISPLAY PLAYER RANKINGS
// ========================================

function displayLeaderboard() {
    if (!leaderboardContainer) return;

    const sortedPlayers = getSortedPlayers();
    const playersToDisplay = sortedPlayers.slice(0, visiblePlayers);

    leaderboardContainer.innerHTML = "";

    if (playersToDisplay.length === 0) {
        const emptyRow = document.createElement("tr");
        const emptyCell = document.createElement("td");

        emptyCell.colSpan = 5;
        emptyCell.className = "leaderboard-empty";
        emptyCell.textContent =
            "No practice records found for this difficulty.";

        emptyRow.appendChild(emptyCell);
        leaderboardContainer.appendChild(emptyRow);

        updateLoadMoreButton(0);
        return;
    }

    playersToDisplay.forEach((player, index) => {
        const playerRow = document.createElement("tr");

        if (player.isCurrentUser) {
            playerRow.classList.add("current-user");
        }

        // Rank
        const rankCell = document.createElement("td");
        const rankSpan = document.createElement("span");

        rankSpan.className = "player-rank";
        rankSpan.textContent = `#${index + 1}`;

        rankCell.appendChild(rankSpan);

        // Player information
        const playerCell = document.createElement("td");
        const playerWrapper = document.createElement("div");

        playerWrapper.className = "leaderboard-player";

        // Profile picture
        const avatar = document.createElement("div");
        avatar.className = "player-avatar";

        displayAvatar(avatar, player);

        // Name and username
        const information = document.createElement("div");
        information.className = "player-information";

        const playerName = document.createElement("strong");
        playerName.textContent = player.name || "Player";

        const username = document.createElement("small");
        username.textContent = player.username || "";

        information.appendChild(playerName);
        information.appendChild(username);

        // Current user label
        if (player.isCurrentUser) {
            const youLabel = document.createElement("small");

            youLabel.textContent = "You";
            youLabel.style.color = "#c4b5fd";

            information.appendChild(youLabel);
        }

        playerWrapper.appendChild(avatar);
        playerWrapper.appendChild(information);
        playerCell.appendChild(playerWrapper);

        // Add cells
        playerRow.appendChild(rankCell);
        playerRow.appendChild(playerCell);

        playerRow.appendChild(
            createCell(player.difficulty, "player-difficulty")
        );

        playerRow.appendChild(
            createCell(player.wpm, "player-wpm")
        );

        playerRow.appendChild(
            createCell(`${player.accuracy}%`, "player-accuracy")
        );

        leaderboardContainer.appendChild(playerRow);
    });

    updateLoadMoreButton(sortedPlayers.length);
}


// ========================================
// LOAD MORE PLAYERS
// ========================================

function updateLoadMoreButton(totalPlayers) {
    if (!loadMoreButton) return;

    loadMoreButton.style.display =
        visiblePlayers >= totalPlayers ? "none" : "block";
}

if (loadMoreButton) {
    loadMoreButton.addEventListener("click", () => {
        visiblePlayers += 5;
        displayLeaderboard();
    });
}


// ========================================
// DISPLAY TOP THREE PLAYERS
// ========================================

function displayTopPlayers() {
    const topPlayers = getSortedPlayers().slice(0, 3);

    const podiumPositions = [
        "#first-place",
        "#second-place",
        "#third-place"
    ];

    podiumPositions.forEach((selector, index) => {
        const podiumElement = document.querySelector(selector);

        if (!podiumElement) return;

        const player = topPlayers[index];

        const avatar = podiumElement.querySelector(".podium-avatar");
        const name = podiumElement.querySelector("h3");
        const score = podiumElement.querySelector(".podium-score");

        if (!player) {
            if (avatar) avatar.textContent = "?";
            if (name) name.textContent = "No Player";
            if (score) score.textContent = "-- WPM";

            return;
        }

        // Actual profile picture
        displayAvatar(avatar, player);

        if (name) {
            name.textContent = player.name || "Player";
        }

        if (score) {
            score.textContent = `${player.wpm} WPM`;
        }
    });
}


// ========================================
// DISPLAY CURRENT USER RANK
// ========================================

function displayCurrentUserRank() {
    if (!userRankElement) return;

    const sortedPlayers = getSortedPlayers();

    const currentRank = sortedPlayers.findIndex(
        player => player.isCurrentUser
    );

    userRankElement.textContent =
        currentRank === -1 ? "--" : `#${currentRank + 1}`;
}


// ========================================
// REFRESH ALL LEADERBOARD DISPLAYS
// ========================================

function refreshLeaderboardDisplay() {
    displayLeaderboard();
    displayTopPlayers();
    displayCurrentUserRank();
}


// ========================================
// LOAD LEADERBOARD FROM MYSQL
// ========================================

async function loadLeaderboard(resetVisible = true) {
    if (isLoading) return;

    isLoading = true;

    if (resetVisible && leaderboardContainer) {
        leaderboardContainer.innerHTML = `
            <tr>
                <td colspan="5" class="leaderboard-empty">
                    Loading player rankings...
                </td>
            </tr>
        `;
    }

    try {
        const response = await fetch(
            `/api/leaderboard?difficulty=${encodeURIComponent(selectedDifficulty)}`,
            {
                method: "GET",
                credentials: "same-origin",
                headers: {
                    "Accept": "application/json"
                }
            }
        );

        if (response.status === 401) {
            window.location.href = "login.html";
            return;
        }

        const responseText = await response.text();

        let data;

        try {
            data = JSON.parse(responseText);
        } catch {
            throw new Error(
                "The server returned an invalid response. Please check your login and API route."
            );
        }

        if (!response.ok || !data.success) {
            throw new Error(
                data.message || "Unable to load leaderboard."
            );
        }

        leaderboardPlayers = Array.isArray(data.rankings)
            ? data.rankings.map(player => ({
                ...player,
                name: player.name || "Player",
                username: player.username || "",
                wpm: Number(player.wpm) || 0,
                accuracy: Number(player.accuracy) || 0
            }))
            : [];

        if (resetVisible) {
            visiblePlayers = 5;
        }

        refreshLeaderboardDisplay();

    } catch (error) {
        console.error("Leaderboard loading error:", error);

        if (leaderboardContainer) {
            leaderboardContainer.innerHTML = "";

            const row = document.createElement("tr");
            const cell = document.createElement("td");

            cell.colSpan = 5;
            cell.className = "leaderboard-empty";
            cell.textContent =
                error.message || "Unable to load player rankings.";

            row.appendChild(cell);
            leaderboardContainer.appendChild(row);
        }

        if (userRankElement) {
            userRankElement.textContent = "--";
        }

        if (loadMoreButton) {
            loadMoreButton.style.display = "none";
        }

    } finally {
        isLoading = false;
    }
}


// ========================================
// DIFFICULTY FILTERS
// ========================================

difficultyFilters.forEach(filter => {
    filter.addEventListener("click", () => {
        selectedDifficulty = filter.dataset.difficulty;

        difficultyFilters.forEach(button => {
            button.classList.remove("active");
        });

        filter.classList.add("active");

        loadLeaderboard(true);
    });
});


// ========================================
// SORT LEADERBOARD
// ========================================

if (sortSelect) {
    selectedSort = sortSelect.value || "wpm";

    sortSelect.addEventListener("change", () => {
        selectedSort = sortSelect.value;

        visiblePlayers = 5;

        refreshLeaderboardDisplay();
    });
}


// ========================================
// AUTOMATIC LIVE RANKING REFRESH
// ========================================

setInterval(() => {
    if (document.visibilityState === "visible") {
        loadLeaderboard(false);
    }
}, REFRESH_INTERVAL);


// Refresh when user returns to the page

document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
        loadLeaderboard(false);
    }
});


// ========================================
// INITIALIZE LEADERBOARD
// ========================================

loadLeaderboard(true);
