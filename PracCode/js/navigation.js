
// ========================================
// PRACCODE - NAVIGATION JAVASCRIPT
// ========================================

(function () {
    "use strict";

    // 1. MOBILE NAVIGATION MENU

    const menuToggle = document.querySelector("#menu-toggle");
    const navigationMenu = document.querySelector(".nav-links");

    if (menuToggle && navigationMenu) {
        menuToggle.addEventListener("click", () => {
            navigationMenu.classList.toggle("active");

            const isOpen = navigationMenu.classList.contains("active");
            menuToggle.setAttribute("aria-expanded", String(isOpen));
        });
    }

    const navigationLinks = document.querySelectorAll(".nav-links a");

    navigationLinks.forEach((link) => {
        link.addEventListener("click", () => {
            navigationMenu?.classList.remove("active");
            menuToggle?.setAttribute("aria-expanded", "false");
        });
    });


    // 2. ACTIVE NAVIGATION LINK

    function setActiveNavigationLink() {
        const currentPage = window.location.pathname.split("/").pop();

        const allLinks = document.querySelectorAll(
            ".nav-links a, .dashboard-nav a"
        );

        allLinks.forEach((link) => {
            const href = link.getAttribute("href");

            if (!href || href.startsWith("#")) return;

            const linkedPage = href.split("/").pop().split("?")[0];

            if (linkedPage === currentPage) {
                link.classList.add("active");
            } else {
                link.classList.remove("active");
            }
        });
    }

    setActiveNavigationLink();


    // 3. DROPDOWN MENUS

    const dropdownButtons = document.querySelectorAll(
        "[data-dropdown-toggle]"
    );

    dropdownButtons.forEach((button) => {
        button.addEventListener("click", (event) => {
            event.stopPropagation();

            const dropdownId = button.dataset.dropdownToggle;
            const dropdown = document.getElementById(dropdownId);

            if (!dropdown) return;

            document.querySelectorAll(".dropdown-menu").forEach((menu) => {
                if (menu !== dropdown) {
                    menu.classList.remove("show");
                }
            });

            dropdown.classList.toggle("show");
        });
    });

    document.addEventListener("click", (event) => {
        if (!event.target.closest(".dropdown")) {
            document.querySelectorAll(".dropdown-menu").forEach((menu) => {
                menu.classList.remove("show");
            });
        }
    });


    // 4. ACCOUNT MENU

    const accountButton = document.querySelector("#account-menu-button");
    const accountMenu = document.querySelector("#account-menu");

    if (accountButton && accountMenu) {
        accountButton.addEventListener("click", (event) => {
            event.stopPropagation();
            accountMenu.classList.toggle("show");
        });
    }


    // 5. SHARED THEME SETTINGS

    function getSavedSettings() {
        const defaults = {
            theme: "dark",
            soundEffects: true,
            fontSize: "medium"
        };

        try {
            const saved = JSON.parse(
                localStorage.getItem("praccode-settings")
            );

            return {
                ...defaults,
                ...(saved && typeof saved === "object" ? saved : {})
            };
        } catch (error) {
            console.error("Unable to load settings:", error);
            return defaults;
        }
    }

    function saveSharedSettings(settings) {
        try {
            localStorage.setItem(
                "praccode-settings",
                JSON.stringify(settings)
            );
        } catch (error) {
            console.error("Unable to save settings:", error);
        }
    }

    const themeToggle = document.querySelector("#theme-toggle");
    let sharedSettings = getSavedSettings();

    document.documentElement.setAttribute(
        "data-theme",
        sharedSettings.theme
    );

    document.documentElement.setAttribute(
        "data-font-size",
        sharedSettings.fontSize
    );

    if (themeToggle) {
        themeToggle.addEventListener("click", () => {
            sharedSettings = getSavedSettings();

            sharedSettings.theme =
                sharedSettings.theme === "dark" ? "light" : "dark";

            document.documentElement.setAttribute(
                "data-theme",
                sharedSettings.theme
            );

            saveSharedSettings(sharedSettings);
        });
    }


    // 6. LOGOUT BUTTON

    const logoutButton = document.querySelector("#logout-button");

    if (logoutButton) {
        logoutButton.addEventListener("click", () => {
            const confirmLogout = confirm(
                "Are you sure you want to log out?"
            );

            if (confirmLogout) {
                const isPagesFolder =
                    window.location.pathname.includes("/pages/");

                window.location.href = isPagesFolder
                    ? "login.html"
                    : "pages/login.html";
            }
        });
    }


    // 7. HELP BUTTON

    const helpButton = document.querySelector("#help-button");

    if (helpButton) {
        helpButton.addEventListener("click", () => {
            alert(
                "Welcome to PracCode Help! More support features will be available soon."
            );
        });
    }


    // 8. EMAIL SUPPORT BUTTON

    const emailSupportButton = document.querySelector("#email-support");

    if (emailSupportButton) {
        emailSupportButton.addEventListener("click", () => {
            window.location.href =
                "mailto:support@praccode.com?subject=PracCode%20Support";
        });
    }


    // 9. ACCOUNT SWITCHING

    const accountSwitchButtons = document.querySelectorAll(
        "[data-switch-account]"
    );

    accountSwitchButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const accountName = button.dataset.switchAccount;

            alert(`Account switching for ${accountName} is a demo feature.`);
        });
    });


    // 10. ADD ACCOUNT

    const addAccountButton = document.querySelector("#add-account-button");

    if (addAccountButton) {
        addAccountButton.addEventListener("click", () => {
            const isPagesFolder =
                window.location.pathname.includes("/pages/");

            window.location.href = isPagesFolder
                ? "login.html"
                : "pages/login.html";
        });
    }


    // 11. CLOSE MENUS WITH ESCAPE KEY

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            navigationMenu?.classList.remove("active");
            menuToggle?.setAttribute("aria-expanded", "false");

            document.querySelectorAll(".dropdown-menu").forEach((menu) => {
                menu.classList.remove("show");
            });

            accountMenu?.classList.remove("show");
        }
    });

})();

// ========================================
// END OF NAVIGATION JAVASCRIPT
// ========================================

// 7. AUTHENTICATED USER
(async function () {
    try {
        const response = await fetch("/api/auth/session", { credentials: "same-origin" });
        if (!response.ok) return;
        const data = await response.json();
        if (!data.success || !data.user) return;
        document.querySelectorAll("[data-user-name]").forEach(el => el.textContent = data.user.full_name);
        document.querySelectorAll("[data-user-username]").forEach(el => el.textContent = "@" + data.user.username);
        document.querySelectorAll("[data-user-email]").forEach(el => el.textContent = data.user.email);
    } catch (error) {
        console.warn("Unable to load signed-in user.", error);
    }
})();

document.addEventListener("click", async (event) => {
    const button = event.target.closest("#logout-button");
    if (!button) return;
    event.preventDefault();
    try { await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" }); }
    finally { window.location.href = "login.html"; }
}, true);
