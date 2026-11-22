
const departments = [
    "Metropolitan Police Service",
    "Roads Policing Unit",
    "Armed Response Unit",
    "London Ambulance Service",
    "London Fire Brigade"
];

const leadList = document.getElementById("departmentLeadList");
const leadMessage = document.getElementById("leadMessage");

async function loadDepartmentLeads() {
    const {
        data: { session },
        error: sessionError
    } = await supabaseClient.auth.getSession();

    if (sessionError || !session) {
        window.location.replace("login.html");
        return;
    }

    const { data: profile, error: profileError } =
        await supabaseClient
            .from("profiles")
            .select("role")
            .eq("id", session.user.id)
            .single();

    if (profileError || !profile) {
        leadList.textContent = "Unable to check account permissions.";
        return;
    }

    const isOwner = profile.role === "owner";

    const { data: leads, error } = await supabaseClient
        .from("department_leads")
        .select("department, lead_name")
        .order("department");

    if (error) {
        leadList.textContent =
            "Could not load department leads: " + error.message;
        return;
    }

    leadList.replaceChildren();

    departments.forEach(department => {
        const savedLead = leads.find(
            item => item.department === department
        );

        const leadName = savedLead?.lead_name || "";

        const card = document.createElement("div");
        card.className = "lead-card";

        const heading = document.createElement("h3");
        heading.textContent = department;

        const name = document.createElement("p");
        name.className = "lead-name";
        name.textContent = leadName || "No department lead assigned.";

        card.appendChild(heading);
        card.appendChild(name);

        if (isOwner) {
            const editor = document.createElement("div");
            editor.className = "lead-editor";

            const input = document.createElement("input");
            input.type = "text";
            input.placeholder = "Enter department lead username";
            input.value = leadName;

            const saveButton = document.createElement("button");
            saveButton.textContent = "Save Lead";

            saveButton.addEventListener("click", async () => {
                const newName = input.value.trim();

                saveButton.disabled = true;
                saveButton.textContent = "Saving...";

                const { error: saveError } = await supabaseClient
                    .from("department_leads")
                    .upsert({
                        department: department,
                        lead_name: newName,
                        updated_by: session.user.id,
                        updated_at: new Date().toISOString()
                    }, {
                        onConflict: "department"
                    });

                saveButton.disabled = false;
                saveButton.textContent = "Save Lead";

                if (saveError) {
                    leadMessage.textContent =
                        "Could not save lead: " + saveError.message;
                    return;
                }

                leadMessage.textContent =
                    department + " lead updated successfully!";

                await loadDepartmentLeads();
            });

            editor.append(input, saveButton);
            card.appendChild(editor);
        }

        leadList.appendChild(card);
    });
}

loadDepartmentLeads();
