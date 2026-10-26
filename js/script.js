
/* ==========================================
   AL-ANFAL LIBRARY
   JavaScript - Main File
========================================== */

document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    // 1. Automatic Dark and Light Mode
    const themeButton = document.getElementById("theme-toggle");
    const savedTheme = localStorage.getItem("alanfal-theme");

    function isNightTime() {
        const hour = new Date().getHours();
        return hour >= 18 || hour < 6;
    }

    function applyTheme(theme) {
        const isDark = theme === "dark";

        document.body.classList.toggle("dark-mode", isDark);

        if (themeButton) {
            themeButton.textContent = isDark
                ? "☀️ الوضع النهاري"
                : "🌙 الوضع الليلي";

            themeButton.setAttribute("aria-pressed", String(isDark));
        }
    }

    // A saved choice takes priority over the automatic schedule.
    let manualTheme = savedTheme === "dark" || savedTheme === "light";

    applyTheme(
        manualTheme
            ? savedTheme
            : (isNightTime() ? "dark" : "light")
    );

    if (themeButton) {
        themeButton.addEventListener("click", function () {
            const nextTheme = document.body.classList.contains("dark-mode")
                ? "light"
                : "dark";

            localStorage.setItem("alanfal-theme", nextTheme);
            manualTheme = true;
            applyTheme(nextTheme);
        });
    }

    // Check the time every minute when no manual choice exists.
    setInterval(function () {
        if (!manualTheme) {
            applyTheme(isNightTime() ? "dark" : "light");
        }
    }, 60000);

    // 2. Form Validation
    const forms = document.querySelectorAll("form");

    forms.forEach(function (form) {
        form.addEventListener("submit", function (event) {
            const fields = form.querySelectorAll("[required]");
            let formIsValid = true;

            fields.forEach(function (field) {
                if (!field.value.trim()) {
                    formIsValid = false;
                    field.setCustomValidity("يرجى تعبئة هذا الحقل.");
                } else {
                    field.setCustomValidity("");
                }
            });

            if (!formIsValid) {
                event.preventDefault();
                form.reportValidity();
            }
        });

        form.querySelectorAll("[required]").forEach(function (field) {
            field.addEventListener("input", function () {
                field.setCustomValidity("");
            });
        });
    });

    // 3. Book Search
    const searchInput = document.getElementById("book-search");
    const bookCards = document.querySelectorAll(
        ".book-card, .book-item"
    );

    if (searchInput && bookCards.length > 0) {
        searchInput.addEventListener("input", function () {
            const query = searchInput.value.trim().toLowerCase();

            bookCards.forEach(function (card) {
                const matches = card.textContent
                    .toLowerCase()
                    .includes(query);

                card.hidden = !matches;
            });
        });
    }

    // 4. Favorite Buttons
    const favoriteButtons = document.querySelectorAll("[data-favorite]");
    let favorites = [];

    try {
        favorites = JSON.parse(
            localStorage.getItem("alanfal-favorites") || "[]"
        );

        if (!Array.isArray(favorites)) {
            favorites = [];
        }
    } catch (error) {
        favorites = [];
    }

    function updateFavoriteButton(button, isFavorite) {
        button.textContent = isFavorite
            ? "❤️ إزالة من المفضلة"
            : "🤍 أضف إلى المفضلة";

        button.setAttribute("aria-pressed", String(isFavorite));
    }

    favoriteButtons.forEach(function (button) {
        const bookId = button.dataset.favorite;

        if (!bookId) return;

        updateFavoriteButton(button, favorites.includes(bookId));

        button.addEventListener("click", function () {
            const index = favorites.indexOf(bookId);

            if (index === -1) {
                favorites.push(bookId);
            } else {
                favorites.splice(index, 1);
            }

            localStorage.setItem(
                "alanfal-favorites",
                JSON.stringify(favorites)
            );

            updateFavoriteButton(button, favorites.includes(bookId));
        });
    });

    // 5. Footer Year
    const yearElements = document.querySelectorAll("[data-current-year]");

    yearElements.forEach(function (element) {
        element.textContent = new Date().getFullYear();
    });

    console.log("Al-Anfal Library JavaScript loaded successfully.");
});
