const previewContentUrl = "http://127.0.0.1/RealtorProject/backend/php/preview_get_data.php";
const numberOfHouses = 4;
let currentPage = 1;

let stateTextArray = [
    "House for rent",
    "House for sale",
    "Sale pending",
    "Sold",
    "Out of market"
];

let map;

function initMap() {
    map = L.map('map').setView([27.638497446, -80.387998448], 10);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    let marker = L.marker([27.638497446, -80.387998448]).addTo(map);
}



function createPreviewContent(housesArray) {
    let container = document.getElementById("houseListContainer");
    container.innerHTML = "";

    housesArray.forEach(function (house) {
        let property = document.createElement("div");
        property.className = "property";

        property.addEventListener("click", function () {
            window.location.href = `pop.html?house=${JSON.stringify(house)}`;
        });

        let picture = document.createElement("div");
        picture.className = "picture";

        let thumbnailPath = `http://127.0.0.1/RealtorProject/backend/houseThumbnail/${house.id}/thumbnail.jpg`;
        picture.style.backgroundImage = `url(${thumbnailPath})`;
        property.appendChild(picture);

        let price = document.createElement("div");
        price.className = "price";
        price.innerHTML = "$" + house.price;
        property.appendChild(price);

        let rooms = document.createElement("div");
        rooms.className = "rooms";
        rooms.innerHTML = house.number_of_rooms + " rooms";
        property.appendChild(rooms);

        let bathrooms = document.createElement("div");
        bathrooms.className = "bathrooms";
        bathrooms.innerHTML = house.number_of_bathrooms + " baths";
        property.appendChild(bathrooms);

        let areaSqFt = document.createElement("div");
        areaSqFt.className = "area";
        areaSqFt.innerHTML = house.area_sqft + " sqft";
        property.appendChild(areaSqFt);

        let state = document.createElement("div");
        state.className = "state";
        const stateIndex = parseInt(house.property_state);
        const stateText = stateTextArray[stateIndex] ?? "Unknown";
        state.innerText = stateText;
        property.appendChild(state);

        let street = document.createElement("div");
        street.className = "street";
        street.innerHTML = house.address_street;
        property.appendChild(street);

        let apartment = document.createElement("div");
        apartment.className = "apartment";
        apartment.innerHTML = house.address_apartment;
        property.appendChild(apartment);

        let city = document.createElement("div");
        city.className = "city";
        city.innerHTML = house.address_city;
        property.appendChild(city);

        let addressState = document.createElement("div");
        addressState.className = "addressState";
        addressState.innerHTML = house.address_state;
        property.appendChild(addressState);

        let zip = document.createElement("div");
        zip.className = "zip";
        zip.innerHTML = house.address_zip;
        property.appendChild(zip);

        container.appendChild(property);
    });
}

function getPreviewContent() {
    const startingPoint = (currentPage - 1) * numberOfHouses;

    $.ajax({
        url: previewContentUrl,
        method: "GET",
        data: { numberOfHouses: numberOfHouses, startingPoint: startingPoint },
        dataType: "json",
        success: function (data) {
            const totalRows = data.totalRows;
            const totalPages = Math.ceil(totalRows / numberOfHouses);

            console.log('Total rows in DB:', data.totalRows);

            createPreviewContent(data.houses);
            renderPaginationControls(totalPages);
        },
        error: function (xhr, status, error) {
            console.error("Error:", error);
            let container = document.getElementById("houseListContainer");
            container.innerHTML = "<p style='color:red;'>Failed to load properties.</p>";
        }
    });
}

function renderPaginationControls(totalPages) {
    const paginationControls = document.getElementById("paginationControls");
    paginationControls.innerHTML = "";

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
            btn.onclick = () => {
                currentPage = page;
                getPreviewContent();
            };
        }
        return btn;
    };

    paginationControls.appendChild(createBtn("« First", 1, currentPage === 1));
    paginationControls.appendChild(createBtn("‹ Prev", currentPage - 1, currentPage === 1));

    let addEllipsis = () => {
        let span = document.createElement("span");
        span.textContent = "...";
        span.className = "ellipsis";
        paginationControls.appendChild(span);
    };

    let pageRange = 1;

    paginationControls.appendChild(createBtn("1", 1, false, currentPage === 1));

    if (currentPage > pageRange + 2) {
        addEllipsis();
    }

    let startPage = Math.max(2, currentPage - pageRange);
    let endPage = Math.min(totalPages - 1, currentPage + pageRange);

    for (let i = startPage; i <= endPage; i++) {
        paginationControls.appendChild(createBtn(i, i, false, currentPage === i));
    }

    if (currentPage < totalPages - pageRange - 1) {
        addEllipsis();
    }

    if (totalPages > 1) {
        paginationControls.appendChild(createBtn(totalPages, totalPages, false, currentPage === totalPages));
    }

    paginationControls.appendChild(createBtn("Next ›", currentPage + 1, currentPage === totalPages));
    paginationControls.appendChild(createBtn("Last »", totalPages, currentPage === totalPages));

}


$(document).ready(function () {
    getPreviewContent();
    initMap();
});
