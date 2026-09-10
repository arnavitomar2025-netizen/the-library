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
   BOOKS + LETTER ELEMENTS
========================================= */

const books =
    document.querySelectorAll(".book");

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

const composerBookSelect =
    document.getElementById("composerBookSelect");

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
   POPULATE BOOK SELECTOR
========================================= */

function populateBookSelect() {

    if (!composerBookSelect) return;

    composerBookSelect.innerHTML = "";

    books.forEach(function (book) {

        const option =
            document.createElement("option");

        option.value =
            book.textContent.trim();

        option.textContent =
            book.textContent.trim();

        composerBookSelect.appendChild(option);

    });

}


/* =========================================
   GENERATE TITLE
========================================= */

function generateTitleFromContent(
    content,
    bookKey
) {

    const plainText =
        content
            .replace(/<[^>]*>/g, "")
            .replace(/\s+/g, " ")
            .trim();

    if (!plainText) {

        return "A little letter for " + bookKey;

    }

    const firstSentence =
        plainText.split(/[.!?]/)[0].trim();

    if (
        firstSentence &&
        firstSentence.length <= 50
    ) {

        return firstSentence;

    }

    if (plainText.length <= 45) {

        return plainText;

    }

    return plainText.slice(0, 45) + "...";

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

            letterContent.innerHTML =
                letter.content;

        }

        else {

            letterTitle.textContent =
                "Love You";

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

            letterTitle.textContent =
                letter.title ||
                "A little letter for you";

            letterContent.innerHTML =
                letter.content;

        }


        else {

            letterTitle.textContent =
                "A little letter for you";

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
   OPEN BOOK
========================================= */

books.forEach(function (book) {

    book.addEventListener(
        "click",
        function () {

            const bookKey =
                this.textContent.trim();

            const isSpecial =
                this.classList.contains(
                    "special"
                );

            openLetterForBook(
                bookKey,
                isSpecial
            );

        }
    );

});


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

function openComposer(
    presetBookKey
) {

    if (!composerOverlay) return;

    composerFeedback.textContent =
        "";

    let selectedBook =
        presetBookKey ||
        composerBookSelect.value;

    if (!selectedBook) {

        selectedBook =
            books[0].textContent.trim();

    }

    composerBookSelect.value =
        selectedBook;


    const existingLetter =
        userLettersMap[selectedBook];


    if (existingLetter) {

        composerTitleInput.value =
            existingLetter.title || "";

        composerContentTextarea.value =
            existingLetter.content
                .replace(/<br\s*\/?>/gi, "\n")
                .replace(/<\/p>/gi, "\n")
                .replace(/<[^>]*>/g, "")
                .trim();

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
   CHANGE BOOK IN COMPOSER
========================================= */

composerBookSelect.addEventListener(
    "change",
    function () {

        const selectedBook =
            this.value;

        const existingLetter =
            userLettersMap[selectedBook];


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

        }

        else {

            composerTitleInput.value =
                "";

            composerContentTextarea.value =
                "";

        }

    }
);


/* =========================================
   SAVE LETTER
========================================= */

saveLetterBtn.addEventListener(
    "click",
    async function () {

        const selectedBook =
            composerBookSelect.value;

        const rawTitle =
            composerTitleInput.value.trim();

        const rawContent =
            composerContentTextarea.value.trim();


        if (!rawContent) {

            composerFeedback.textContent =
                "Please write something first.";

            return;

        }


        const finalTitle =
            rawTitle ||
            generateTitleFromContent(
                rawContent,
                selectedBook
            );


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

    populateBookSelect();


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

}


initializeLibrary();