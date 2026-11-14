
const ACCOUNT_KEY = "northLondonAccounts";

const setupPanel = document.getElementById("setupPanel");
const loginPanel = document.getElementById("loginPanel");
const message = document.getElementById("message");

function getAccounts() {
    return JSON.parse(localStorage.getItem(ACCOUNT_KEY) || "[]");
}

function saveAccounts(accounts) {
    localStorage.setItem(ACCOUNT_KEY, JSON.stringify(accounts));
}

async function hashPassword(password, salt) {
    const data = new TextEncoder().encode(salt + password);
    const hash = await crypto.subtle.digest("SHA-256", data);

    return Array.from(new Uint8Array(hash))
        .map(byte => byte.toString(16).padStart(2, "0"))
        .join("");
}

function showMessage(text, error = false) {
    message.textContent = text;
    message.style.color = error ? "#ff7777" : "#75d69a";
}

function updatePanels() {
    const ownerExists = getAccounts().some(
        account => account.role === "Owner"
    );

    setupPanel.hidden = ownerExists;
    loginPanel.hidden = !ownerExists;
}

document.getElementById("setupButton").addEventListener("click", async () => {
    const username = document.getElementById("ownerUsername").value;
    const password = document.getElementById("ownerPassword").value;
    const confirm = document.getElementById("confirmPassword").value;

    if (getAccounts().length > 0) {
        showMessage("An account already exists.", true);
        updatePanels();
        return;
    }

    if (password.length < 10) {
        showMessage("Password must be at least 10 characters.", true);
        return;
    }

    if (password !== confirm) {
        showMessage("Passwords do not match.", true);
        return;
    }

    try {
        const salt = crypto.randomUUID();
        const hash = await hashPassword(password, salt);

        saveAccounts([{
            username: username,
            salt: salt,
            hash: hash,
            role: "Owner",
            department: "All Departments"
        }]);

        showMessage("Owner account created. You can now log in!");
        document.getElementById("ownerPassword").value = "";
        document.getElementById("confirmPassword").value = "";

        updatePanels();
    } catch (error) {
        showMessage("Password setup failed. Please try another browser.", true);
    }
});

document.getElementById("loginButton").addEventListener("click", async () => {
    const username = document.getElementById("loginUsername").value.trim();
    const password = document.getElementById("loginPassword").value;

    const account = getAccounts().find(
        item => item.username.toLowerCase() === username.toLowerCase()
    );

    if (!account) {
        showMessage("Incorrect username or password.", true);
        return;
    }

    try {
        const hash = await hashPassword(password, account.salt);

        if (hash !== account.hash) {
            showMessage("Incorrect username or password.", true);
            return;
        }

        sessionStorage.setItem("northLondonUser", account.username);
        sessionStorage.setItem("northLondonRole", account.role);

        window.location.href = "index.html";
    } catch (error) {
        showMessage("Login failed.", true);
    }
});

updatePanels();
