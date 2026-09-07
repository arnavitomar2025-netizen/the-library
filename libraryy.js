/* =========================================================
   SUPABASE CLIENT INITIALIZATION
========================================================= */

const { createClient } = supabase;

const SUPABASE_URL =
    "https://cgpeuaovwlzqbilseddc.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_1tQKcb44Ps5T9WZbCasvZA_i_Zbuxcs";

const supabaseClient = createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);


/* =========================================================
   CURRENT STATE & CACHE
========================================================= */

let currentUser = null;
let userLettersMap = {}; // Keyed by book_key, e.g. "6 Aug" -> { title, content }
let currentSelectedBookKey = null;


/* =========================================================
   DOM ELEMENTS
========================================================= */

const books = document.querySelectorAll(".book");

// Reader Popup Elements
const letterOverlay = document.getElementById("letterOverlay");
const closeLetter = document.getElementById("closeLetter");
const letterDate = document.getElementById("letterDate");
const letterTitle = document.getElementById("letterTitle");
const letterContent = document.getElementById("letterContent");
const editCurrentLetterBtn = document.getElementById("editCurrentLetterBtn");

// Rules Modal Elements
const howToUseBtn = document.getElementById("howToUseBtn");
const rulesOverlay = document.getElementById("rulesOverlay");
const closeRules = document.getElementById("closeRules");

// Composer Modal Elements
const writeLetterBtn = document.getElementById("writeLetterBtn");
const composerOverlay = document.getElementById("composerOverlay");
const closeComposer = document.getElementById("closeComposer");
const composerBookSelect = document.getElementById("composerBookSelect");
const composerTitleInput = document.getElementById("composerTitleInput");
const composerContentTextarea = document.getElementById("composerContentTextarea");
const saveLetterBtn = document.getElementById("saveLetterBtn");
const composerFeedback = document.getElementById("composerFeedback");

// Log Out Element
const logoutBtn = document.getElementById("logoutBtn");


/* =========================================================
   POPULATE BOOK SELECTOR IN COMPOSER
========================================================= */

function populateBookSelect() {
    composerBookSelect.innerHTML = "";

    books.forEach(book => {
        const key = book.textContent.trim();
        const opt = document.createElement("option");
        opt.value = key;
        opt.textContent = key;
        composerBookSelect.appendChild(opt);
    });
}


/* =========================================================
   TITLE GENERATION HELPER (RUNS ONLY ONCE UPON SAVING)
========================================================= */

function generateTitleFromContent(content, bookKey) {
    if (!content) return `Letter for ${bookKey}`;

    // Strip HTML tags if any exist
    const plain = content.replace(/<[^>]*>?/gm, "").trim();
    if (!plain) return `Letter for ${bookKey}`;

    // Get the first sentence or first 45 characters
    const firstSentence = plain.split(/[.\n!?]/)[0].trim();
    if (firstSentence && firstSentence.length <= 50) {
        return firstSentence;
    }

    const truncated = plain.slice(0, 45).trim();
    return truncated + "...";
}


/* =========================================================
   LOAD USER LETTERS FROM SUPABASE (SCOPED TO auth.uid())
========================================================= */

async function loadUserLetters() {
    if (!currentUser) return;

    try {
        const { data, error } = await supabaseClient
            .from("letters")
            .select("book_key, title, content");

        if (error) {
            console.error("Error fetching letters:", error.message);
            return;
        }

        userLettersMap = {};
        if (data) {
            data.forEach(item => {
                userLettersMap[item.book_key] = {
                    title: item.title,
                    content: item.content
                };
            });
        }
    } catch (err) {
        console.error("Failed to load user letters:", err);
    }
}


/* =========================================================
   OPEN LETTER READER
========================================================= */

function openLetterForBook(bookKey, isSpecial) {
    currentSelectedBookKey = bookKey;

    const letterData = userLettersMap[bookKey];

    if (isSpecial) {
        letterDate.textContent = "";
        letterTitle.textContent = (letterData && letterData.title) ? letterData.title : "Love You";
        letterContent.innerHTML = (letterData && letterData.content)
            ? letterData.content
            : `<p>This is the special letter waiting for you.</p>`;
    } else {
        letterDate.textContent = bookKey;
        if (letterData) {
            letterTitle.textContent = letterData.title || `Letter for ${bookKey}`;
            letterContent.innerHTML = letterData.content;
        } else {
            letterTitle.textContent = "A little letter for you";
            letterContent.innerHTML = `
                <p>
                    Your letter for ${bookKey} will go here.
                </p>
                <p style="font-size: 0.95rem; opacity: 0.8; font-style: italic;">
                    Click 'Edit This Letter' below to write something special for this day!
                </p>
            `;
        }
    }

    letterOverlay.classList.remove("hidden");
    document.body.style.overflow = "hidden";
}


/* =========================================================
   BOOK CLICK HANDLERS (PRESERVES EXISTING VISUALS)
========================================================= */

books.forEach(book => {
    book.addEventListener("click", function () {
        const date = this.textContent.trim();
        const isSpecial = this.classList.contains("special");
        openLetterForBook(date, isSpecial);
    });
});


/* =========================================================
   CLOSE LETTER READER
========================================================= */

function hideLetterOverlay() {
    letterOverlay.classList.add("hidden");
    document.body.style.overflow = "";
}

closeLetter.addEventListener("click", hideLetterOverlay);

letterOverlay.addEventListener("click", function (event) {
    if (event.target === letterOverlay) {
        hideLetterOverlay();
    }
});


/* =========================================================
   OPEN / CLOSE COMPOSER
========================================================= */

function openComposer(presetBookKey) {
    composerFeedback.textContent = "";
    composerFeedback.className = "composer-feedback";

    const targetKey = presetBookKey || (composerBookSelect.options.length ? composerBookSelect.options[0].value : "6 Aug");
    composerBookSelect.value = targetKey;

    // Pre-fill existing data if present
    const existing = userLettersMap[targetKey];
    if (existing) {
        composerTitleInput.value = existing.title || "";
        // Convert paragraph tags back to plain text if needed
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = existing.content || "";
        composerContentTextarea.value = tempDiv.textContent || tempDiv.innerText || "";
    } else {
        composerTitleInput.value = "";
        composerContentTextarea.value = "";
    }

    composerOverlay.classList.remove("hidden");
    composerContentTextarea.focus();
}

function hideComposer() {
    composerOverlay.classList.add("hidden");
}

writeLetterBtn.addEventListener("click", () => {
    openComposer(null);
});

editCurrentLetterBtn.addEventListener("click", () => {
    hideLetterOverlay();
    openComposer(currentSelectedBookKey);
});

composerBookSelect.addEventListener("change", (e) => {
    const selectedKey = e.target.value;
    const existing = userLettersMap[selectedKey];
    if (existing) {
        composerTitleInput.value = existing.title || "";
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = existing.content || "";
        composerContentTextarea.value = tempDiv.textContent || tempDiv.innerText || "";
    } else {
        composerTitleInput.value = "";
        composerContentTextarea.value = "";
    }
});

closeComposer.addEventListener("click", hideComposer);

composerOverlay.addEventListener("click", (e) => {
    if (e.target === composerOverlay) {
        hideComposer();
    }
});


/* =========================================================
   SAVE LETTER TO SUPABASE (UNDER auth.uid())
========================================================= */

saveLetterBtn.addEventListener("click", async () => {
    if (!currentUser) {
        composerFeedback.textContent = "Please log in again to save letters.";
        composerFeedback.className = "composer-feedback error";
        return;
    }

    const selectedBook = composerBookSelect.value;
    const rawContent = composerContentTextarea.value.trim();
    let rawTitle = composerTitleInput.value.trim();

    if (!rawContent) {
        composerFeedback.textContent = "Please write some letter content before saving.";
        composerFeedback.className = "composer-feedback error";
        return;
    }

    // If user provided no title, generate title once from content
    if (!rawTitle) {
        rawTitle = generateTitleFromContent(rawContent, selectedBook);
    }

    // Wrap content paragraphs nicely for reading
    const formattedContent = rawContent
        .split("\n\n")
        .filter(p => p.trim())
        .map(p => `<p>${p.trim().replace(/\n/g, "<br>")}</p>`)
        .join("\n");

    saveLetterBtn.disabled = true;
    composerFeedback.textContent = "Saving to your library...";
    composerFeedback.className = "composer-feedback";

    try {
        const payload = {
            user_id: currentUser.id,
            book_key: selectedBook,
            title: rawTitle,
            content: formattedContent,
            updated_at: new Date().toISOString()
        };

        const { data, error } = await supabaseClient
            .from("letters")
            .upsert(payload, { onConflict: "user_id,book_key" })
            .select();

        saveLetterBtn.disabled = false;

        if (error) {
            console.error("Save error:", error);
            composerFeedback.textContent = error.message || "Failed to save letter.";
            composerFeedback.className = "composer-feedback error";
            return;
        }

        // Update local cache
        userLettersMap[selectedBook] = {
            title: rawTitle,
            content: formattedContent
        };

        composerFeedback.textContent = "Letter saved beautifully! 🤎";
        composerFeedback.className = "composer-feedback success";

        setTimeout(() => {
            hideComposer();
        }, 1200);

    } catch (err) {
        saveLetterBtn.disabled = false;
        composerFeedback.textContent = "An error occurred while saving.";
        composerFeedback.className = "composer-feedback error";
    }
});


/* =========================================================
   RULES MODAL
========================================================= */

howToUseBtn.addEventListener("click", () => {
    rulesOverlay.classList.remove("hidden");
});

closeRules.addEventListener("click", () => {
    rulesOverlay.classList.add("hidden");
});

rulesOverlay.addEventListener("click", (event) => {
    if (event.target === rulesOverlay) {
        rulesOverlay.classList.add("hidden");
    }
});


/* =========================================================
   LOG OUT
========================================================= */

logoutBtn.addEventListener("click", async () => {
    sessionStorage.removeItem("the_library_unlocked");
    await supabaseClient.auth.signOut();
    window.location.href = "indexx.html";
});


/* =========================================================
   ESCAPE KEY LISTENER
========================================================= */

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        if (!letterOverlay.classList.contains("hidden")) {
            hideLetterOverlay();
        }
        if (!rulesOverlay.classList.contains("hidden")) {
            rulesOverlay.classList.add("hidden");
        }
        if (!composerOverlay.classList.contains("hidden")) {
            hideComposer();
        }
    }
});


/* =========================================================
   INITIALIZATION & AUTH CHECK
========================================================= */

(async function init() {
    populateBookSelect();

    try {
        const { data: { session }, error } = await supabaseClient.auth.getSession();

        if (error || !session || !session.user) {
            // Not authenticated -> redirect to login
            window.location.href = "indexx.html";
            return;
        }

        // Verify session was unlocked with Library password
        const isUnlocked = sessionStorage.getItem("the_library_unlocked");
        if (!isUnlocked) {
            window.location.href = "indexx.html";
            return;
        }

        currentUser = session.user;

        // Load letters scoped to this user
        await loadUserLetters();

    } catch (e) {
        console.error("Initialization error:", e);
        window.location.href = "indexx.html";
    }
})();