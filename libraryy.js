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


/* =========================================
   LETTERS
========================================= */

const letters = {

    "6 Aug": {
        title: " ",
        content: `
            <p>
                
            </p>
        `
    },

    "7 Aug": {
        title: " ",
        content: `
            <p>
                
            </p>
        `
    },

    "8 Aug": {
        title: " ",
        content: `
            <p>
                
            </p>
        `
    },

    "9 Aug": {
        title: " ",
        content: `
            <p>
                
            </p>
        `
    },

    "10 Aug": {
        title: " ",
        content: `
            <p>
                
            </p>
        `
    },

    "11 Aug": {
        title: " ",
        content: `
            <p>
                
            </p>
        `
    },

    "12 Aug": {
        title: " ",
        content: `
            <p>
                
            </p>
        `
    }

};


/* =========================================
   OPEN BOOK
========================================= */

books.forEach(function (book) {

    book.addEventListener("click", function () {

        const date =
            this.textContent.trim();


        /* =====================================
           LOVE YOU BOOK
        ===================================== */

        if (
            this.classList.contains("special")
        ) {

            letterDate.textContent = "";

            letterTitle.textContent =
                "Love You";

            letterContent.innerHTML = `
                <p>
                    This is the special letter
                    waiting for you.
                </p>
            `;

        }


        /* =====================================
           NORMAL BOOK
        ===================================== */

        else {

            letterDate.textContent =
                date;

            const letter =
                letters[date];


            if (letter) {

                letterTitle.textContent =
                    letter.title;

                letterContent.innerHTML =
                    letter.content;

            }


            else {

                letterTitle.textContent =
                    "A little letter for you";

                letterContent.innerHTML = `
                    <p>
                        Your letter for ${date}
                        will go here.
                    </p>
                `;

            }

        }


        /* =====================================
           OPEN LETTER OVERLAY
        ===================================== */

        letterOverlay.classList.remove(
            "hidden"
        );

        document.body.style.overflow =
            "hidden";

    });

});


/* =========================================
   CLOSE LETTER BUTTON
========================================= */

closeLetter.addEventListener(
    "click",
    function () {

        letterOverlay.classList.add(
            "hidden"
        );

        document.body.style.overflow = "";

    }
);


/* =========================================
   CLICK OUTSIDE LETTER
========================================= */

letterOverlay.addEventListener(
    "click",
    function (event) {

        if (
            event.target === letterOverlay
        ) {

            letterOverlay.classList.add(
                "hidden"
            );

            document.body.style.overflow =
                "";

        }

    }
);


/* =========================================
   ESCAPE KEY
========================================= */

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Escape" &&
            !letterOverlay.classList.contains(
                "hidden"
            )
        ) {

            letterOverlay.classList.add(
                "hidden"
            );

            document.body.style.overflow =
                "";

        }

    }
);


/* =========================================
   RULES OF THE LIBRARY
========================================= */

const infoButton =
    document.querySelector(".info-btn");

const rulesOverlay =
    document.getElementById("rulesOverlay");

const closeRules =
    document.getElementById("closeRules");


/* =========================================
   OPEN RULES
========================================= */

infoButton.addEventListener(
    "click",
    function () {

        rulesOverlay.classList.remove(
            "hidden"
        );

    }
);


/* =========================================
   CLOSE RULES BUTTON
========================================= */

closeRules.addEventListener(
    "click",
    function () {

        rulesOverlay.classList.add(
            "hidden"
        );

    }
);


/* =========================================
   CLICK OUTSIDE RULES
========================================= */

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