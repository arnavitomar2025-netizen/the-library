/* =========================================
   SUPABASE
========================================= */

const { createClient } = supabase;

const SUPABASE_URL =
    "https://cgpeuaovwlzqbilseddc.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_1tQKcb44Ps5T9WZbCasvZA_i_Zbuxcs";

const supabaseClient = createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);


/* =========================================
   STATE
========================================= */

let currentUser = null;
let userLettersMap = {};
let currentSelectedBookKey = null;


/* =========================================
   ELEMENTS
========================================= */

const letterOverlay =
    document.getElementById("letterOverlay");

const closeLetter =
    document.getElementById("closeLetter");

const letterDate =
    document.getElementById("letterDate");

const letterTitle =
    document.getElementById("letterTitle");

const letterContent =
    document.getElementById("letterContent");

const editCurrentLetterBtn =
    document.getElementById("editCurrentLetterBtn");

const howToUseBtn =
    document.getElementById("howToUseBtn");

const rulesOverlay =
    document.getElementById("rulesOverlay");

const closeRules =
    document.getElementById("closeRules");

const writeLetterBtn =
    document.getElementById("writeLetterBtn");

const composerOverlay =
    document.getElementById("composerOverlay");

const closeComposer =
    document.getElementById("closeComposer");

const composerDateFieldGroup =
    document.getElementById("composerDateFieldGroup");

const composerSpecialFieldGroup =
    document.getElementById("composerSpecialFieldGroup");

const composerDateInput =
    document.getElementById("composerDateInput");

const composerDateHint =
    document.getElementById("composerDateHint");

const composerTitleInput =
    document.getElementById("composerTitleInput");

const composerContentTextarea =
    document.getElementById("composerContentTextarea");

const saveLetterBtn =
    document.getElementById("saveLetterBtn");

const composerFeedback =
    document.getElementById("composerFeedback");

const logoutBtn =
    document.getElementById("logoutBtn");


/* =========================================
   BOOK RENDERING CONFIG
========================================= */

const BOOK_COLORS =
    ["burgundy", "green", "plum", "blue", "brown"];

const BOOKS_PER_SHELF = 11;


/* =========================================
   RENDER BOOKS FROM SUPABASE DATA
========================================= */

function renderBooks() {

    const bookshelf =
        document.getElementById("bookshelf");

    if (!bookshelf) return;

    bookshelf.innerHTML = "";

    // Collect all letter keys (excluding "Love You")
    const letterKeys =
        Object.keys(userLettersMap)
            .filter(function (k) {
                return k !== "Love You";
            });

    // Sort keys chronologically by their saved date
    // (the book_key IS the display label, e.g. "7 Aug")
    // We fall back to insertion order if we can't parse.
    letterKeys.sort(function (a, b) {

        const months = {
            Jan: 1, Feb: 2, Mar: 3, Apr: 4,
            May: 5, Jun: 6, Jul: 7, Aug: 8,
            Sep: 9, Oct: 10, Nov: 11, Dec: 12
        };

        function parseKey(key) {
            const parts = key.trim().replace(/'/g, "").split(" ");
            const day = parseInt(parts[0], 10) || 0;
            const mon = months[parts[1]] || 0;
            let year = 2026;
            if (parts[2]) {
                const parsedYear = parseInt(parts[2], 10);
                year = parsedYear < 100 ? 2000 + parsedYear : parsedYear;
            }
            return (year * 10000) + (mon * 100) + day;
        }

        return parseKey(a) - parseKey(b);

    });

    // Always put the "Love You" special book at the end
    const allKeys = letterKeys.concat(["Love You"]);

    let shelfEl = null;
    let countOnShelf = 0;
    let colorIndex = 0;

    allKeys.forEach(function (key, i) {

        // Start a new shelf if needed
        if (countOnShelf === 0) {

            shelfEl = document.createElement("div");
            shelfEl.className = "shelf";
            bookshelf.appendChild(shelfEl);

        }

        const isSpecial = (key === "Love You");

        const book =
            document.createElement("div");

        if (isSpecial) {

            book.className = "book special";

        } else {

            const color =
                BOOK_COLORS[colorIndex % BOOK_COLORS.length];

            book.className = "book " + color;

            colorIndex++;

        }

        book.textContent = key;

        book.addEventListener(
            "click",
            function () {

                openLetterForBook(
                    key,
                    isSpecial
                );

            }
        );

        shelfEl.appendChild(book);

        countOnShelf++;

        if (countOnShelf >= BOOKS_PER_SHELF) {
            countOnShelf = 0;
        }

    });

}


/* =========================================
   DATE UTILITIES & HELPERS
========================================= */

function formatDateKey(isoDate) {
    if (!isoDate) return "";
    const [y, m, d] = isoDate.split("-");
    const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    const monthIndex = parseInt(m, 10) - 1;
    const day = parseInt(d, 10);
    const thisYear = new Date().getFullYear().toString();
    if (y && y !== thisYear) {
        return `${day} ${months[monthIndex]} '${y.slice(2)}`;
    }
    return `${day} ${months[monthIndex]}`;
}

function dateKeyToIso(dateKey) {
    if (!dateKey) return "";
    const parts = dateKey.trim().replace(/'/g, "").split(" ");
    if (parts.length >= 2) {
        const day = parseInt(parts[0], 10);
        const months = {
            Jan: "01", Feb: "02", Mar: "03", Apr: "04",
            May: "05", Jun: "06", Jul: "07", Aug: "08",
            Sep: "09", Oct: "10", Nov: "11", Dec: "12"
        };
        const month = months[parts[1]];
        let year = new Date().getFullYear();
        if (parts[2]) {
            const parsedYear = parseInt(parts[2], 10);
            year = parsedYear < 100 ? 2000 + parsedYear : parsedYear;
        }
        if (day && month) {
            const paddedDay = day < 10 ? "0" + day : "" + day;
            return `${year}-${month}-${paddedDay}`;
        }
    }
    return "";
}

function updateDateHint() {
    if (!composerDateHint || !composerDateInput) return;
    const isoVal = composerDateInput.value;
    if (!isoVal) {
        composerDateHint.textContent = "";
        return;
    }
    const label = formatDateKey(isoVal);
    composerDateHint.textContent = `Book spine label: ${label}`;
}

function populateBookSelect() {
    // Dynamic books are rendered directly on the shelf
}


/* =========================================
   GENERATE TITLE
========================================= */

function generateTitleFromContent(
    content,
    bookKey
) {

    // Analyzing theme and emotion without fragmenting sentences requires
    // an external AI/ML model. As per requirements, we do not add external
    // APIs or expose API keys; the title is left blank so the user can enter their own.
    return "";

}


/* =========================================
   LOAD USER LETTERS
========================================= */

async function loadUserLetters() {

    userLettersMap = {};

    const {
        data,
        error
    } = await supabaseClient
        .from("letters")
        .select(
            "book_key, title, content"
        );

    if (error) {

        console.error(
            "Error loading letters:",
            error
        );

        return;

    }

    data.forEach(function (item) {

        userLettersMap[item.book_key] = {

            title: item.title,

            content: item.content

        };

    });

}


/* =========================================
   OPEN LETTER
========================================= */

function openLetterForBook(
    bookKey,
    isSpecial
) {

    currentSelectedBookKey =
        bookKey;


    if (isSpecial) {

        letterDate.textContent = "";

        const letter =
            userLettersMap[bookKey];

        if (letter) {

            letterTitle.textContent =
                letter.title || "Love You";

            letterTitle.style.display =
                "block";

            letterContent.innerHTML =
                letter.content;

        }

        else {

            letterTitle.textContent =
                "Love You";

            letterTitle.style.display =
                "block";

            letterContent.innerHTML = `
                <p>
                    This is the special letter
                    waiting for you.
                </p>
            `;

        }

    }


    else {

        letterDate.textContent =
            bookKey;

        const letter =
            userLettersMap[bookKey];


        if (letter) {

            const hasTitle =
                Boolean(
                    letter.title &&
                    letter.title.trim()
                );

            letterTitle.textContent =
                hasTitle
                    ? letter.title
                    : "";

            letterTitle.style.display =
                hasTitle
                    ? "block"
                    : "none";

            letterContent.innerHTML =
                letter.content;

        }


        else {

            letterTitle.textContent =
                "A little letter for you";

            letterTitle.style.display =
                "block";

            letterContent.innerHTML = `
                <p>
                    Your letter for ${bookKey}
                    will go here.
                </p>
            `;

        }

    }


    letterOverlay.classList.remove(
        "hidden"
    );

    document.body.style.overflow =
        "hidden";

}



/* =========================================
   CLOSE LETTER
========================================= */

function hideLetter() {

    letterOverlay.classList.add(
        "hidden"
    );

    document.body.style.overflow =
        "";

}


closeLetter.addEventListener(
    "click",
    hideLetter
);


letterOverlay.addEventListener(
    "click",
    function (event) {

        if (
            event.target === letterOverlay
        ) {

            hideLetter();

        }

    }
);


/* =========================================
   HOW TO USE
========================================= */

howToUseBtn.addEventListener(
    "click",
    function () {

        rulesOverlay.classList.remove(
            "hidden"
        );

    }
);


closeRules.addEventListener(
    "click",
    function () {

        rulesOverlay.classList.add(
            "hidden"
        );

    }
);


rulesOverlay.addEventListener(
    "click",
    function (event) {

        if (
            event.target === rulesOverlay
        ) {

            rulesOverlay.classList.add(
                "hidden"
            );

        }

    }
);


/* =========================================
   OPEN COMPOSER
========================================= */

let isSpecialComposerMode = false;

function openComposer(
    presetBookKey
) {

    if (!composerOverlay) return;

    composerFeedback.textContent =
        "";

    isSpecialComposerMode =
        (presetBookKey === "Love You");

    if (isSpecialComposerMode) {

        if (composerDateFieldGroup) {
            composerDateFieldGroup.classList.add("hidden");
        }

        if (composerSpecialFieldGroup) {
            composerSpecialFieldGroup.classList.remove("hidden");
        }

    } else {

        if (composerDateFieldGroup) {
            composerDateFieldGroup.classList.remove("hidden");
        }

        if (composerSpecialFieldGroup) {
            composerSpecialFieldGroup.classList.add("hidden");
        }

        let isoDate = "";

        if (presetBookKey) {
            isoDate = dateKeyToIso(presetBookKey);
        }

        if (!isoDate) {
            isoDate = new Date().toISOString().split("T")[0];
        }

        if (composerDateInput) {
            composerDateInput.value = isoDate;
        }

        updateDateHint();

    }

    const currentKey =
        isSpecialComposerMode
            ? "Love You"
            : (composerDateInput ? formatDateKey(composerDateInput.value) : "");

    const existingLetter =
        userLettersMap[currentKey];


    if (existingLetter) {

        composerTitleInput.value =
            existingLetter.title || "";

        composerContentTextarea.value =
            existingLetter.content
                .replace(/<br\s*\/?>/gi, "\n")
                .replace(/<\/p>/gi, "\n")
                .replace(/<[^>]*>/g, "")
                .trim();

        if (presetBookKey) {
            composerFeedback.textContent =
                `Editing letter for ${currentKey}`;
        }

    }

    else {

        composerTitleInput.value =
            "";

        composerContentTextarea.value =
            "";

    }


    composerOverlay.classList.remove(
        "hidden"
    );

    document.body.style.overflow =
        "hidden";

    composerContentTextarea.focus();

}


/* =========================================
   CLOSE COMPOSER
========================================= */

function hideComposer() {

    composerOverlay.classList.add(
        "hidden"
    );

    document.body.style.overflow =
        "";

}


writeLetterBtn.addEventListener(
    "click",
    function () {

        openComposer();

    }
);


editCurrentLetterBtn.addEventListener(
    "click",
    function () {

        hideLetter();

        openComposer(
            currentSelectedBookKey
        );

    }
);


closeComposer.addEventListener(
    "click",
    hideComposer
);


composerOverlay.addEventListener(
    "click",
    function (event) {

        if (
            event.target === composerOverlay
        ) {

            hideComposer();

        }

    }
);


/* =========================================
   CHANGE DATE IN COMPOSER
========================================= */

if (composerDateInput) {

    composerDateInput.addEventListener(
        "change",
        function () {

            updateDateHint();

            const currentKey =
                formatDateKey(this.value);

            const existingLetter =
                userLettersMap[currentKey];


            if (existingLetter) {

                composerTitleInput.value =
                    existingLetter.title || "";

                composerContentTextarea.value =
                    existingLetter.content
                        .replace(
                            /<br\s*\/?>/gi,
                            "\n"
                        )
                        .replace(
                            /<\/p>/gi,
                            "\n"
                        )
                        .replace(
                            /<[^>]*>/g,
                            ""
                        )
                        .trim();

                composerFeedback.textContent =
                    `Existing letter for ${currentKey} loaded for editing`;

            }

            else {

                composerTitleInput.value =
                    "";

                composerContentTextarea.value =
                    "";

                composerFeedback.textContent =
                    "";

            }

        }
    );

}


/* =========================================
   SAVE LETTER
========================================= */

saveLetterBtn.addEventListener(
    "click",
    async function () {

        const rawTitle =
            composerTitleInput.value.trim();

        const rawContent =
            composerContentTextarea.value.trim();


        if (!rawContent) {

            composerFeedback.textContent =
                "Please write something first.";

            return;

        }


        let selectedBook = "";

        if (isSpecialComposerMode) {

            selectedBook = "Love You";

        } else {

            const dateVal =
                composerDateInput ? composerDateInput.value : "";

            if (!dateVal) {

                composerFeedback.textContent =
                    "Please choose a date for the letter.";

                return;

            }

            selectedBook =
                formatDateKey(dateVal);

        }


        const finalTitle =
            rawTitle || "";


        const formattedContent =
            `<p>${rawContent
                .replace(/\n+/g, "</p><p>")
                .replace(/\n/g, "<br>")}</p>`;


        const payload = {

            user_id:
                currentUser.id,

            book_key:
                selectedBook,

            title:
                finalTitle,

            content:
                formattedContent,

            updated_at:
                new Date().toISOString()

        };


        const {
            data,
            error
        } = await supabaseClient
            .from("letters")
            .upsert(
                payload,
                {
                    onConflict:
                        "user_id,book_key"
                }
            )
            .select();


        if (error) {

            console.error(
                "Error saving letter:",
                error
            );

            composerFeedback.textContent =
                "Could not save the letter.";

            return;

        }


        userLettersMap[selectedBook] = {

            title:
                finalTitle,

            content:
                formattedContent

        };


        // Dynamically re-render books onto shelves
        renderBooks();


        composerFeedback.textContent =
            "Letter saved successfully!";


        setTimeout(
            function () {

                hideComposer();

                openLetterForBook(
                    selectedBook,
                    selectedBook === "Love You"
                );

            },
            500
        );

    }
);


/* =========================================
   LOG OUT
========================================= */

logoutBtn.addEventListener(
    "click",
    async function () {

        await supabaseClient.auth.signOut();

        sessionStorage.removeItem(
            "the_library_unlocked"
        );

        window.location.href =
            "indexx.html";

    }
);


/* =========================================
   ESCAPE KEY
========================================= */

document.addEventListener(
    "keydown",
    function (event) {

        if (event.key !== "Escape") return;


        if (
            composerOverlay &&
            !composerOverlay.classList.contains(
                "hidden"
            )
        ) {

            hideComposer();

            return;

        }


        if (
            rulesOverlay &&
            !rulesOverlay.classList.contains(
                "hidden"
            )
        ) {

            rulesOverlay.classList.add(
                "hidden"
            );

            return;

        }


        if (
            letterOverlay &&
            !letterOverlay.classList.contains(
                "hidden"
            )
        ) {

            hideLetter();

        }

    }
);


/* =========================================
   START LIBRARY
========================================= */

async function initializeLibrary() {

    const {
        data: {
            session
        },
        error
    } = await supabaseClient.auth.getSession();


    if (
        error ||
        !session ||
        !session.user
    ) {

        window.location.href =
            "indexx.html";

        return;

    }


    const isUnlocked =
        sessionStorage.getItem(
            "the_library_unlocked"
        );


    if (!isUnlocked) {

        window.location.href =
            "indexx.html";

        return;

    }


    currentUser =
        session.user;


    await loadUserLetters();


    renderBooks();

    populateBookSelect();

}


initializeLibrary();