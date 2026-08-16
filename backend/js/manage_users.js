/*
 * RealtorApp
 * Copyright (C) 2026 Amanda Espinosa Ramos
 *
 * This file is part of RealtorApp.
 *
 * RealtorApp is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, version 3 of the License.
 *
 * RealtorApp is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with RealtorApp. If not, see <https://www.gnu.org/licenses/>.
 */

let users = [];

let userRoles = [
    "ADMIN",
    "MAINTAINER"
];

let addUserModal;

//Notifications
function showMsg(id, text) {
    let el = document.getElementById(id);
    el.textContent = text;
    el.classList.remove("d-none");
}

function hideMsg(id) {
    const el = document.getElementById(id);
    el.textContent = "";
    el.classList.add("d-none");
}

function showNotification(message, type = "success") {
    let el = document.getElementById("notification");

    el.classList.remove(
        "d-none", "alert-success", "alert-danger", "alert-warning", "alert-info", "alert-primary", "alert-secondary", "alert-light", "alert-dark"
    );

    el.classList.add("alert", `alert-${type}`);
    el.textContent = message;

    setTimeout(() => hideMsg("notification"), 3000);
}

function bootstrapConfirm(message, options = {}) {
    const title = options.title ?? "Confirm";
    const okText = options.okText ?? "OK";
    const cancelText = options.cancelText ?? "Cancel";

    const modalEl = document.getElementById("confirmModal");
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);

    document.getElementById("confirmTitle").textContent = title;
    document.getElementById("confirmBody").textContent = message;

    const okBtn = document.getElementById("confirmOk");
    const cancelBtn = document.getElementById("confirmCancel");

    okBtn.textContent = okText;
    cancelBtn.textContent = cancelText;

    return new Promise((resolve) => {
        const cleanup = () => {
            okBtn.removeEventListener("click", onOk);
            modalEl.removeEventListener("hidden.bs.modal", onHidden);
        };

        const onOk = () => {
            cleanup();
            modal.hide();
            resolve(true);
        };

        const onHidden = () => {
            cleanup();
            resolve(false);
        };

        okBtn.addEventListener("click", onOk, { once: true });
        modalEl.addEventListener("hidden.bs.modal", onHidden, { once: true });

        modal.show();
    });
}

async function loadUsers() {
    const url = "../php/main.php?action=requestUsers";

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const result = await response.json();
        console.log(result);

        return result.users || [];

    } catch (error) {
        console.error(error.message);
        return [];
    }
}

function renderUsers() {
    let thead = document.getElementById("thead");
    let tbody = document.getElementById("tbody");

    $(thead).empty();
    $(tbody).empty();


    let headerTr = document.createElement("tr");
    headerTr.innerHTML = `
            <th>Username</th>
            <th>Email</th>
            <th>User status</th>
            <th>User role</th>
            <th>Registration</th>
            <th>Last login</th>
            <th colspan="2">Actions</th>
        `;

    thead.appendChild(headerTr);

    for (let i = 0; i < users.length; i++) {
        let user = users[i];
        let tr = document.createElement("tr");

        let deleteButton = document.createElement("button");
        deleteButton.classList.add("action-btn", "btn");

        let deleteIcon = document.createElement("i");
        deleteIcon.classList.add("bi", "bi-trash");
        deleteButton.appendChild(deleteIcon);

        let saveButton = document.createElement("button");
        saveButton.classList.add("action-btn", "btn");
        saveButton.disabled = true;

        let saveIcon = document.createElement("i");
        saveIcon.classList.add("bi", "bi-floppy", "realtorapp-disabled-btn");
        saveButton.appendChild(saveIcon);

        let td = document.createElement("td");
        td.innerHTML = user.username;
        tr.appendChild(td);

        td = document.createElement("td");
        td.innerHTML = user.email;
        tr.appendChild(td);

        td = document.createElement("td");
        td.innerHTML = getUserStatusString(user.status);
        tr.appendChild(td);

        td = document.createElement("td");
        let select = document.createElement("select");
        select.classList.add("user-role-select");
        let option = document.createElement("option");
        option.value = "";
        option.textContent = "Select a role";
        option.disabled = true;
        option.selected = true;
        select.appendChild(option);

        for (let i = 0; i < userRoles.length; i++) {
            option = document.createElement("option");
            option.value = userRoles[i];
            option.textContent = userRoles[i];
            option.selected = getUserRoleString(user.roles_mask) == userRoles[i];
            select.appendChild(option);
        }

        select.addEventListener('change', function (event) {
            const selectedRole = event.target.value;
            saveButton.disabled = (selectedRole === getUserRoleString(user.roles_mask));
        });

        saveButton.addEventListener("click", async () => {
            let selectedRole = select.value;

            if (user.roles_mask == "1" && selectedRole != userRoles[0]) {
                const matches = $.grep(users, u => u.roles_mask === "1" && u.id !== user.id);

                if (matches.length === 0) {
                    showNotification("Error when saving. At least one user must be admin", type = "danger");
                    return;
                }
            }

            try {
                let res = await fetch("../php/main.php?action=updateUserRole", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: user.id, role: selectedRole })
                });

                const raw = await res.text();
                const data = JSON.parse(raw);

                if (!data.success) {
                    showNotification("Could not save role", type = "danger");
                    return;
                }

                user.roles_mask = (selectedRole === "ADMIN") ? "1" : "4096";
                saveButton.disabled = true;

                showNotification("Saved successfully!", "success");

            } catch (e) {
                showNotification("Could not save role", type = "danger");
            }
        });

        deleteButton.addEventListener("click", async () => {
            const confirmed = await bootstrapConfirm(`Delete user "${user.username}"?`, {
                title: "Delete user",
                okText: "Delete",
                cancelText: "Cancel"
            });
            if (!confirmed) return;

            try {
                let res = await fetch("../php/main.php?action=deleteUserById", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: user.id })
                });

                let raw = await res.text();
                let data = JSON.parse(raw);

                if (!data.success) {
                    showNotification("Could not delete user", type = "danger");
                    return;
                }

                tr.remove();
            }
            catch (e) {
                showNotification("Could not delete user", type = "danger");
            }
        });

        td.appendChild(select);
        tr.appendChild(td);

        td = document.createElement("td");
        td.innerHTML = user.registered == null ? "-" : getDateTimeStringFromEpoch(user.registered);
        tr.appendChild(td);

        td = document.createElement("td");
        td.innerHTML = user.last_login == null ? "-" : getDateTimeStringFromEpoch(user.last_login);
        tr.appendChild(td);

        let saveButtonTd = document.createElement("td");
        saveButtonTd.appendChild(saveButton);
        tr.appendChild(saveButtonTd);
        //tbody.appendChild(tr);

        let deleteButtonTd = document.createElement("td");
        deleteButtonTd.appendChild(deleteButton);
        tr.appendChild(deleteButtonTd);
        tbody.appendChild(tr);
    }

    let addRow = document.createElement("tr");
    let addTd = document.createElement("td");
    addTd.colSpan = 8;
    addTd.classList.add("py-3");

    let addUserButton = document.createElement("a");
    addUserButton.id = "addUserButton";
    addUserButton.className = "realtorapp-btn-circle";
    addUserButton.href = "#";
    addUserButton.title = "Add User";
    addUserButton.setAttribute("aria-label", "Add User");
    addUserButton.innerHTML = `<i class="bi bi-person-plus"></i>`;

    addTd.appendChild(addUserButton);

    addRow.appendChild(addTd);
    tbody.appendChild(addRow);
}

function getUserStatusString(status) {
    switch (parseInt(status)) {
        case 0: return "NORMAL"; break;
        case 1: return "ARCHIVED"; break;
        case 2: return "BANNED"; break;
        case 3: return "LOCKED"; break;
        case 4: return "PENDING_REVIEW"; break;
        case 5: return "SUSPENDED"; break;
        default: return "UNKNOWN"; break;
    }
}

function getUserRoleString(roles_mask) {
    switch (parseInt(roles_mask)) {
        case 1: return "ADMIN"; break;
        case 4096: return "MAINTAINER"; break;
        default: return "UNKNOWN"; break;
    }
}

function getDateTimeStringFromEpoch(epochTime) {
    let seconds = Number(epochTime);
    let date = new Date(seconds * 1000);
    return date.toISOString();
}

window.addEventListener("DOMContentLoaded", async () => {
    const tbody = document.getElementById("tbody");
    if (!tbody) {
        console.error("DOMContentLoaded: <tbody id='tbody'> not found. Fix your HTML id.");
        return;
    }

    users = await loadUsers();

    if (!users.length) {
        tbody.innerHTML = `<tr><td colspan="8" style="color:red;">No users found (or failed to load).</td></tr>`;
        return;
    }

    renderUsers();

    addUserModal = new bootstrap.Modal(document.getElementById("addUserModal"));

    $(document).on("click", "#addUserButton", (e) => {
        e.preventDefault();
        $("#addUserForm")[0].reset();
        $("#addUserError").addClass("d-none").text("");
        $("#addUserSuccess").addClass("d-none").text("");
        addUserModal.show();
    });

    document.addEventListener("submit", async (e) => {
        if (e.target.id !== "addUserForm") return;
        e.preventDefault();


        hideMsg("addUserError");
        hideMsg("addUserSuccess");

        const payload = {
            email: document.getElementById("newUserEmail").value.trim(),
            username: document.getElementById("newUsername").value.trim(),
            password: document.getElementById("newPassword").value,
            role: document.getElementById("newRole").value
        };

        try {
            const res = await fetch("../php/main.php?action=createUser", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const raw = await res.text();
            console.log("createUser status:", res.status, "redirected:", res.redirected, "url:", res.url);
            console.log("RAW createUser response:", raw);

            if (!raw || raw.trim() === "") {
                showMsg("notification", "Empty response from server (no JSON). Check PHP.");
                return;
            }

            console.log("RAW (first 300 chars):", raw.slice(0, 300));

            let data;
            try {
                data = JSON.parse(raw);
            } catch (e) {
                showMsg("notification", "Not JSON. Check console RAW response.");
                return;
            }

            if (!data.success) {
                showNotification(data.error || "Could not create user.", "danger");
                return;
            }

            showNotification("User created!", "success");

            users = await loadUsers();
            renderUsers();

            setTimeout(() => addUserModal.hide(), 400);

        } catch (err) {
            showMsg("addUserError", err.message || "Network error");
        }
    });
});
