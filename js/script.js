
/* ==========================================
   AL-ANFAL LIBRARY
   JavaScript - Main File
========================================== */

document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    // ==========================================
    // 1. SAFE LOCAL STORAGE HELPERS
    // ==========================================

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

    function showMessage(form, message, isError) {
        if (!form) return;

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


    // ==========================================
    // 2. AUTOMATIC DARK AND LIGHT MODE
    // ==========================================

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

    let manualTheme =
        savedTheme === "dark" || savedTheme === "light";

    applyTheme(
        manualTheme
            ? savedTheme
            : (isNightTime() ? "dark" : "light")
    );

    if (themeButton) {
        themeButton.addEventListener("click", function () {
            const nextTheme =
                document.body.classList.contains("dark-mode")
                    ? "light"
                    : "dark";

            saveStoredValue("alanfal-theme", nextTheme);
            manualTheme = true;
            applyTheme(nextTheme);
        });
    }

    // Automatically change the theme according to time
    // unless the visitor has chosen a theme manually.
    setInterval(function () {
        if (!manualTheme) {
            applyTheme(isNightTime() ? "dark" : "light");
        }
    }, 60000);


    // ==========================================
    // 3. GENERAL FORM VALIDATION
    // ==========================================

    const forms = document.querySelectorAll("form");

    forms.forEach(function (form) {
        form.querySelectorAll("[required]").forEach(function (field) {
            function clearFieldMessage() {
                field.setCustomValidity("");
            }

            field.addEventListener("input", clearFieldMessage);
            field.addEventListener("change", clearFieldMessage);
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


    // ==========================================
    // 4. CREATE ACCOUNT FORM
    // ==========================================

    const confirmPasswordInput =
        document.getElementById("confirm-password");

    const passwordInput =
        document.getElementById("password");

    if (confirmPasswordInput && passwordInput) {
        const accountForm = confirmPasswordInput.closest("form");

        function validatePasswords() {
            confirmPasswordInput.setCustomValidity("");

            if (
                confirmPasswordInput.value &&
                passwordInput.value !== confirmPasswordInput.value
            ) {
                confirmPasswordInput.setCustomValidity(
                    "Passwords do not match. Please try again."
                );
            }
        }

        passwordInput.addEventListener("input", validatePasswords);
        confirmPasswordInput.addEventListener("input", validatePasswords);

        if (accountForm) {
            accountForm.addEventListener("submit", function (event) {
                validatePasswords();

                if (!accountForm.checkValidity()) {
                    event.preventDefault();
                    accountForm.reportValidity();
                    return;
                }

                // This is front-end validation only.
                // Actual account creation requires a backend.
                event.preventDefault();

                showMessage(
                    accountForm,
                    "Your information passed validation. Actual account creation requires the backend stage.",
                    false
                );
            });
        }
    }


    // ==========================================
    // 5. CONTACT FORM AND SAVED COMMENTS
    // ==========================================

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

                const contactGrid =
                    document.querySelector(".contact-grid");

                if (contactGrid) {
                    contactGrid.insertAdjacentElement(
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

            comments.slice().reverse().forEach(function (comment, reverseIndex) {
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

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "🗑️ Delete Comment";
    deleteButton.type = "button";
    deleteButton.dataset.deleteComment =
        String(comments.length - 1 - reverseIndex);

    article.appendChild(name);
    article.appendChild(date);
    article.appendChild(message);
    article.appendChild(deleteButton);

    commentsList.appendChild(article);
});
        }
       // Delete saved comments
document.addEventListener("click", function (event) {
    const button = event.target.closest("[data-delete-comment]");

    if (!button) return;

    const index = Number(button.dataset.deleteComment);
    const comments = getComments();

    if (!Number.isInteger(index) || index < 0 || index >= comments.length) {
        return;
    }

    if (!confirm("Are you sure you want to delete this comment?")) {
        return;
    }

    comments.splice(index, 1);

    if (!saveStoredValue(commentsKey, JSON.stringify(comments))) {
        alert("The comment could not be deleted.");
        return;
    }

    renderComments();
});

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
                        "The comment could not be saved in this browser.",
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


    // ==========================================
    // 6. BOOK SEARCH
    // ==========================================

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
            const hasVisibleBook = Array.from(
                section.querySelectorAll(".book-card")
            ).some(function (card) {
                return !card.hidden;
            });

            section.hidden = query !== "" && !hasVisibleBook;
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


    // ==========================================
    // 7. FAVORITES - ALL BOOK CARDS
    // ==========================================

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

    // Find all book cards, including cards without a book ID.
    function getCatalogCards() {
        const cards = document.querySelectorAll(
            "#science .book-card, " +
            "#literature .book-card, " +
            "#education .book-card, " +
            "#student-corner .book-card, " +
            "#pdf-books .book-card"
        );

        cards.forEach(function (card, index) {
            if (!card.dataset.bookId) {
                const heading = card.querySelector("h3, h2");
                const title = heading
                    ? heading.textContent.trim()
                    : "book-" + (index + 1);

                const slug = title
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/^-|-$/g, "");

                card.dataset.bookId =
                    slug || "book-" + (index + 1);
            }

            // Ensure each existing favorite button uses the card ID.
            card.querySelectorAll("[data-favorite]").forEach(
                function (button) {
                    button.dataset.favorite = card.dataset.bookId;
                }
            );
        });

        return cards;
    }

    function updateFavoriteButton(button, isFavorite) {
        button.textContent = isFavorite
            ? "❤️ إزالة من المفضلة"
            : "🤍 أضف إلى المفضلة";

        button.setAttribute("aria-pressed", String(isFavorite));
        button.type = "button";
        button.classList.add("favorite-button");
    }

    // Create a favorite button for every book card.
    function initializeFavoriteButtons() {
        getCatalogCards().forEach(function (card) {
            let button = card.querySelector("[data-favorite]");

            if (!button) {
                button = document.createElement("button");
                button.type = "button";
                button.className = "favorite-button";
                button.style.marginTop = "10px";
                button.style.cursor = "pointer";

                card.appendChild(button);
            }

            button.dataset.favorite = card.dataset.bookId;

            updateFavoriteButton(
                button,
                favorites.includes(card.dataset.bookId)
            );
        });
    }

    function renderFavorites() {
        if (!favoritesList) return;

        favoritesList.replaceChildren();

        const cards = getCatalogCards();
        const displayedIds = new Set();

        cards.forEach(function (card) {
            const bookId = card.dataset.bookId;

            if (
                !favorites.includes(bookId) ||
                displayedIds.has(bookId)
            ) {
                return;
            }

            displayedIds.add(bookId);

            const copy = card.cloneNode(true);
            copy.hidden = false;

            copy.querySelectorAll("[data-favorite]").forEach(
                function (button) {
                    button.remove();
                }
            );

            favoritesList.appendChild(copy);
        });

        const placeholder = document.querySelector(
            "#favorites .card.text-center"
        );

        if (placeholder) {
            placeholder.hidden = favoritesList.children.length > 0;
        }

        if (favoritesList.children.length === 0) {
            favoritesList.textContent =
                "You have no favorite books yet. Add a book using the favorite button.";
        }
    }

    initializeFavoriteButtons();

    // One delegated handler supports every favorite button.
    document.addEventListener("click", function (event) {
        const target = event.target;

        if (!(target instanceof Element)) return;

        const button = target.closest("[data-favorite]");

        if (!button) return;

        const bookCard = button.closest(".book-card");

        if (!bookCard) return;

        // Only handle buttons on original catalog cards.
        if (!bookCard.closest(
            "#science, #literature, #education, " +
            "#student-corner, #pdf-books"
        )) {
            return;
        }

        const bookId = bookCard.dataset.bookId;

        if (!bookId) return;

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
            alert(
                "Favorites could not be saved in this browser. Please check browser storage settings."
            );
            return;
        }

        // Update every button belonging to the selected book.
        getCatalogCards().forEach(function (card) {
            if (card.dataset.bookId !== bookId) return;

            card.querySelectorAll("[data-favorite]").forEach(
                function (favoriteButton) {
                    updateFavoriteButton(
                        favoriteButton,
                        favorites.includes(bookId)
                    );
                }
            );
        });

        renderFavorites();
    });

    renderFavorites();
   
    // ==========================================
    // 8. MY READING LIST
    // ==========================================

    const readingSection = document.getElementById("reading-list");
    const readingKey = "alanfal-reading-list";

    let readingList = [];

    try {
        readingList = JSON.parse(
            getStoredValue(readingKey, "[]")
        );

        if (!Array.isArray(readingList)) {
            readingList = [];
        }
    } catch (error) {
        readingList = [];
    }

    function saveReadingList() {
        return saveStoredValue(
            readingKey,
            JSON.stringify(readingList)
        );
    }

    function initializeReadingButtons() {
        getCatalogCards().forEach(function (card) {
            let button = card.querySelector("[data-reading-list]");

            if (!button) {
                button = document.createElement("button");
                button.type = "button";
                button.style.display = "block";
                button.style.marginTop = "8px";
                button.style.cursor = "pointer";
                card.appendChild(button);
            }

            button.dataset.readingList = card.dataset.bookId;
            button.classList.add("reading-list-button");

            const added = readingList.includes(card.dataset.bookId);

            button.textContent = added
                ? "✅ في قائمة القراءة"
                : "📖 أضف إلى قائمة القراءة";

            button.setAttribute("aria-pressed", String(added));
        });
    }

    function renderReadingList() {
        if (!readingSection) return;

        let listContainer = document.getElementById(
            "reading-list-items"
        );

        if (!listContainer) {
            const oldCard = readingSection.querySelector(".card");

            listContainer = document.createElement("div");
            listContainer.id = "reading-list-items";
            listContainer.className = "reading-list-items";

            if (oldCard) {
                oldCard.replaceWith(listContainer);
            } else {
                readingSection.appendChild(listContainer);
            }
        }

        listContainer.replaceChildren();

        const cards = getCatalogCards();
        let count = 0;

        readingList.forEach(function (bookId) {
            const originalCard = Array.from(cards).find(
                function (card) {
                    return card.dataset.bookId === bookId;
                }
            );

            if (!originalCard) return;

            count++;

            const copy = originalCard.cloneNode(true);
            copy.hidden = false;

            copy.querySelectorAll(
                "[data-favorite], [data-reading-list]"
            ).forEach(function (button) {
                button.remove();
            });

            const removeButton = document.createElement("button");
            removeButton.type = "button";
            removeButton.textContent = "🗑️ إزالة من قائمة القراءة";
            removeButton.dataset.removeReading = bookId;
            removeButton.style.marginTop = "10px";
            removeButton.style.cursor = "pointer";

            copy.appendChild(removeButton);
            listContainer.appendChild(copy);
        });

        if (count === 0) {
            const emptyMessage = document.createElement("p");
            emptyMessage.textContent =
                "Your reading list is empty. Choose a book and click Add to Reading List.";
            listContainer.appendChild(emptyMessage);
        }

        const heading = readingSection.querySelector("h2");

        if (heading) {
            heading.textContent =
                "7. My Reading List | قائمة القراءة (" +
                count + ")";
        }
    }

    document.addEventListener("click", function (event) {
        const target = event.target;

        if (!(target instanceof Element)) return;

        const addButton = target.closest("[data-reading-list]");

        if (addButton) {
            const bookId = addButton.dataset.readingList;

            if (!bookId) return;

            if (readingList.includes(bookId)) {
                readingList = readingList.filter(
                    function (id) {
                        return id !== bookId;
                    }
                );
            } else {
                readingList.push(bookId);
            }

            if (!saveReadingList()) {
                alert(
                    "The reading list could not be saved in this browser."
                );
                return;
            }

            initializeReadingButtons();
            renderReadingList();
            return;
        }

        const removeButton = target.closest(
            "[data-remove-reading]"
        );

        if (removeButton) {
            const bookId = removeButton.dataset.removeReading;

            readingList = readingList.filter(
                function (id) {
                    return id !== bookId;
                }
            );

            if (!saveReadingList()) {
                alert(
                    "The reading list could not be saved in this browser."
                );
                return;
            }

            initializeReadingButtons();
            renderReadingList();
        }
    });

    initializeReadingButtons();
    renderReadingList();


    // ==========================================
    // 9. FOOTER YEAR
    // ==========================================
    const yearElements = document.querySelectorAll(
        "[data-current-year]"
    );

    yearElements.forEach(function (element) {
        element.textContent = new Date().getFullYear();
    });


    // ==========================================
    // 10. PREVENT EMPTY PLACEHOLDER LINKS
    // ==========================================

    document.querySelectorAll('a[href="#"]').forEach(
        function (link) {
            link.addEventListener("click", function (event) {
                event.preventDefault();
            });
        }
    );
       // ==========================================
    // 11. SIDE MENU
    // ==========================================

    const sideMenu = document.getElementById("side-menu");
    const menuOverlay = document.getElementById("menu-overlay");
    const menuOpen = document.getElementById("menu-open");
    const menuClose = document.getElementById("menu-close");

    function closeSideMenu() {
        if (sideMenu) sideMenu.classList.remove("open");
        if (menuOverlay) menuOverlay.classList.remove("show");
    }

    if (menuOpen && sideMenu && menuOverlay) {
        menuOpen.addEventListener("click", function () {
            sideMenu.classList.add("open");
            menuOverlay.classList.add("show");
        });
    }

    if (menuClose) {
        menuClose.addEventListener("click", closeSideMenu);
    }

    if (menuOverlay) {
        menuOverlay.addEventListener("click", closeSideMenu);
    }

    // Close menu after selecting a link
    if (sideMenu) {
        sideMenu.querySelectorAll("a").forEach(function (link) {
            link.addEventListener("click", closeSideMenu);
        });
    }


    // ==========================================
    // 12. SETTINGS PANEL
    // ==========================================

    const settingsOpen = document.getElementById("settings-open");
    const settingsClose = document.getElementById("settings-close");
    const settingsOverlay = document.getElementById("settings-overlay");

    if (settingsOpen && settingsOverlay) {
        settingsOpen.addEventListener("click", function () {
            closeSideMenu();
            settingsOverlay.classList.add("show");
        });
    }

    if (settingsClose && settingsOverlay) {
        settingsClose.addEventListener("click", function () {
            settingsOverlay.classList.remove("show");
        });
    }

    if (settingsOverlay) {
        settingsOverlay.addEventListener("click", function (event) {
            if (event.target === settingsOverlay) {
                settingsOverlay.classList.remove("show");
            }
        });
    }

    // Close menus with Escape
    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            closeSideMenu();

            if (settingsOverlay) {
                settingsOverlay.classList.remove("show");
            }
        }
    });


    // ==========================================
    // 13. LANGUAGE SWITCH
    // ==========================================

    const languageButtons = {
        en: document.getElementById("language-en"),
        ar: document.getElementById("language-ar")
    };

    function applyLanguage(language) {
        const selectedLanguage = language === "ar" ? "ar" : "en";

        document.documentElement.lang = selectedLanguage;
        document.documentElement.dir =
            selectedLanguage === "ar" ? "rtl" : "ltr";

        // Translate elements carrying data-en and data-ar.
        document.querySelectorAll("[data-en][data-ar]").forEach(
            function (element) {
                element.textContent =
                    element.getAttribute(
                        selectedLanguage === "ar" ? "data-ar" : "data-en"
                    );
            }
        );

        try {
            localStorage.setItem("alanfal-language", selectedLanguage);
        } catch (error) {
            // Continue even if browser storage is unavailable.
        }
    }

    let savedLanguage = "en";

    try {
        savedLanguage =
            localStorage.getItem("alanfal-language") || "en";
    } catch (error) {
        savedLanguage = "en";
    }

    applyLanguage(savedLanguage);

    if (languageButtons.en) {
        languageButtons.en.addEventListener("click", function () {
            applyLanguage("en");
        });
    }

    if (languageButtons.ar) {
        languageButtons.ar.addEventListener("click", function () {
            applyLanguage("ar");
        });
    }


    // ==========================================
    // 14. THEME SETTINGS BUTTONS
    // ==========================================

    const settingsLight = document.getElementById("settings-light");
    const settingsDark = document.getElementById("settings-dark");

    if (settingsLight) {
        settingsLight.addEventListener("click", function () {
            saveStoredValue("alanfal-theme", "light");
            manualTheme = true;
            applyTheme("light");
        });
    }

    if (settingsDark) {
        settingsDark.addEventListener("click", function () {
            saveStoredValue("alanfal-theme", "dark");
            manualTheme = true;
            applyTheme("dark");
        });
           }
    console.log(
        "Al-Anfal Library JavaScript loaded successfully."
    );
});
