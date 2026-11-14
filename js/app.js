
const form = document.getElementById("trainingForm");

form.addEventListener("submit", function(event) {
    event.preventDefault();

    const record = {
        username: document.getElementById("username").value,
        department: document.getElementById("department").value,
        type: document.getElementById("trainingType").value,
        trainer: document.getElementById("trainer").value,
        result: document.getElementById("result").value,
        notes: document.getElementById("notes").value,
        date: new Date().toLocaleDateString(),
        evidence: document.getElementById("evidence").files[0]?.name || "No evidence"
    };

    trainingRecords.push(record);

    localStorage.setItem(
        "northLondonRecords",
        JSON.stringify(trainingRecords)
    );

    form.reset();
    displayRecords();

    alert("Training record saved!");
});
function displayRecords() {
    const container = document.getElementById("records");
    const search = document.getElementById("search").value.toLowerCase();

    container.innerHTML = "";

    const filtered = trainingRecords.filter(record =>
        record.username.toLowerCase().includes(search)
    );

    filtered.forEach(record => {
        container.innerHTML += `
            <div class="record">
                <h3>${escapeHTML(record.username)}</h3>
                <p>Department: ${escapeHTML(record.department)}</p>
                <p>Training: ${escapeHTML(record.type)}</p>
                <p>Trainer: ${escapeHTML(record.trainer)}</p>
                <p>Result: ${escapeHTML(record.result)}</p>
                <p>Date: ${escapeHTML(record.date)}</p>
                <p>Evidence: ${escapeHTML(record.evidence)}</p>
                <p>${escapeHTML(record.notes)}</p>
            </div>
        `;
    });

    document.getElementById("recordCount").textContent =
        trainingRecords.length;
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

displayRecords();
