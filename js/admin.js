
const ownerPanel = document.getElementById("ownerPanel");
const staffList = document.getElementById("staffList");
const staffMessage = document.getElementById("staffMessage");
const createStaffForm = document.getElementById("createStaffForm");

if (ownerPanel) ownerPanel.hidden = true;

async function checkOwner() {
    const { data: { session }, error: sessionError } =
        await supabaseClient.auth.getSession();

    if (sessionError || !session) {
        window.location.replace("login.html");
        return false;
    }

    const { data: profile, error } = await supabaseClient
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

    if (error || profile?.role !== "owner") {
        if (staffMessage) {
            staffMessage.textContent = "Owner permission required.";
        }
        return false;
    }

    if (ownerPanel) ownerPanel.hidden = false;
    return true;
}

async function loadStaff() {
    if (!staffList) return;

    staffList.textContent = "Loading staff...";

    const { data, error } = await supabaseClient.functions.invoke(
        "list-staff",
        { body: {} }
    );

    if (error || data?.error) {
        staffList.textContent =
            "Could not load staff: " + (data?.error || error.message);
        return;
    }

    staffList.replaceChildren();

    if (!data.staff || data.staff.length === 0) {
        staffList.textContent = "No staff accounts found.";
        return;
    }

    data.staff.forEach(person => {
        const item = document.createElement("div");
        item.style.padding = "12px";
        item.style.marginBottom = "10px";
        item.style.background = "#17243a";
        item.style.borderRadius = "8px";

        const name = document.createElement("h3");
        name.textContent = person.username || "Unnamed staff";

        const details = document.createElement("p");
        details.textContent =
            person.role.replaceAll("_", " ") +
            " | " + (person.department || "No department");

        const roleSelect = document.createElement("select");

        [
            ["administration", "Administration"],
            ["team_command", "Team Command"],
            ["trainer", "Trainer"]
        ].forEach(([value, label]) => {
            const option = document.createElement("option");
            option.value = value;
            option.textContent = label;
            roleSelect.appendChild(option);
        });

        roleSelect.value = person.role;

        const departmentSelect = document.createElement("select");

        [
            "Metropolitan Police Service",
            "Roads Policing Unit",
            "Armed Response Unit",
            "London Ambulance Service",
            "London Fire Brigade"
        ].forEach(department => {
            const option = document.createElement("option");
            option.value = department;
            option.textContent = department;
            departmentSelect.appendChild(option);
        });

        departmentSelect.value = person.department;

        const updateButton = document.createElement("button");
        updateButton.textContent = "Save Changes";

        updateButton.onclick = async () => {
            updateButton.disabled = true;

            const { data, error } =
                await supabaseClient.functions.invoke("manage-staff", {
                    body: {
                        action: "update",
                        userId: person.id,
                        role: roleSelect.value,
                        department: departmentSelect.value
                    }
                });

            updateButton.disabled = false;

            if (error || data?.error) {
                alert(data?.error || error.message);
                return;
            }

            alert("Staff details updated!");
            await loadStaff();
        };

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete Staff";

        deleteButton.onclick = async () => {
            if (!confirm("Are you sure you want to delete " +
                person.username + "?")) return;

            deleteButton.disabled = true;

            const { data, error } =
                await supabaseClient.functions.invoke("manage-staff", {
                    body: {
                        action: "delete",
                        userId: person.id
                    }
                });

            deleteButton.disabled = false;

            if (error || data?.error) {
                alert(data?.error || error.message);
                return;
            }

            alert("Staff account deleted.");
            await loadStaff();
        };

        item.append(
            name,
            details,
            roleSelect,
            departmentSelect,
            updateButton,
            deleteButton
        );

        staffList.appendChild(item);
    });
}

if (createStaffForm) {
    createStaffForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        if (!await checkOwner()) return;

        const username =
            document.getElementById("newUsername").value.trim();

        const password =
            document.getElementById("newPassword").value;

        const role =
            document.getElementById("newRole").value;

        const department =
            document.getElementById("newDepartment").value;

        staffMessage.textContent = "Creating staff account...";

        const { data, error } =
            await supabaseClient.functions.invoke("create-staff", {
                body: {
                    username,
                    password,
                    role,
                    department
                }
            });

        if (error || data?.error) {
            staffMessage.textContent =
                "Error: " + (data?.error || error.message);
            return;
        }

        staffMessage.textContent =
            "Staff account created successfully!";

        createStaffForm.reset();
        await loadStaff();
    });
}

(async function startStaffManagement() {
    if (await checkOwner()) {
        await loadStaff();
    }
})();
