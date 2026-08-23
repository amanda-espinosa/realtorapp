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

window.addEventListener("DOMContentLoaded", init);

async function init() {
    let registerButton = document.getElementById("register");

    registerButton.addEventListener("click", async e => {
        e.stopPropagation();

        const email = document.getElementById("email").value.trim();
        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value;
        
        const body = new URLSearchParams({
          //action: "registerUser",
          email,
          username,
          password,
        });
        
        try {
          const response = await fetch("../php/main.php?action=registerUser", {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body,
          });
        
          const resp = await response.json();
          console.log(resp);
          if (resp.success) {
              showNotification("User registered!", "success");
              setTimeout(() => {
                  window.location.href = "../html/login.html?registered=1";
              }, 1000);
          } else {
              showNotification("Could not register user.", "danger");
          }

            /*"success" => true,
                            "userId" => $userId,
                            "verification" => $registerToken ?? null */
          
        } catch (error) {
          console.error("Registration failed:", error);
        }
    });

}

