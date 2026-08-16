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

window.addEventListener("DOMContentLoaded", init);

function init(){
  const params = new URLSearchParams(window.location.search);
      const error = params.get("error");
  
      const notification = document.getElementById("loginNotification");
  
      if (error === "invalid") {
          notification.innerHTML = `
              <div class="alert alert-danger" role="alert">
                  Incorrect email or password.
              </div>
          `;
      }
  
      if (error === "not-verified") {
          notification.innerHTML = `
              <div class="alert alert-warning" role="alert">
                  Please verify your email before logging in.
              </div>
          `;
      }
  
      if (error === "too-many-attempts") {
          notification.innerHTML = `
              <div class="alert alert-warning" role="alert">
                  Too many login attempts. Please try again later.
              </div>
          `;
      }
}
