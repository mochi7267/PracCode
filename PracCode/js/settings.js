
// ========================================
// PRACCODE - SETTINGS JAVASCRIPT
// ========================================

(function () {
    "use strict";

    // 1. DEFAULT SETTINGS

    const defaultSettings = {
        theme: "dark",
        soundEffects: true,
        fontSize: "medium"
    };

    let userSettings = { ...defaultSettings };


    // 2. LOAD SAVED SETTINGS

    function loadSettings() {
        try {
            const savedSettings = JSON.parse(
                localStorage.getItem("praccode-settings")
            );

            if (savedSettings && typeof savedSettings === "object") {
                userSettings = {
                    ...defaultSettings,
                    ...savedSettings
                };
            }
        } catch (error) {
            console.error("Unable to load settings:", error);
            userSettings = { ...defaultSettings };
        }

        if (!["dark", "light"].includes(userSettings.theme)) {
            userSettings.theme = "dark";
        }

        if (typeof userSettings.soundEffects !== "boolean") {
            userSettings.soundEffects = true;
        }

        if (!["small", "medium", "large"].includes(userSettings.fontSize)) {
            userSettings.fontSize = "medium";
        }
    }


    // 3. SAVE SETTINGS

    function saveSettings() {
        try {
            localStorage.setItem(
                "praccode-settings",
                JSON.stringify(userSettings)
            );

            updateSettingsStatus("Your settings have been saved.");
        } catch (error) {
            console.error("Unable to save settings:", error);
            updateSettingsStatus("Unable to save your settings.");
        }
    }


    // 4. UPDATE STATUS

    function updateSettingsStatus(message) {
        const statusElement = document.querySelector("#settings-status");

        if (statusElement) {
            statusElement.textContent = message;
        }
    }


    // 5. GET SETTINGS ELEMENTS

    const themeButton = document.querySelector("#settings-theme-toggle");
    const soundToggle = document.querySelector("#sound-effects-toggle");
    const fontSizeSelect = document.querySelector("#font-size-select");
    const resetSettingsButton = document.querySelector("#reset-settings");


    // 6. APPLY THEME

    function applyTheme() {
        document.documentElement.setAttribute(
            "data-theme",
            userSettings.theme
        );

        if (themeButton) {
            themeButton.textContent =
                userSettings.theme === "dark"
                    ? "Switch to Light Mode"
                    : "Switch to Dark Mode";
        }
    }


    // 7. APPLY SOUND SETTINGS

    function applySoundSettings() {
        if (soundToggle) {
            soundToggle.checked = userSettings.soundEffects;
        }
    }


    // 8. APPLY FONT SIZE

    function applyFontSize() {
        document.documentElement.setAttribute(
            "data-font-size",
            userSettings.fontSize
        );

        if (fontSizeSelect) {
            fontSizeSelect.value = userSettings.fontSize;
        }
    }


    // 9. THEME SWITCHING

    if (themeButton) {
        themeButton.addEventListener("click", () => {
            userSettings.theme =
                userSettings.theme === "dark" ? "light" : "dark";

            applyTheme();
            saveSettings();
        });
    }


    // 10. SOUND SETTINGS

    if (soundToggle) {
        soundToggle.addEventListener("change", () => {
            userSettings.soundEffects = soundToggle.checked;
            saveSettings();
        });
    }


    // 11. FONT SIZE SETTINGS

    if (fontSizeSelect) {
        fontSizeSelect.addEventListener("change", () => {
            const selectedSize = fontSizeSelect.value;
            const allowedSizes = ["small", "medium", "large"];

            if (!allowedSizes.includes(selectedSize)) {
                return;
            }

            userSettings.fontSize = selectedSize;

            applyFontSize();
            saveSettings();
        });
    }


    // 12. RESET SETTINGS

    if (resetSettingsButton) {
        resetSettingsButton.addEventListener("click", () => {
            const confirmReset = confirm(
                "Are you sure you want to reset all settings?"
            );

            if (!confirmReset) {
                return;
            }

            userSettings = { ...defaultSettings };

            applyTheme();
            applySoundSettings();
            applyFontSize();

            saveSettings();

            updateSettingsStatus(
                "All settings have been restored to default."
            );
        });
    }


    // 13. INITIALIZE SETTINGS

    loadSettings();

    applyTheme();
    applySoundSettings();
    applyFontSize();

    updateSettingsStatus("Your settings are up to date.");

})();

// ========================================
// END OF SETTINGS JAVASCRIPT
// ========================================
