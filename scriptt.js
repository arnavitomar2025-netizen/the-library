/* =========================================
   SUPABASE AUTH
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
   ACCOUNT ELEMENTS
========================================= */

const accountCard =
    document.getElementById("accountCard");

const emailInput =
    document.getElementById("email");

const accountPasswordInput =
    document.getElementById("accountPassword");

const signUpBtn =
    document.getElementById("signUpBtn");

const loginBtn =
    document.getElementById("loginBtn");

const authMessage =
    document.getElementById("authMessage");


/* =========================================
   CREATE LIBRARY PASSWORD
========================================= */

const createPasswordCard =
    document.getElementById("createPasswordCard");

const newLibraryPassword =
    document.getElementById("newLibraryPassword");

const confirmLibraryPassword =
    document.getElementById("confirmLibraryPassword");

const saveLibraryPassword =
    document.getElementById("saveLibraryPassword");

const createPasswordMessage =
    document.getElementById("createPasswordMessage");


/* =========================================
   LIBRARY PASSWORD
========================================= */

const passwordCard =
    document.getElementById("passwordCard");

const welcomeNote =
    document.querySelector(".welcome-note");

const passwordInput =
    document.getElementById("password");

const unlockBtn =
    document.getElementById("unlockBtn");

const enterLibraryBtn =
    document.getElementById("enterLibrary");

const error =
    document.getElementById("errorMessage");


/* =========================================
   CHECK IF USER HAS LIBRARY PASSWORD
========================================= */

async function hasLibraryPassword() {

    const { data, error } =
        await supabaseClient.rpc(
            "has_library_password"
        );

    if (error) {

        console.error(error);

        return false;
    }

    return data === true;
}


/* =========================================
   SHOW CREATE PASSWORD
========================================= */

function showCreatePassword() {

    accountCard.style.display = "none";

    createPasswordCard.classList.remove("hidden");

    createPasswordCard.style.display = "flex";
}


/* =========================================
   SHOW LOGIN PASSWORD
========================================= */

function showLibraryPassword() {

    accountCard.style.display = "none";

    passwordCard.classList.remove("hidden");

    passwordCard.style.display = "flex";
}


/* =========================================
   SIGN UP
========================================= */

signUpBtn.addEventListener(
    "click",
    async function () {

        const email =
            emailInput.value.trim();

        const password =
            accountPasswordInput.value;


        if (!email || !password) {

            authMessage.textContent =
                "Please enter your email and password.";

            return;
        }


        const { error } =
            await supabaseClient.auth.signUp({

                email: email,

                password: password,

                options: {

                    emailRedirectTo:
                        "https://the-library-ochre.vercel.app/"

                }

            });


        if (error) {

            authMessage.textContent =
                error.message;

            return;
        }


        authMessage.textContent =
            "Account created!<br>Please check your Gmail and verify your email before continuing. 🤎";

        signUpBtn.disabled = true;
        loginBtn.disabled = true;

    }
);


/* =========================================
   LOGIN
========================================= */

loginBtn.addEventListener(
    "click",
    async function () {

        const email =
            emailInput.value.trim();

        const password =
            accountPasswordInput.value;


        if (!email || !password) {

            authMessage.textContent =
                "Please enter your email and password.";

            return;
        }


        const { data, error } =
            await supabaseClient.auth.signInWithPassword({

                email: email,

                password: password

            });


        if (error) {

            authMessage.textContent =
                error.message;

            return;
        }


        const alreadyHasPassword =
            await hasLibraryPassword();


        if (alreadyHasPassword) {

            showLibraryPassword();

        } else {

            showCreatePassword();

        }

    }
);


/* =========================================
   CREATE LIBRARY PASSWORD
========================================= */

saveLibraryPassword.addEventListener(
    "click",
    async function () {

        const password =
            newLibraryPassword.value;

        const confirmPassword =
            confirmLibraryPassword.value;


        createPasswordMessage.textContent = "";


        if (!password || !confirmPassword) {

            createPasswordMessage.textContent =
                "Please enter your password twice.";

            return;
        }


        if (password !== confirmPassword) {

            createPasswordMessage.textContent =
                "Passwords do not match.";

            return;
        }


        const { error } =
            await supabaseClient.rpc(
                "set_library_password",
                {
                    new_password: password
                }
            );


        if (error) {

            createPasswordMessage.textContent =
                error.message;

            return;
        }


        createPasswordMessage.textContent =
            "Your Library password has been created! 🤎";
        sessionStorage.setItem(
            "the_library_unlocked",
            "true"
        );


        setTimeout(
            function () {

                createPasswordCard.style.display =
                    "none";

                welcomeNote.classList.remove("hidden");

                welcomeNote.style.display =
                    "flex";

            },
            700
        );

    }
);


/* =========================================
   UNLOCK LIBRARY
========================================= */

async function checkPassword() {

    const entered =
        passwordInput.value.trim();

    error.textContent = "";


    if (!entered) {

        error.textContent =
            "Please enter your Library password.";

        return;
    }


    const { data, error: verifyError } =
        await supabaseClient.rpc(
            "verify_library_password",
            {
                password_attempt: entered
            }
        );


    if (verifyError) {

        error.textContent =
            verifyError.message;

        return;
    }


    if (data === true) {

        sessionStorage.setItem(
            "the_library_unlocked",
            "true"
        );

        passwordCard.style.display =
            "none";

        welcomeNote.classList.remove("hidden");

        welcomeNote.style.display =
            "flex";

    } else {

        error.textContent =
            "Incorrect Library password.";

    }

}


/* =========================================
   UNLOCK BUTTON
========================================= */

unlockBtn.addEventListener(
    "click",
    checkPassword
);


/* =========================================
   ENTER TO UNLOCK
========================================= */

passwordInput.addEventListener(
    "keypress",
    function (event) {

        if (event.key === "Enter") {

            checkPassword();

        }

    }
);


/* =========================================
   ENTER LIBRARY
========================================= */

enterLibraryBtn.addEventListener(
    "click",
    function () {

        window.location.href =
            "libraryy.html";

    }
);


/* =========================================
   TOGGLE PASSWORD VISIBILITY
========================================= */

const togglePasswordButtons =
    document.querySelectorAll(".toggle-password");

togglePasswordButtons.forEach(function (button) {

    button.addEventListener("click", function (event) {

        event.preventDefault();
        event.stopPropagation();

        const targetId =
            this.getAttribute("data-target");

        const targetInput =
            document.getElementById(targetId);

        if (!targetInput) return;

        if (targetInput.type === "password") {

            targetInput.type = "text";
            this.textContent = "🙈";
            this.setAttribute("aria-label", "Hide password");
            this.setAttribute("title", "Hide password");

        } else {

            targetInput.type = "password";
            this.textContent = "👁";
            this.setAttribute("aria-label", "Show password");
            this.setAttribute("title", "Show password");

        }

    });

});