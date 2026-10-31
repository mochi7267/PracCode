// PracCode authentication (Node.js + Express API)
(() => {
  "use strict";
  const API = "/api/auth";

  function showMessage(form, text, type = "error") {
    const box = form?.querySelector(".auth-message");
    if (!box) return;
    box.textContent = text;
    box.className = `auth-message ${type}`;
  }

  async function request(endpoint, data) {
    let response;
    try {
      response = await fetch(`${API}/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(data)
      });
    } catch {
      throw new Error("Cannot reach the PracCode server. Make sure Node.js is running.");
    }
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      throw new Error(`Server returned an unexpected response (HTTP ${response.status}). Check that Node.js is running.`);
    }
    const result = await response.json();
    if (!response.ok || !result.success) throw new Error(result.message || "Request failed.");
    return result;
  }

  document.querySelectorAll(".password-toggle").forEach(button => {
    button.addEventListener("click", () => {
      const input = document.getElementById(button.dataset.passwordToggle);
      if (!input) return;
      input.type = input.type === "password" ? "text" : "password";
      button.setAttribute("aria-label", input.type === "password" ? "Show password" : "Hide password");
      const icon = button.querySelector("i");
      if (icon) icon.className = input.type === "password" ? "fa-regular fa-eye" : "fa-regular fa-eye-slash";
    });
  });

  const loginForm = document.querySelector("#login-form");
  if (loginForm) loginForm.addEventListener("submit", async event => {
    event.preventDefault();
    const submit = loginForm.querySelector('[type="submit"]');
    const email = loginForm.querySelector('[name="email"]').value.trim();
    const password = loginForm.querySelector('[name="password"]').value;
    submit.disabled = true;
    try {
      const result = await request("login", { email, password });
      showMessage(loginForm, result.message, "success");
      window.location.href = "home.html";
    } catch (error) { showMessage(loginForm, error.message); }
    finally { submit.disabled = false; }
  });

  const registerForm = document.querySelector("#register-form");
  if (registerForm) registerForm.addEventListener("submit", async event => {
    event.preventDefault();
    const name = registerForm.querySelector('[name="name"]').value.trim();
    const username = registerForm.querySelector('[name="username"]').value.trim();
    const email = registerForm.querySelector('[name="email"]').value.trim();
    const password = registerForm.querySelector('[name="password"]').value;
    const confirmPassword = registerForm.querySelector('[name="confirmPassword"]').value;
    const terms = registerForm.querySelector('[name="terms"]').checked;
    if (password !== confirmPassword) return showMessage(registerForm, "Passwords do not match.");
    if (!terms) return showMessage(registerForm, "Please accept the Terms of Service and Privacy Policy.");
    const submit = registerForm.querySelector('[type="submit"]');
    submit.disabled = true;
    try {
      const result = await request("register", { name, username, email, password });
      showMessage(registerForm, result.message, "success");
      window.location.href = "home.html";
    } catch (error) { showMessage(registerForm, error.message); }
    finally { submit.disabled = false; }
  });
})();
