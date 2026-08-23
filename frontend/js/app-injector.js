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

let appContainer = document.getElementById("realtor-app-container");

if (!appContainer) {
    throw new Error("Element with ID 'realtor-app-container' not found.");
}

let iframe = document.createElement("iframe");

iframe.src = "realtorapp/frontend/html/properties_preview.html";
iframe.style.position = "relative";
iframe.style.width = "100%";
iframe.style.minHeight = "100vh";

iframe.frameBorder = "0";

appContainer.appendChild(iframe);

