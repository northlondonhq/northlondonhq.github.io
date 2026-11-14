
const accessMessage = document.getElementById("accessMessage");
const historyPanel = document.getElementById("historyPanel");
const historyList = document.getElementById("historyList");
const trainingPanel = document.getElementById("trainingPanel");
const trainingForm = document.getElementById("trainingForm");
const trainingMessage = document.getElementById("trainingMessage");

const allowedRoles = [
    "trainer",
    "team_command",
    "administration",
    "owner"
];

let currentProfile = null;

async function loadTrainingPage() {
    const { data: { session }, error: sessionError } =
        await supabaseClient.auth.getSession();

    if (sessionError || !session) {
        window.location.replace("login.html");
        return;
    }

    const { data: profile, error } = await supabaseClient
        .from("profiles")
        .select("username, role, department")
        .eq("id", session.user.id)
        .single();

    if (error || !profile) {
        accessMessage.textContent = "Unable to load your account.";
        return;
    }

    currentProfile = profile;

    accessMessage.textContent = "Welcome, " + profile.username + ".";

    // Everyone can view their own training history.
    historyPanel.hidden = false;
    await loadMyHistory(session.user.id);

    // Only authorised staff can log training.
    if (allowedRoles.includes(profile.role)) {
        trainingPanel.hidden = false;

        document.getElementById("trainerName").value =
            profile.username || "";
    } else {
        trainingPanel.hidden = true;
    }
}

async function loadMyHistory(userId) {
    historyList.textContent = "Loading your training history...";

    const { data: records, error } = await supabaseClient
        .from("training_records")
        .select("department, training_type, trainer_name, result, notes, created_at")
        
        .order("created_at", { ascending: false });

    if (error) {
        historyList.textContent =
            "Could not load your history: " + error.message;
        return;
    }

    if (!records || records.length === 0) {
        historyList.textContent = "You do not have any training records yet.";
        return;
    }

    historyList.innerHTML = "";

    records.forEach(record => {
        const card = document.createElement("div");
        card.className = "training-record";

        const heading = document.createElement("h4");
        heading.textContent = record.training_type;

        const department = document.createElement("p");
        department.textContent = "Department: " + record.department;

        const trainer = document.createElement("p");
        trainer.textContent = "Trainer: " + record.trainer_name;

        const result = document.createElement("p");
        result.textContent = "Result: " + record.result;

        const notes = document.createElement("p");
        notes.textContent = "Notes: " + (record.notes || "None");

        const date = document.createElement("p");
        date.textContent = "Date: " +
            new Date(record.created_at).toLocaleString("en-GB");

        card.append(heading, department, trainer, result, notes, date);
        historyList.appendChild(card);
    });
}

if (trainingForm) {
    trainingForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        if (!currentProfile ||
            !allowedRoles.includes(currentProfile.role)) {
            trainingMessage.textContent =
                "You are not authorised to log training.";
            return;
        }

        trainingMessage.textContent = "Submitting training record...";

        const record = {
            traineeUsername: document.getElementById("trainee").value.trim(),
            department: document.getElementById("department").value,
            trainingType: document.getElementById("trainingType").value.trim(),
            result: document.getElementById("result").value,
            notes: document.getElementById("notes").value.trim()
        };

        const { data, error } = await supabaseClient.functions.invoke(
            "log-training",
            { body: record }
        );

        if (error || data?.error) {
            trainingMessage.textContent =
                "Error: " + (data?.error || error.message);
            return;
        }

        trainingMessage.textContent =
            "Training record saved successfully!";

        trainingForm.reset();

        document.getElementById("trainerName").value =
            currentProfile.username || "";

        // Refresh the trainee's own history if the trainer logged
        // a record for themselves.
        const { data: { session } } =
            await supabaseClient.auth.getSession();

        if (session) {
            await loadMyHistory(session.user.id);
        }
    });
}

loadTrainingPage();
