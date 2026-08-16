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

const pagination = {
    renderPaginationControls: function ({ container, currentPage, totalPages, onChange }) {
        container.innerHTML = "";

        const createBtn = (text, page, disabled = false, highlight = false) => {
            const btn = document.createElement("button");
            btn.className = "btn";
            btn.textContent = text;
            btn.disabled = disabled;
            if (highlight) {
                btn.classList.add("btn-primary");
                btn.style.backgroundColor = "#79afe2";
            }
            if (!disabled && typeof page === "number") {
                btn.onclick = () => onChange(page);
            }
            return btn;
        };

        const addEllipsis = () => {
            const span = document.createElement("span");
            span.textContent = "...";
            span.className = "ellipsis";
            container.appendChild(span);
        };

        container.appendChild(createBtn("« First", 1, currentPage === 1));
        container.appendChild(createBtn("‹ Prev", currentPage - 1, currentPage === 1));

        let pageRange = 1;

        container.appendChild(createBtn("1", 1, false, currentPage === 1));

        if (currentPage > pageRange + 2) {
            addEllipsis();
        }

        let startPage = Math.max(2, currentPage - pageRange);
        let endPage = Math.min(totalPages - 1, currentPage + pageRange);

        for (let i = startPage; i <= endPage; i++) {
            container.appendChild(createBtn(i, i, false, currentPage === i));
        }

        if (currentPage < totalPages - pageRange - 1) {
            addEllipsis();
        }

        if (totalPages > 1) {
            container.appendChild(createBtn(totalPages, totalPages, false, currentPage === totalPages));
        }

        container.appendChild(createBtn("Next ›", currentPage + 1, currentPage === totalPages));
        container.appendChild(createBtn("Last »", totalPages, currentPage === totalPages));
    }
};
