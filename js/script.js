
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
            console.error("Storage error:", error);
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
    // 2. DARK AND LIGHT MODE
    // ==========================================

    const themeButton = document.getElementById("theme-toggle");
    const savedTheme = getStoredValue("alanfal-theme", null);

    let manualTheme =
        savedTheme === "dark" || savedTheme === "light";

    function isNightTime() {
        const hour = new Date().getHours();
        return hour >= 18 || hour < 6;
    }

    function applyTheme(theme) {
        const selectedTheme = theme === "dark" ? "dark" : "light";

        document.body.classList.toggle(
            "dark-mode",
            selectedTheme === "dark"
        );

        document.documentElement.setAttribute(
            "data-theme",
            selectedTheme
        );

        if (themeButton) {
            const language = getStoredValue("alanfal-language", "en");

            const label = themeButton.querySelector("span");

            if (label) {
                label.textContent =
                    selectedTheme === "dark"
                        ? (language === "ar" ? "الوضع النهاري" : "Light Mode")
                        : (language === "ar" ? "الوضع الليلي" : "Dark Mode");
            } else {
                themeButton.textContent =
                    selectedTheme === "dark"
                        ? "☀️ Light Mode"
                        : "🌙 Dark Mode";
            }
        }
    }

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

            if (saveStoredValue("alanfal-theme", nextTheme)) {
                manualTheme = true;
            }

            applyTheme(nextTheme);
        });
    }

    setInterval(function () {
        if (!manualTheme) {
            applyTheme(isNightTime() ? "dark" : "light");
        }
    }, 60000);


    // ==========================================
    // 3. GENERAL FORM VALIDATION
    // ==========================================

    document.querySelectorAll("form").forEach(function (form) {

        form.querySelectorAll("[required]").forEach(function (field) {
            function clearFieldMessage() {
                field.setCustomValidity("");
            }

            field.addEventListener("input", clearFieldMessage);
            field.addEventListener("change", clearFieldMessage);
        });

        form.addEventListener("submit", function (event) {
            let formIsValid = true;

            form.querySelectorAll("[required]").forEach(function (field) {
                field.setCustomValidity("");

                if (field.type === "checkbox" && !field.checked) {
                    formIsValid = false;
                    field.setCustomValidity(
                        "Please accept the required terms."
                    );
                } else if (
                    field.type !== "checkbox" &&
                    !field.value.trim()
                ) {
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
    // 4. CREATE ACCOUNT PASSWORD VALIDATION
    // ==========================================

    const confirmPasswordInput =
        document.getElementById("confirm-password");

    const passwordInput =
        document.getElementById("password");

    if (confirmPasswordInput && passwordInput) {

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

        const accountForm = confirmPasswordInput.closest("form");

        if (accountForm) {
            accountForm.addEventListener("submit", function (event) {
                validatePasswords();

                if (!accountForm.checkValidity()) {
                    event.preventDefault();
                    accountForm.reportValidity();
                }

                // Valid forms can continue to their PHP backend.
            });
        }
    }


    // ==========================================
    // 5. CONTACT FORM AND SAVED COMMENTS
    // ==========================================

    const commentInput =
        document.getElementById("comment");

    const visitorNameInput =
        document.getElementById("visitor-name") ||
        document.getElementById("comment-name") ||
        document.querySelector('input[name="fullname"]');

    const visitorEmailInput =
        document.getElementById("visitor-email") ||
        document.getElementById("comment-email") ||
        document.querySelector('input[name="email"]');

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

                article.append(name, date, message, deleteButton);
                commentsList.appendChild(article);
            });
        }

        document.addEventListener("click", function (event) {
            const target = event.target;

            if (!(target instanceof Element)) return;

            const button = target.closest("[data-delete-comment]");
            if (!button) return;

            const index = Number(button.dataset.deleteComment);
            const comments = getComments();

            if (
                !Number.isInteger(index) ||
                index < 0 ||
                index >= comments.length
            ) {
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

                // If a PHP endpoint is configured, let the browser submit
                // the form to the server instead of saving only locally.
                const formAction = commentForm.getAttribute("action") || "";

                if (formAction.toLowerCase().endsWith(".php")) {
                    return;
                }

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

            if (matches) visibleCount++;
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
    // 7. FAVORITES
    // ==========================================

    const favoritesList = document.getElementById("favorites-list");

    let favorites = [];

    try {
        favorites = JSON.parse(
            getStoredValue("alanfal-favorites", "[]")
        );

        if (!Array.isArray(favorites)) favorites = [];
    } catch (error) {
        favorites = [];
    }

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

                card.dataset.bookId = slug || "book-" + (index + 1);
            }

            card.querySelectorAll("[data-favorite]").forEach(
                function (button) {
                    button.dataset.favorite = card.dataset.bookId;
                }
            );
        });

        return cards;
    }

    function updateFavoriteButton(button, isFavorite) {
        const language = getStoredValue("alanfal-language", "en");

        button.textContent = isFavorite
            ? (language === "ar" ? "❤️ إزالة من المفضلة" : "❤️ Remove Favorite")
            : (language === "ar" ? "🤍 أضف إلى المفضلة" : "🤍 Add to Favorites");

        button.setAttribute("aria-pressed", String(isFavorite));
        button.type = "button";
        button.classList.add("favorite-button");
    }

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

            copy.querySelectorAll(
                "[data-favorite], [data-reading-list]"
            ).forEach(function (button) {
                button.remove();
            });

            favoritesList.appendChild(copy);
        });

        const placeholder = document.querySelector(
            "#favorites .card.text-center"
        );

        if (placeholder) {
            placeholder.hidden = favoritesList.children.length > 0;
        }

        if (favoritesList.children.length === 0) {
            const language = getStoredValue("alanfal-language", "en");

            favoritesList.textContent =
                language === "ar"
                    ? "لا توجد كتب في المفضلة حتى الآن. أضف كتاباً باستخدام زر المفضلة."
                    : "You have no favorite books yet. Add a book using the favorite button.";
        }
    }

    initializeFavoriteButtons();

    document.addEventListener("click", function (event) {
        const target = event.target;

        if (!(target instanceof Element)) return;

        const button = target.closest("[data-favorite]");
        if (!button) return;

        const bookCard = button.closest(".book-card");
        if (!bookCard) return;

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

        if (!saveStoredValue(
            "alanfal-favorites",
            JSON.stringify(favorites)
        )) {
            alert("Favorites could not be saved in this browser.");
            return;
        }

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

        if (!Array.isArray(readingList)) readingList = [];
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
            const language = getStoredValue("alanfal-language", "en");

            button.textContent = added
                ? (language === "ar" ? "✅ في قائمة القراءة" : "✅ In Reading List")
                : (language === "ar" ? "📖 أضف إلى قائمة القراءة" : "📖 Add to Reading List");

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

            const language = getStoredValue("alanfal-language", "en");

            removeButton.textContent =
                language === "ar"
                    ? "🗑️ إزالة من قائمة القراءة"
                    : "🗑️ Remove from Reading List";

            removeButton.dataset.removeReading = bookId;
            removeButton.style.marginTop = "10px";
            removeButton.style.cursor = "pointer";

            copy.appendChild(removeButton);
            listContainer.appendChild(copy);
        });

        if (count === 0) {
            const emptyMessage = document.createElement("p");
            const language = getStoredValue("alanfal-language", "en");

            emptyMessage.textContent =
                language === "ar"
                    ? "قائمة القراءة فارغة. اختر كتاباً وأضفه إلى القائمة."
                    : "Your reading list is empty. Choose a book and click Add to Reading List.";

            listContainer.appendChild(emptyMessage);
        }

        const heading = readingSection.querySelector("h2");

        if (heading) {
            const language = getStoredValue("alanfal-language", "en");

            heading.textContent =
                language === "ar"
                    ? "قائمة القراءة (" + count + ")"
                    : "My Reading List (" + count + ")";
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
                alert("The reading list could not be saved.");
                return;
            }

            initializeReadingButtons();
            renderReadingList();
            return;
        }

        const removeButton = target.closest("[data-remove-reading]");

        if (removeButton) {
            const bookId = removeButton.dataset.removeReading;

            readingList = readingList.filter(
                function (id) {
                    return id !== bookId;
                }
            );

            if (!saveReadingList()) {
                alert("The reading list could not be saved.");
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

    document.querySelectorAll("[data-current-year]").forEach(
        function (element) {
            element.textContent = new Date().getFullYear();
        }
    );


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

        document.querySelectorAll("[data-en][data-ar]").forEach(
            function (element) {
                // Do not overwrite nested spans, icons, or other elements.
                if (element.children.length === 0) {
                    element.textContent =
                        element.getAttribute(
                            selectedLanguage === "ar"
                                ? "data-ar"
                                : "data-en"
                        );
                }
            }
        );

        document.querySelectorAll(
            "[data-placeholder-en][data-placeholder-ar]"
        ).forEach(function (element) {
            element.placeholder =
                selectedLanguage === "ar"
                    ? element.getAttribute("data-placeholder-ar")
                    : element.getAttribute("data-placeholder-en");
        });

        saveStoredValue("alanfal-language", selectedLanguage);

        // Refresh dynamic buttons and lists in the selected language.
        initializeFavoriteButtons();
        renderFavorites();
        initializeReadingButtons();
        renderReadingList();
        applyTheme(
            document.body.classList.contains("dark-mode") ? "dark" : "light"
        );
    }

    const savedLanguage = getStoredValue("alanfal-language", "en");

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
            manualTheme = true;
            saveStoredValue("alanfal-theme", "light");
            applyTheme("light");
        });
    }

    if (settingsDark) {
        settingsDark.addEventListener("click", function () {
            manualTheme = true;
            saveStoredValue("alanfal-theme", "dark");
            applyTheme("dark");
        });
    }


    // ==========================================
    // 15. FINAL MESSAGE
    // ==========================================

    console.log(
        "Al-Anfal Library JavaScript loaded successfully."
    );

});

            
