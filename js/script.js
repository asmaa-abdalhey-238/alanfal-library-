
/* ==========================================
   AL-ANFAL LIBRARY
   JavaScript - Main File
========================================== */

document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    // Safe localStorage helpers
    function getStoredValue(key, fallback) {
        try {
            const value = localStorage.getItem(key);
            return value === null ? fallback : value;
        } catch (error) {
            return fallback;
        }
    }

    function saveStoredValue(key, value) {
        try {
            localStorage.setItem(key, value);
            return true;
        } catch (error) {
            return false;
        }
    }

    // Create an accessible message without editing HTML
    function showMessage(form, message, isError) {
        let messageBox = form.querySelector(".js-form-message");

        if (!messageBox) {
            messageBox = document.createElement("p");
            messageBox.className = "js-form-message";
            messageBox.setAttribute("role", "status");
            messageBox.setAttribute("aria-live", "polite");
            form.appendChild(messageBox);
        }

        messageBox.textContent = message;
        messageBox.style.padding = "10px";
        messageBox.style.marginTop = "12px";
        messageBox.style.borderRadius = "8px";
        messageBox.style.color = isError ? "#b00020" : "#18743b";
    }

    // 1. Automatic Dark and Light Mode
    const themeButton = document.getElementById("theme-toggle");
    const savedTheme = getStoredValue("alanfal-theme", null);

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

            saveStoredValue("alanfal-theme", nextTheme);
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


    // 2. General Form Validation
    const forms = document.querySelectorAll("form");

    forms.forEach(function (form) {
        form.querySelectorAll("[required]").forEach(function (field) {
            field.addEventListener("input", function () {
                field.setCustomValidity("");
            });

            field.addEventListener("change", function () {
                field.setCustomValidity("");
            });
        });

        form.addEventListener("submit", function (event) {
            let formIsValid = true;

            const requiredFields = form.querySelectorAll("[required]");

            requiredFields.forEach(function (field) {
                field.setCustomValidity("");

                if (field.type === "checkbox") {
                    if (!field.checked) {
                        formIsValid = false;
                        field.setCustomValidity(
                            "Please accept the required terms."
                        );
                    }
                } else if (!field.value.trim()) {
                    formIsValid = false;
                    field.setCustomValidity(
                        "Please fill in this field."
                    );
                }
            });

            if (!formIsValid) {
                event.preventDefault();
                form.reportValidity();
            }
        });
    });


    // 3. Create Account: Confirm Password
    const accountForm = document.getElementById("confirm-password");

    if (accountForm) {
        const form = accountForm.closest("form");
        const passwordInput = document.getElementById("password");

        function validatePasswords() {
            accountForm.setCustomValidity("");

            if (
                passwordInput &&
                accountForm.value &&
                passwordInput.value !== accountForm.value
            ) {
                accountForm.setCustomValidity(
                    "Passwords do not match. Please try again."
                );
            }
        }

        if (passwordInput) {
            passwordInput.addEventListener("input", validatePasswords);
        }

        accountForm.addEventListener("input", validatePasswords);

        if (form) {
            form.addEventListener("submit", function (event) {
                validatePasswords();

                if (!form.checkValidity()) {
                    event.preventDefault();
                    form.reportValidity();
                    return;
                }

                // No backend registration yet.
                event.preventDefault();

                showMessage(
                    form,
                    "Your information passed validation. Actual account creation will be enabled when the PHP backend is added.",
                    false
                );
            });
        }
    }


    // 4. Contact Form: Save Comments in This Browser
    const commentInput = document.getElementById("comment");
    const visitorNameInput = document.getElementById("visitor-name");
    const visitorEmailInput = document.getElementById("visitor-email");

    if (commentInput && visitorNameInput && visitorEmailInput) {
        const commentForm = commentInput.closest("form");
        const commentsKey = "alanfal-comments";

        function getComments() {
            try {
                const comments = JSON.parse(
                    getStoredValue(commentsKey, "[]")
                );

                return Array.isArray(comments) ? comments : [];
            } catch (error) {
                return [];
            }
        }

        function renderComments() {
            if (!commentForm) return;

            let commentsSection = document.getElementById(
                "saved-comments-section"
            );

            if (!commentsSection) {
                commentsSection = document.createElement("section");
                commentsSection.id = "saved-comments-section";
                commentsSection.className = "contact-card";
                commentsSection.style.marginTop = "20px";

                const heading = document.createElement("h3");
                heading.textContent = "Comments saved on this device";

                const commentsList = document.createElement("div");
                commentsList.id = "saved-comments-list";

                commentsSection.appendChild(heading);
                commentsSection.appendChild(commentsList);

                const contactContainer =
                    document.querySelector(".contact-grid");

                if (contactContainer) {
                    contactContainer.insertAdjacentElement(
                        "afterend",
                        commentsSection
                    );
                } else {
                    commentForm.insertAdjacentElement(
                        "afterend",
                        commentsSection
                    );
                }
            }

            const commentsList = document.getElementById(
                "saved-comments-list"
            );

            if (!commentsList) return;

            commentsList.replaceChildren();

            const comments = getComments();

            if (comments.length === 0) {
                const emptyMessage = document.createElement("p");
                emptyMessage.textContent =
                    "No comments have been saved on this device yet.";
                commentsList.appendChild(emptyMessage);
                return;
            }

            comments.slice().reverse().forEach(function (comment) {
                const article = document.createElement("article");
                article.style.padding = "12px";
                article.style.marginBottom = "10px";
                article.style.borderRadius = "8px";
                article.style.border = "1px solid #cccccc";

                const name = document.createElement("h4");
                name.textContent = comment.name;

                const date = document.createElement("small");
                date.textContent = comment.date;

                const message = document.createElement("p");
                message.textContent = comment.comment;

                article.appendChild(name);
                article.appendChild(date);
                article.appendChild(message);
                commentsList.appendChild(article);
            });
        }

        if (commentForm) {
            commentForm.addEventListener("submit", function (event) {
                event.preventDefault();

                const name = visitorNameInput.value.trim();
                const email = visitorEmailInput.value.trim();
                const commentText = commentInput.value.trim();

                if (!name || !email || !commentText) {
                    showMessage(
                        commentForm,
                        "Please complete your name, email, and comment.",
                        true
                    );
                    return;
                }

                if (!visitorEmailInput.checkValidity()) {
                    visitorEmailInput.reportValidity();
                    return;
                }

                const comments = getComments();

                comments.push({
                    name: name,
                    email: email,
                    comment: commentText,
                    date: new Date().toLocaleString()
                });

                const saved = saveStoredValue(
                    commentsKey,
                    JSON.stringify(comments)
                );

                if (!saved) {
                    showMessage(
                        commentForm,
                        "The comment could not be saved in this browser. Please check your browser storage settings.",
                        true
                    );
                    return;
                }

                showMessage(
                    commentForm,
                    "Your comment was saved on this device. It has not been sent to the library administrators.",
                    false
                );

                commentForm.reset();
                renderComments();
            });

            commentForm.addEventListener("reset", function () {
                const messageBox =
                    commentForm.querySelector(".js-form-message");

                if (messageBox) {
                    messageBox.textContent = "";
                }
            });
        }

        renderComments();
    }


    // 5. Book Search
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

            section.hidden =
                query !== "" && !sectionHasVisibleBook;
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
                    (visibleCount === 1
                        ? " matching book."
                        : " matching books.");
            }
        }
    }

    if (searchInput) {
        searchInput.addEventListener("input", searchBooks);
        searchBooks();
    }


    // 6. Favorite Buttons
    const favoriteButtons = document.querySelectorAll("[data-favorite]");
    const favoritesList = document.getElementById("favorites-list");
    let favorites = [];

    try {
        favorites = JSON.parse(
            getStoredValue("alanfal-favorites", "[]")
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

        document.querySelectorAll(
            ".book-card[data-book-id]"
        ).forEach(function (card) {
            if (!favoriteIds.has(card.dataset.bookId)) return;

            const copy = card.cloneNode(true);

            copy.querySelectorAll("[data-favorite]").forEach(
                function (button) {
                    button.remove();
                }
            );

            // Do not carry over search visibility to the copy.
            copy.hidden = false;

            favoritesList.appendChild(copy);
        });

        // Hide the old placeholder card already present in books.html.
        const oldPlaceholder = document.querySelector(
            "#favorites .card.text-center"
        );

        if (oldPlaceholder) {
            oldPlaceholder.hidden = favoritesList.children.length > 0;
        }

        if (favoritesList.children.length === 0) {
            favoritesList.textContent =
                "You have no favorite books yet. Add a book using the favorite button.";
        }
    }

    favoriteButtons.forEach(function (button) {
        const bookId = button.dataset.favorite;

        if (!bookId) return;

        updateFavoriteButton(
            button,
            favorites.includes(bookId)
        );

        button.addEventListener("click", function () {
            const index = favorites.indexOf(bookId);

            if (index === -1) {
                favorites.push(bookId);
            } else {
                favorites.splice(index, 1);
            }

            const saved = saveStoredValue(
                "alanfal-favorites",
                JSON.stringify(favorites)
            );

            if (!saved) {
                showMessage(
                    button.parentElement,
                    "Favorites could not be saved in this browser.",
                    true
                );
                return;
            }

            updateFavoriteButton(
                button,
                favorites.includes(bookId)
            );

            renderFavorites();
        });
    });

    renderFavorites();


    // 7. Keep the Footer Year Updated
    const yearElements = document.querySelectorAll(
        "[data-current-year]"
    );

    yearElements.forEach(function (element) {
        element.textContent = new Date().getFullYear();
    });


    // 8. Avoid Following Empty Placeholder Links
    document.querySelectorAll('a[href="#"]').forEach(
        function (link) {
            link.addEventListener("click", function (event) {
                event.preventDefault();
            });
        }
    );

    console.log(
        "Al-Anfal Library JavaScript loaded successfully."
    );
});
