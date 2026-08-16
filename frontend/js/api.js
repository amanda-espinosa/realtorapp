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

const api = {
    previewContentUrl: "../../backend/php/main.php?action=getPropertyList",
    numberOfHouses: 8,
    openCageKeyUrl: "../../backend/php/main.php?action=getOpenCageKey",

    getPreviewContent: function (currentPage) {
        let numberOfHouses = this.numberOfHouses;
        const startingPoint = (currentPage - 1) * numberOfHouses;
        return $.ajax({
            url: this.previewContentUrl,
            method: "GET",
            data: { numberOfHouses, startingPoint },
            dataType: "json"
        });
    },

    getOpenCageLeafletKey: async function () {
        return $.ajax({
            url: this.openCageKeyUrl,
            method: "GET",
            dataType: "text"
        });
    }
};
