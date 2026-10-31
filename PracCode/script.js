
/* ========================================
   PRACCODE - MAIN JAVASCRIPT
======================================== */


/* 1. MOBILE NAVIGATION */

const menuToggle = document.getElementById("menu-toggle");
const navLinks = document.getElementById("nav-links");

if (menuToggle && navLinks) {

    menuToggle.addEventListener("click", function () {

        navLinks.classList.toggle("active");

        const isOpen = navLinks.classList.contains("active");

        menuToggle.textContent = isOpen ? "✕" : "☰";

        menuToggle.setAttribute("aria-expanded", isOpen);

    });

    // Close menu when a navigation link is clicked
    navLinks.querySelectorAll("a").forEach(function (link) {

        link.addEventListener("click", function () {

            navLinks.classList.remove("active");

            menuToggle.textContent = "☰";

            menuToggle.setAttribute("aria-expanded", "false");

        });

    });

}


/* 2. CURRENT YEAR IN FOOTER */

const currentYear = document.getElementById("current-year");

if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
}


/* 3. SCROLL REVEAL ANIMATIONS */

const revealElements = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {

    const revealObserver = new IntersectionObserver(
        function (entries, observer) {

            entries.forEach(function (entry) {

                if (entry.isIntersecting) {

                    entry.target.classList.add("active");

                    observer.unobserve(entry.target);

                }

            });

        },
        {
            threshold: 0.15
        }
    );

    revealElements.forEach(function (element) {
        revealObserver.observe(element);
    });

} else {

    // Show elements immediately in older browsers
    revealElements.forEach(function (element) {
        element.classList.add("active");
    });

}


/* 4. SMOOTH SCROLLING */

document.querySelectorAll('a[href^="#"]').forEach(function (link) {

    link.addEventListener("click", function (event) {

        const targetId = this.getAttribute("href");

        if (!targetId || targetId === "#") {
            return;
        }

        const targetElement = document.querySelector(targetId);

        if (targetElement) {

            event.preventDefault();

            targetElement.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }

    });

});


/* 5. ACTIVE NAVIGATION LINK */

const sections = document.querySelectorAll("main section[id]");

const navigationLinks = document.querySelectorAll(
    '.nav-links a[href^="#"]'
);

if ("IntersectionObserver" in window && sections.length > 0) {

    const sectionObserver = new IntersectionObserver(
        function (entries) {

            entries.forEach(function (entry) {

                if (entry.isIntersecting) {

                    navigationLinks.forEach(function (link) {
                        link.classList.remove("active");

                        if (
                            link.getAttribute("href") ===
                            "#" + entry.target.id
                        ) {
                            link.classList.add("active");
                        }
                    });

                }

            });

        },
        {
            threshold: 0.4
        }
    );

    sections.forEach(function (section) {
        sectionObserver.observe(section);
    });

}


/* 6. TOAST NOTIFICATION */

function showToast(message) {

    // Remove an existing notification
    const existingToast = document.querySelector(".toast");

    if (existingToast) {
        existingToast.remove();
    }

    // Create notification
    const toast = document.createElement("div");

    toast.className = "toast";

    toast.textContent = message;

    document.body.appendChild(toast);

    // Remove after 3 seconds
    setTimeout(function () {
        toast.remove();
    }, 3000);

}


/* 7. BUTTON INTERACTIONS */

document.querySelectorAll("[data-toast]").forEach(function (button) {

    button.addEventListener("click", function () {

        const message = this.getAttribute("data-toast");

        if (message) {
            showToast(message);
        }

    });

});


/* 8. CLOSE MOBILE MENU WHEN CLICKING OUTSIDE */

document.addEventListener("click", function (event) {

    if (!menuToggle || !navLinks) {
        return;
    }

    const clickedInsideMenu = navLinks.contains(event.target);

    const clickedToggle = menuToggle.contains(event.target);

    if (!clickedInsideMenu && !clickedToggle) {

        navLinks.classList.remove("active");

        menuToggle.textContent = "☰";

        menuToggle.setAttribute("aria-expanded", "false");

    }

});


/* 9. BACK TO TOP BUTTON SUPPORT */

const backToTop = document.getElementById("back-to-top");

if (backToTop) {

    backToTop.addEventListener("click", function () {

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    });

}


/* 10. PAGE LOAD */

document.addEventListener("DOMContentLoaded", function () {

    document.body.classList.add("page-loaded");

    console.log("PracCode website loaded successfully!");

});
