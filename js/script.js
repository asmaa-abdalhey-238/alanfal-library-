
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
    const searchResults = document.getElementById("search-results");

    const bookSections = document.querySelectorAll(
        "#science, #literature, #education, " +
        "#student-corner, #pdf-books"
    );

    const bookCards = document.querySelectorAll(
        "#science .book-card, " +
        "#literature .book-card, " +
        "#education .book-card, " +
        "#student-corner .book-card, " +
        "#pdf-books .book-card"
    );

    function searchBooks() {
        if (!searchInput) return;

        const query = searchInput.value.trim().toLowerCase();
        let visibleCount = 0;

        bookCards.forEach(function (card) {
            const bookText = card.textContent
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

const matches = bookText.includes(query);

            card.hidden = !matches;

            if (matches) {
                visibleCount++;
            }
        });

        bookSections.forEach(function (section) {
            const sectionHasVisibleBook = Array.from(
                section.querySelectorAll(".book-card")
            ).some(function (card) {
                return !card.hidden;
            });

            section.hidden = query !== "" && !sectionHasVisibleBook;
        });

        if (searchResults) {
            if (query === "") {
                searchResults.textContent =
                    "Showing all " + visibleCount + " books.";
            } else if (visibleCount === 0) {
                searchResults.textContent =
                    "No books found. Try another title or category.";
            } else {
                searchResults.textContent =
                    "Found " + visibleCount +
                    (visibleCount === 1 ? " matching book." : " matching books.");
            }
        }
    }

    if (searchInput) {
        searchInput.addEventListener("input", searchBooks);
        searchBooks();
    }
    
    // 4. Favorite Buttons
    const favoriteButtons = document.querySelectorAll("[data-favorite]");
    const favoritesList = document.getElementById("favorites-list");
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

    function renderFavorites() {
        if (!favoritesList) return;

        favoritesList.replaceChildren();

        const favoriteIds = new Set(favorites);

        document.querySelectorAll(".book-card[data-book-id]").forEach(
            function (card) {
                if (!favoriteIds.has(card.dataset.bookId)) return;

                const copy = card.cloneNode(true);
                copy.querySelectorAll("[data-favorite]").forEach(
                    function (button) {
                        button.remove();
                    }
                );

                favoritesList.appendChild(copy);
            }
        );

        if (favoritesList.children.length === 0) {
            favoritesList.textContent =
                "You have no favorite books yet. Add a book using the favorite button.";
        }
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
            renderFavorites();
        });
    });

    renderFavorites();
    // 5. Footer Year
    const yearElements = document.querySelectorAll("[data-current-year]");

    yearElements.forEach(function (element) {
        element.textContent = new Date().getFullYear();
    });

    console.log("Al-Anfal Library JavaScript loaded successfully.");
});
