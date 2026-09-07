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

const backButton = document.getElementById("backButton");
const letterDate = document.getElementById("letterDate");
const letterTitle = document.getElementById("letterTitle");
const letterContent = document.getElementById("letterContent");

backButton.addEventListener("click", function () {
    window.location.href = "libraryy.html";
});

// If URL has ?date=..., load that specific letter from Supabase
(async function init() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const bookKey = urlParams.get("date") || "7 Aug";

        if (letterDate) letterDate.textContent = bookKey;

        const { data: { session } } = await supabaseClient.auth.getSession();
        if (session && session.user) {
            const { data, error } = await supabaseClient
                .from("letters")
                .select("title, content")
                .eq("book_key", bookKey)
                .maybeSingle();

            if (data) {
                if (letterTitle && data.title) letterTitle.textContent = data.title;
                if (letterContent && data.content) letterContent.innerHTML = data.content;
            }
        }
    } catch (err) {
        console.error("Error loading letter:", err);
    }
})();