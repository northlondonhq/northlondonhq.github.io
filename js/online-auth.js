
const loginPanel = document.getElementById("loginPanel");
const registerPanel = document.getElementById("registerPanel");
const message = document.getElementById("message");

function showMessage(text, error = false) {
    message.textContent = text;
    message.style.color = error ? "#ff7777" : "#75d69a";
}

document.getElementById("showRegister").onclick = () => {
    loginPanel.hidden = true;
    registerPanel.hidden = false;
    showMessage("");
};

document.getElementById("showLogin").onclick = () => {
    registerPanel.hidden = true;
    loginPanel.hidden = false;
    showMessage("");
};

document.getElementById("registerButton").onclick = async () => {
    const username = document.getElementById("registerUsername").value.trim();
    const email = document.getElementById("registerEmail").value.trim();
    const password = document.getElementById("registerPassword").value;

    if (!username || !email || password.length < 10) {
        showMessage("Enter a username, valid email and password of at least 10 characters.", true);
        return;
    }

    const { error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
            data: { username }
        }
    });

    if (error) {
        showMessage(error.message, true);
        return;
    }

    showMessage("Registration submitted! Check your email to confirm your account.");
};

document.getElementById("loginButton").onclick = async () => {
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        showMessage(error.message, true);
        return;
    }

    const { data: profile, error: profileError } =
        await supabaseClient
            .from("profiles")
            .select("username, role, department")
            .eq("id", data.user.id)
            .single();

    if (profileError || !profile) {
        await supabaseClient.auth.signOut();
        showMessage("Your profile could not be loaded. Contact North London management.", true);
        return;
    }

    showMessage("Welcome, " + profile.username + "! Login successful.");

    // Dashboard redirection will be enabled after its online
    // security checks have been installed.
};
