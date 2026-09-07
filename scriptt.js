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
   DOM ELEMENTS
========================================================= */

// Views / Cards
const landingCard = document.getElementById("landingCard");
const signUpCard = document.getElementById("signUpCard");
const loginCard = document.getElementById("loginCard");
const forgotCard = document.getElementById("forgotCard");
const updateAccountPasswordCard = document.getElementById("updateAccountPasswordCard");
const createLibraryPasswordCard = document.getElementById("createLibraryPasswordCard");
const unlockLibraryPasswordCard = document.getElementById("unlockLibraryPasswordCard");
const resetLibraryPasswordCard = document.getElementById("resetLibraryPasswordCard");
const welcomeNote = document.querySelector(".welcome-note");

const allCards = [
    landingCard,
    signUpCard,
    loginCard,
    forgotCard,
    updateAccountPasswordCard,
    createLibraryPasswordCard,
    unlockLibraryPasswordCard,
    resetLibraryPasswordCard,
    welcomeNote
];

// Navigation triggers
const showSignUpBtn = document.getElementById("showSignUpBtn");
const showLoginBtn = document.getElementById("showLoginBtn");
const showForgotBtn = document.getElementById("showForgotBtn");
const loginForgotLink = document.getElementById("loginForgotLink");
const backToLandingBtns = document.querySelectorAll(".back-to-landing");

// Sign Up elements
const signUpEmail = document.getElementById("signUpEmail");
const signUpPassword = document.getElementById("signUpPassword");
const doSignUpBtn = document.getElementById("doSignUpBtn");
const signUpMsg = document.getElementById("signUpMsg");

// Log In elements
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const doLoginBtn = document.getElementById("doLoginBtn");
const loginMsg = document.getElementById("loginMsg");

// Forgot Password elements
const forgotEmail = document.getElementById("forgotEmail");
const sendResetEmailBtn = document.getElementById("sendResetEmailBtn");
const forgotMsg = document.getElementById("forgotMsg");

// Update Account Password elements
const newAccountPassword = document.getElementById("newAccountPassword");
const saveNewAccountPasswordBtn = document.getElementById("saveNewAccountPasswordBtn");
const updateAccountPasswordMsg = document.getElementById("updateAccountPasswordMsg");

// Create Library Password elements
const newLibraryPassword = document.getElementById("newLibraryPassword");
const confirmLibraryPassword = document.getElementById("confirmLibraryPassword");
const saveLibraryPasswordBtn = document.getElementById("saveLibraryPasswordBtn");
const createLibraryPasswordMsg = document.getElementById("createLibraryPasswordMsg");

// Unlock Library Password elements
const enterLibraryPassword = document.getElementById("enterLibraryPassword");
const unlockLibraryBtn = document.getElementById("unlockLibraryBtn");
const unlockLibraryMsg = document.getElementById("unlockLibraryMsg");
const showResetLibraryPasswordBtn = document.getElementById("showResetLibraryPasswordBtn");

// Reset Library Password elements
const resetLibraryPasswordInput = document.getElementById("resetLibraryPasswordInput");
const resetConfirmLibraryPasswordInput = document.getElementById("resetConfirmLibraryPasswordInput");
const doResetLibraryPasswordBtn = document.getElementById("doResetLibraryPasswordBtn");
const cancelResetLibraryBtn = document.getElementById("cancelResetLibraryBtn");
const resetLibraryPasswordMsg = document.getElementById("resetLibraryPasswordMsg");

// Welcome note elements
const enterLibraryBtn = document.getElementById("enterLibrary");


/* =========================================================
   CARD SWITCHING HELPER
========================================================= */

function showCard(cardToShow) {
    allCards.forEach(card => {
        if (card) {
            card.classList.add("hidden");
        }
    });

    if (cardToShow) {
        cardToShow.classList.remove("hidden");
    }

    // Clear feedback messages
    [signUpMsg, loginMsg, forgotMsg, updateAccountPasswordMsg, createLibraryPasswordMsg, unlockLibraryMsg, resetLibraryPasswordMsg].forEach(el => {
        if (el) {
            el.textContent = "";
            el.className = "feedback-msg";
        }
    });
}


/* =========================================================
   EVENT LISTENERS — NAVIGATION
========================================================= */

showSignUpBtn.addEventListener("click", () => {
    showCard(signUpCard);
    signUpEmail.focus();
});

showLoginBtn.addEventListener("click", () => {
    showCard(loginCard);
    loginEmail.focus();
});

showForgotBtn.addEventListener("click", () => {
    showCard(forgotCard);
    forgotEmail.focus();
});

loginForgotLink.addEventListener("click", () => {
    showCard(forgotCard);
    forgotEmail.value = loginEmail.value.trim();
    forgotEmail.focus();
});

backToLandingBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        showCard(landingCard);
    });
});


/* =========================================================
   CHECK / PROCEED TO LIBRARY PASSWORD STEP
========================================================= */

async function proceedAfterAccountAuth(user, isNewUser = false) {
    if (!user) return;

    if (isNewUser) {
        // If this was an explicit sign-up, immediately ask to create their library password
        showCard(createLibraryPasswordCard);
        newLibraryPassword.value = "";
        confirmLibraryPassword.value = "";
        newLibraryPassword.focus();
        return;
    }

    try {
        // Call server-side Postgres RPC function to check if this user already has a library password
        const { data: hasPass, error } = await supabaseClient.rpc("has_library_password");

        if (error) {
            console.error("Error checking library password status:", error);
            // Default to create password card for new users or show clear message
            showCard(createLibraryPasswordCard);
            newLibraryPassword.focus();
            return;
        }

        if (hasPass) {
            // User already has a library password -> Prompt to unlock
            showCard(unlockLibraryPasswordCard);
            enterLibraryPassword.value = "";
            enterLibraryPassword.focus();
        } else {
            // New user -> Prompt to create library password
            showCard(createLibraryPasswordCard);
            newLibraryPassword.value = "";
            confirmLibraryPassword.value = "";
            newLibraryPassword.focus();
        }
    } catch (err) {
        console.error("Unexpected error checking password:", err);
        showCard(createLibraryPasswordCard);
    }
}


/* =========================================================
   SIGN UP FLOW
========================================================= */

doSignUpBtn.addEventListener("click", async () => {
    const email = signUpEmail.value.trim();
    const password = signUpPassword.value;

    if (!email || !password) {
        signUpMsg.textContent = "Please enter both an email and an account password.";
        signUpMsg.className = "feedback-msg error";
        return;
    }

    if (password.length < 6) {
        signUpMsg.textContent = "Password should be at least 6 characters.";
        signUpMsg.className = "feedback-msg error";
        return;
    }

    signUpMsg.textContent = "Creating your account...";
    signUpMsg.className = "feedback-msg";
    doSignUpBtn.disabled = true;

    try {
        const { data, error } = await supabaseClient.auth.signUp({
            email: email,
            password: password
        });

        doSignUpBtn.disabled = false;

        if (error) {
            signUpMsg.textContent = error.message;
            signUpMsg.className = "feedback-msg error";
            return;
        }

        if (data.user) {
            // If email confirmation is required by Supabase project settings, session might be null
            if (!data.session) {
                signUpMsg.textContent = "Account created! If you have email confirmation enabled, please check your email. Otherwise, logging you in...";
                signUpMsg.className = "feedback-msg success";
            }
            await proceedAfterAccountAuth(data.user, true);
        }
    } catch (err) {
        doSignUpBtn.disabled = false;
        signUpMsg.textContent = "An error occurred while creating your account.";
        signUpMsg.className = "feedback-msg error";
    }
});

signUpPassword.addEventListener("keydown", (e) => {
    if (e.key === "Enter") doSignUpBtn.click();
});


/* =========================================================
   LOG IN FLOW
========================================================= */

doLoginBtn.addEventListener("click", async () => {
    const email = loginEmail.value.trim();
    const password = loginPassword.value;

    if (!email || !password) {
        loginMsg.textContent = "Please enter your email and account password.";
        loginMsg.className = "feedback-msg error";
        return;
    }

    loginMsg.textContent = "Logging you in...";
    loginMsg.className = "feedback-msg";
    doLoginBtn.disabled = true;

    try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });

        doLoginBtn.disabled = false;

        if (error) {
            loginMsg.textContent = error.message;
            loginMsg.className = "feedback-msg error";
            return;
        }

        if (data.user) {
            await proceedAfterAccountAuth(data.user);
        }
    } catch (err) {
        doLoginBtn.disabled = false;
        loginMsg.textContent = "An error occurred while logging in.";
        loginMsg.className = "feedback-msg error";
    }
});

loginPassword.addEventListener("keydown", (e) => {
    if (e.key === "Enter") doLoginBtn.click();
});


/* =========================================================
   FORGOT ACCOUNT PASSWORD FLOW
========================================================= */

sendResetEmailBtn.addEventListener("click", async () => {
    const email = forgotEmail.value.trim();

    if (!email) {
        forgotMsg.textContent = "Please enter your email address.";
        forgotMsg.className = "feedback-msg error";
        return;
    }

    forgotMsg.textContent = "Sending password reset email...";
    forgotMsg.className = "feedback-msg";
    sendResetEmailBtn.disabled = true;

    try {
        const redirectUrl = window.location.origin + window.location.pathname;

        const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
            redirectTo: redirectUrl
        });

        sendResetEmailBtn.disabled = false;

        if (error) {
            forgotMsg.textContent = error.message;
            forgotMsg.className = "feedback-msg error";
            return;
        }

        forgotMsg.textContent = "Password reset instructions have been sent to your email!";
        forgotMsg.className = "feedback-msg success";
    } catch (err) {
        sendResetEmailBtn.disabled = false;
        forgotMsg.textContent = "Failed to send reset link. Please try again.";
        forgotMsg.className = "feedback-msg error";
    }
});

forgotEmail.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendResetEmailBtn.click();
});


/* =========================================================
   UPDATE ACCOUNT PASSWORD (When clicking recovery email)
========================================================= */

saveNewAccountPasswordBtn.addEventListener("click", async () => {
    const newPass = newAccountPassword.value;

    if (!newPass || newPass.length < 6) {
        updateAccountPasswordMsg.textContent = "Password must be at least 6 characters.";
        updateAccountPasswordMsg.className = "feedback-msg error";
        return;
    }

    updateAccountPasswordMsg.textContent = "Updating password...";
    updateAccountPasswordMsg.className = "feedback-msg";
    saveNewAccountPasswordBtn.disabled = true;

    try {
        const { data, error } = await supabaseClient.auth.updateUser({
            password: newPass
        });

        saveNewAccountPasswordBtn.disabled = false;

        if (error) {
            updateAccountPasswordMsg.textContent = error.message;
            updateAccountPasswordMsg.className = "feedback-msg error";
            return;
        }

        updateAccountPasswordMsg.textContent = "Account password updated successfully!";
        updateAccountPasswordMsg.className = "feedback-msg success";

        setTimeout(async () => {
            if (data.user) {
                await proceedAfterAccountAuth(data.user);
            } else {
                showCard(loginCard);
            }
        }, 1200);
    } catch (err) {
        saveNewAccountPasswordBtn.disabled = false;
        updateAccountPasswordMsg.textContent = "Failed to update account password.";
        updateAccountPasswordMsg.className = "feedback-msg error";
    }
});


/* =========================================================
   CREATE PERSONAL LIBRARY PASSWORD (Server-side bcrypt)
========================================================= */

saveLibraryPasswordBtn.addEventListener("click", async () => {
    const pass1 = newLibraryPassword.value.trim();
    const pass2 = confirmLibraryPassword.value.trim();

    if (!pass1) {
        createLibraryPasswordMsg.textContent = "Please enter a Library password.";
        createLibraryPasswordMsg.className = "feedback-msg error";
        return;
    }

    if (pass1 !== pass2) {
        createLibraryPasswordMsg.textContent = "Passwords do not match.";
        createLibraryPasswordMsg.className = "feedback-msg error";
        return;
    }

    createLibraryPasswordMsg.textContent = "Saving your Library password...";
    createLibraryPasswordMsg.className = "feedback-msg";
    saveLibraryPasswordBtn.disabled = true;

    try {
        // Call secure Postgres RPC: set_library_password(new_password)
        const { data, error } = await supabaseClient.rpc("set_library_password", {
            new_password: pass1
        });

        saveLibraryPasswordBtn.disabled = false;

        if (error) {
            createLibraryPasswordMsg.textContent = error.message;
            createLibraryPasswordMsg.className = "feedback-msg error";
            return;
        }

        // Set session unlock flag
        sessionStorage.setItem("the_library_unlocked", "true");

        // Show welcome note
        showCard(welcomeNote);
    } catch (err) {
        saveLibraryPasswordBtn.disabled = false;
        createLibraryPasswordMsg.textContent = "Could not save Library password.";
        createLibraryPasswordMsg.className = "feedback-msg error";
    }
});

confirmLibraryPassword.addEventListener("keydown", (e) => {
    if (e.key === "Enter") saveLibraryPasswordBtn.click();
});


/* =========================================================
   UNLOCK PERSONAL LIBRARY PASSWORD (Server-side bcrypt)
========================================================= */

async function unlockLibrary() {
    const entered = enterLibraryPassword.value.trim();

    if (!entered) {
        unlockLibraryMsg.textContent = "Please enter your Library password.";
        unlockLibraryMsg.className = "feedback-msg error";
        return;
    }

    unlockLibraryMsg.textContent = "Verifying password...";
    unlockLibraryMsg.className = "feedback-msg";
    unlockLibraryBtn.disabled = true;

    try {
        // Call secure Postgres RPC: verify_library_password(password_attempt)
        const { data: isValid, error } = await supabaseClient.rpc("verify_library_password", {
            password_attempt: entered
        });

        unlockLibraryBtn.disabled = false;

        if (error) {
            unlockLibraryMsg.textContent = error.message;
            unlockLibraryMsg.className = "feedback-msg error";
            return;
        }

        if (isValid === true) {
            // Set session unlock flag
            sessionStorage.setItem("the_library_unlocked", "true");

            // Show welcome note
            showCard(welcomeNote);
        } else {
            unlockLibraryMsg.textContent = "Incorrect Library password. Please try again.";
            unlockLibraryMsg.className = "feedback-msg error";
            enterLibraryPassword.focus();
        }
    } catch (err) {
        unlockLibraryBtn.disabled = false;
        unlockLibraryMsg.textContent = "Verification failed. Please try again.";
        unlockLibraryMsg.className = "feedback-msg error";
    }
}

unlockLibraryBtn.addEventListener("click", unlockLibrary);

enterLibraryPassword.addEventListener("keydown", (e) => {
    if (e.key === "Enter") unlockLibrary();
});


/* =========================================================
   RESET PERSONAL LIBRARY PASSWORD (For Authenticated User)
========================================================= */

showResetLibraryPasswordBtn.addEventListener("click", () => {
    showCard(resetLibraryPasswordCard);
    resetLibraryPasswordInput.value = "";
    resetConfirmLibraryPasswordInput.value = "";
    resetLibraryPasswordInput.focus();
});

cancelResetLibraryBtn.addEventListener("click", () => {
    showCard(unlockLibraryPasswordCard);
    enterLibraryPassword.focus();
});

doResetLibraryPasswordBtn.addEventListener("click", async () => {
    const pass1 = resetLibraryPasswordInput.value.trim();
    const pass2 = resetConfirmLibraryPasswordInput.value.trim();

    if (!pass1) {
        resetLibraryPasswordMsg.textContent = "Please enter a new Library password.";
        resetLibraryPasswordMsg.className = "feedback-msg error";
        return;
    }

    if (pass1 !== pass2) {
        resetLibraryPasswordMsg.textContent = "Passwords do not match.";
        resetLibraryPasswordMsg.className = "feedback-msg error";
        return;
    }

    resetLibraryPasswordMsg.textContent = "Updating your Library password...";
    resetLibraryPasswordMsg.className = "feedback-msg";
    doResetLibraryPasswordBtn.disabled = true;

    try {
        const { data, error } = await supabaseClient.rpc("set_library_password", {
            new_password: pass1
        });

        doResetLibraryPasswordBtn.disabled = false;

        if (error) {
            resetLibraryPasswordMsg.textContent = error.message;
            resetLibraryPasswordMsg.className = "feedback-msg error";
            return;
        }

        sessionStorage.setItem("the_library_unlocked", "true");
        showCard(welcomeNote);
    } catch (err) {
        doResetLibraryPasswordBtn.disabled = false;
        resetLibraryPasswordMsg.textContent = "Failed to update Library password.";
        resetLibraryPasswordMsg.className = "feedback-msg error";
    }
});

resetConfirmLibraryPasswordInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") doResetLibraryPasswordBtn.click();
});


/* =========================================================
   ENTER THE LIBRARY
========================================================= */

enterLibraryBtn.addEventListener("click", () => {
    window.location.href = "libraryy.html";
});


/* =========================================================
   CHECK INITIAL AUTH & HANDLE RECOVERY LINKS
========================================================= */

supabaseClient.auth.onAuthStateChange(async (event, session) => {
    if (event === "PASSWORD_RECOVERY") {
        showCard(updateAccountPasswordCard);
        newAccountPassword.focus();
    }
});

// Check if user is already logged in when visiting indexx.html
(async function init() {
    try {
        // If coming from password reset hash link
        if (window.location.hash && window.location.hash.includes("type=recovery")) {
            showCard(updateAccountPasswordCard);
            return;
        }

        const { data: { session } } = await supabaseClient.auth.getSession();
        if (session && session.user) {
            // Already logged into Supabase Auth -> Ask for Library password
            await proceedAfterAccountAuth(session.user);
        } else {
            showCard(landingCard);
        }
    } catch (e) {
        showCard(landingCard);
    }
})();