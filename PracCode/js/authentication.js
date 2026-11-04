// ============================================
// PRACCODE AUTHENTICATION
// Cloudflare Workers + D1 API
// Login + Registration + Success Popup
// ============================================

(() => {
  "use strict";

  const API = "https://praccode-api.joshuarabino7267.workers.dev/api/auth";

  // ============================================
  // DISPLAY ERROR / SUCCESS MESSAGES
  // ============================================

  function showMessage(form, text, type = "error") {
    const box = form?.querySelector(".auth-message");

    if (!box) return;

    box.textContent = text;
    box.className = `auth-message ${type}`;
  }

  // ============================================
  // API REQUEST FUNCTION
  // ============================================

  async function request(endpoint, data) {
    let response;

    try {
      response = await fetch(`${API}/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(data)
      });
    } catch {
      throw new Error(
        "Cannot connect to PracCode. Please check your internet connection and try again."
      );
    }

    const contentType = response.headers.get("content-type") || "";

    if (!contentType.includes("application/json")) {
      throw new Error(
        `Server returned an unexpected response (HTTP ${response.status}).`
      );
    }

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Request failed.");
    }

    return result;
  }

  // ============================================
  // SUCCESS POPUP ANIMATION
  // ============================================

  function showRedirectPopup(title, message, captionText) {
    document.querySelector(".redirect-popup")?.remove();
    document.querySelector("#redirect-popup-styles")?.remove();

    const style = document.createElement("style");

    style.id = "redirect-popup-styles";

    style.textContent = `
      .redirect-popup,
      .redirect-popup * {
        box-sizing: border-box;
      }

      .redirect-popup {
        position: fixed;
        inset: 0;
        z-index: 999999;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        background: rgba(8, 15, 30, 0.78);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        animation: popupFadeIn 0.3s ease;
      }

      .redirect-card {
        width: 100%;
        max-width: 410px;
        padding: 38px 32px 32px;
        border-radius: 24px;
        background: #ffffff;
        color: #172033 !important;
        text-align: center;
        box-shadow: 0 25px 70px rgba(0, 0, 0, 0.3);
        animation: popupSlideIn 0.4s ease;
      }

      .redirect-check {
        width: 76px;
        height: 76px;
        margin: 0 auto 22px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        background: #dcfce7;
        color: #16a34a !important;
        font-size: 43px;
        font-weight: 700;
        animation: checkBounce 0.6s ease;
      }

      .redirect-card h2 {
        margin: 0 0 12px !important;
        padding: 0 !important;
        color: #172033 !important;
        font-family: Arial, sans-serif;
        font-size: 27px !important;
        font-weight: 750 !important;
        line-height: 1.3 !important;
        letter-spacing: -0.5px;
      }

      .redirect-card p {
        margin: 0 0 28px !important;
        color: #64748b !important;
        font-family: Arial, sans-serif;
        font-size: 15px !important;
        line-height: 1.6;
      }

      .redirect-loading {
        width: 100%;
        height: 8px;
        overflow: hidden;
        border-radius: 20px;
        background: #e2e8f0;
      }

      .redirect-loading span {
        display: block;
        width: 0;
        height: 100%;
        border-radius: 20px;
        background: linear-gradient(90deg, #16a34a, #4ade80);
        animation: redirectProgress 2s linear forwards;
      }

      .redirect-caption {
        display: block;
        margin-top: 15px;
        color: #64748b !important;
        font-family: Arial, sans-serif;
        font-size: 13px;
        line-height: 1.5;
      }

      @keyframes popupFadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      @keyframes popupSlideIn {
        from {
          opacity: 0;
          transform: translateY(20px) scale(0.95);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      @keyframes checkBounce {
        0% { transform: scale(0); }
        70% { transform: scale(1.15); }
        100% { transform: scale(1); }
      }

      @keyframes redirectProgress {
        from { width: 0; }
        to { width: 100%; }
      }

      @media (max-width: 480px) {
        .redirect-card {
          padding: 32px 23px 27px;
          border-radius: 20px;
        }

        .redirect-card h2 {
          font-size: 23px !important;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .redirect-popup,
        .redirect-card,
        .redirect-check,
        .redirect-loading span {
          animation: none !important;
        }

        .redirect-loading span {
          width: 100%;
        }
      }
    `;

    document.head.appendChild(style);

    const popup = document.createElement("div");
    popup.className = "redirect-popup";

    const card = document.createElement("div");
    card.className = "redirect-card";

    const check = document.createElement("div");
    check.className = "redirect-check";
    check.textContent = "✓";

    const heading = document.createElement("h2");
    heading.textContent = title;

    const description = document.createElement("p");
    description.textContent = message;

    const progress = document.createElement("div");
    progress.className = "redirect-loading";

    const bar = document.createElement("span");
    progress.appendChild(bar);

    const caption = document.createElement("span");
    caption.className = "redirect-caption";
    caption.textContent = captionText;

    card.append(
      check,
      heading,
      description,
      progress,
      caption
    );

    popup.appendChild(card);
    document.body.appendChild(popup);
  }

  // ============================================
  // PASSWORD SHOW / HIDE
  // ============================================

  document.querySelectorAll(".password-toggle").forEach(button => {
    button.addEventListener("click", () => {
      const input = document.getElementById(
        button.dataset.passwordToggle
      );

      if (!input) return;

      input.type =
        input.type === "password" ? "text" : "password";

      button.setAttribute(
        "aria-label",
        input.type === "password"
          ? "Show password"
          : "Hide password"
      );

      const icon = button.querySelector("i");

      if (icon) {
        icon.className =
          input.type === "password"
            ? "fa-regular fa-eye"
            : "fa-regular fa-eye-slash";
      }
    });
  });

  // ============================================
  // LOGIN
  // ============================================

  const loginForm = document.querySelector("#login-form");

  if (loginForm) {
    loginForm.addEventListener("submit", async event => {
      event.preventDefault();

      const submit = loginForm.querySelector('[type="submit"]');

      const email = loginForm
        .querySelector('[name="email"]')
        .value.trim();

      const password = loginForm
        .querySelector('[name="password"]')
        .value;

      submit.disabled = true;

      try {
        await request("login", {
          email,
          password
        });

        showRedirectPopup(
          "Login Successful!",
          "Welcome back to PracCode!",
          "Please wait... Redirecting to dashboard"
        );

        setTimeout(() => {
          window.location.href = "home.html";
        }, 2000);

      } catch (error) {
        showMessage(loginForm, error.message);
        submit.disabled = false;
      }
    });
  }

  // ============================================
  // REGISTRATION
  // ============================================

  const registerForm = document.querySelector("#register-form");

  if (registerForm) {
    registerForm.addEventListener("submit", async event => {
      event.preventDefault();

      const name = registerForm
        .querySelector('[name="name"]')
        .value.trim();

      const username = registerForm
        .querySelector('[name="username"]')
        .value.trim();

      const email = registerForm
        .querySelector('[name="email"]')
        .value.trim();

      const password = registerForm
        .querySelector('[name="password"]')
        .value;

      const confirmPassword = registerForm
        .querySelector('[name="confirmPassword"]')
        .value;

      const terms = registerForm
        .querySelector('[name="terms"]')
        .checked;

      // Validate password confirmation
      if (password !== confirmPassword) {
        return showMessage(
          registerForm,
          "Passwords do not match."
        );
      }

      // Validate terms acceptance
      if (!terms) {
        return showMessage(
          registerForm,
          "Please accept the Terms of Service and Privacy Policy."
        );
      }

      const submit = registerForm.querySelector('[type="submit"]');

      submit.disabled = true;

      try {
        await request("register", {
          name,
          username,
          email,
          password
        });

        showRedirectPopup(
          "Registration Successful!",
          "Your PracCode account has been created successfully!",
          "Please wait... Redirecting to login"
        );

        setTimeout(() => {
          window.location.href = "login.html";
        }, 2000);

      } catch (error) {
        showMessage(registerForm, error.message);
        submit.disabled = false;
      }
    });
  }

})();