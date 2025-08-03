const previewContentUrl = "http://127.0.0.1/RealtorProject/backend/php/preview_get_data.php";
const numberOfHouses = 8;
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
    map = L.map('map').setView([26.7153, -80.0534], 8);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap'
    }).addTo(map);
}


function createPreviewContent(housesArray) {
    let container = document.getElementById("houseListContainer");
    container.innerHTML = "";

    housesArray.forEach(function (house) {
        let property = document.createElement("div");
        property.className = "property";

        property.addEventListener("click", function () {
            window.location.href = `manage_pop.html?house=${JSON.stringify(house)}`;
        });

        let picture = document.createElement("div");
        picture.className = "picture";

        let thumbnailPath = `http://127.0.0.1/RealtorProject/backend/houseThumbnail/${house.id}/thumbnail.jpg`;
        picture.style.backgroundImage = `url(${thumbnailPath})`;
        property.appendChild(picture);

        let infoContainer = document.createElement("div");
        infoContainer.className = "infoContainer";
        infoContainer.classList.add("row");
        property.appendChild(infoContainer);

        let propertyTextContainer = document.createElement("div");
        propertyTextContainer.className = "propertyTextContainer";
        propertyTextContainer.classList.add("col-10");
        infoContainer.appendChild(propertyTextContainer);

        let buttonsContainer = document.createElement("div");
        buttonsContainer.className = "buttonsContainer";
        buttonsContainer.classList.add("col-2", "d-flex", "flex-column", "align-items-center", "gap-1");
        infoContainer.appendChild(buttonsContainer);

        let editButton = document.createElement("button");
        editButton.className = "editButton";
        buttonsContainer.appendChild(editButton);

        let editIcon = document.createElement("img");
        editIcon.className = "editIcon";
        editIcon.src = "/RealtorProject/frontend/img/edit.png";
        editIcon.alt = "edit";
        editButton.appendChild(editIcon);

        let deleteButton = document.createElement("button");
        deleteButton.className = "deleteButton";
        buttonsContainer.appendChild(deleteButton);

        deleteButton.addEventListener("click", e => {
            e.stopPropagation();    // ← prevent the card’s click from also firing
            // 1) Ask the user to confirm
            if (!confirm("Really delete this property?")) return;

            // 2) Send an AJAX POST to your delete endpoint, passing the property’s ID
            $.post(
                "http://127.0.0.1/RealtorProject/backend/php/delete_property.php",
                { id: house.id }
            )
                // 3) If the call succeeds (HTTP 200), jQuery runs this callback with `resp` = parsed JSON
                .done(resp => {
                    if (resp.success) {
                        // 4a) On success: remove that property card from the page
                        property.remove();
                    } else {
                        // 4b) On your script returning success=false: show an error
                        alert("Delete failed: " + resp.error);
                    }
                })
                // 5) If the HTTP request itself fails (network/server error), show a generic error
                .fail(() => alert("Server error on delete"));
        });


        let deleteIcon = document.createElement("img");
        deleteIcon.className = "deleteIcon";
        deleteIcon.src = "/RealtorProject/frontend/img/delete.png";
        deleteIcon.alt = "delete";
        deleteButton.appendChild(deleteIcon);

        let houseMainInfo = document.createElement("div");
        houseMainInfo.className = "houseMainInfo";
        houseMainInfo.classList.add("gap-4");
        propertyTextContainer.appendChild(houseMainInfo);

        let price = document.createElement("div");
        price.classList.add("price");
        price.innerHTML = "$" + house.price;
        houseMainInfo.appendChild(price);

        let state = document.createElement("div");
        state.classList.add("state");
        const stateIndex = parseInt(house.property_state);
        const stateText = stateTextArray[stateIndex] ?? "Unknown";
        state.innerText = stateText;
        houseMainInfo.appendChild(state);

        let houseArea = document.createElement("div");
        houseArea.className = "houseArea";
        propertyTextContainer.appendChild(houseArea);

        let rooms = document.createElement("div");
        rooms.className = "rooms";
        houseArea.appendChild(rooms);

        let bathrooms = document.createElement("div");
        bathrooms.className = "bathrooms";
        houseArea.appendChild(bathrooms);

        let areaSqFt = document.createElement("div");
        areaSqFt.className = "areaSqFt";
        houseArea.appendChild(areaSqFt);

        houseArea.innerHTML = house.number_of_rooms + " rooms" + " | " + house.number_of_bathrooms + " baths" + " | " + house.area_sqft + " sqft";

        let houseAddress = document.createElement("div");
        houseAddress.className = "houseAddress";
        propertyTextContainer.appendChild(houseAddress);

        let street = document.createElement("div");
        street.className = "street";
        houseAddress.appendChild(street);

        let apartment = document.createElement("div");
        apartment.className = "apartment";
        houseAddress.appendChild(apartment);

        let city = document.createElement("div");
        city.className = "city";
        houseAddress.appendChild(city);

        let addressState = document.createElement("div");
        addressState.className = "addressState";
        houseAddress.appendChild(addressState);

        let zip = document.createElement("div");
        zip.className = "zip";
        houseAddress.appendChild(zip);

        houseAddress.innerHTML = house.address_street + ", " + house.address_apartment + "  " + house.address_city + ", " + house.address_state + ", " + house.address_zip;

        //geocoding
        if (house.latitude && house.longitude) {
            L.marker([house.latitude, house.longitude])
                .addTo(map)
                .bindPopup(`<b>${house.address_street}</b><br>${house.address_city}`);
        } else {
            let fullAddress = `${house.address_street} ${house.address_apartment}, ${house.address_city}, ${house.address_state}, ${house.address_zip}`;

            let api_key = '7df2980db5ee44cb86683f9b54a13371';

            let request_url = 'https://api.opencagedata.com/geocode/v1/json'
                + '?q=' + encodeURIComponent(fullAddress)
                + '&key=' + api_key
                + '&no_annotations=1';

            fetch(request_url)
                .then(response => response.json())
                .then(data => {
                    const coords = data.results[0].geometry;

                    L.marker([coords.lat, coords.lng])
                        .addTo(map)
                        .bindPopup(`<b>${house.address_street}</b><br>${house.address_city}`);

                    $.post("http://127.0.0.1/RealtorProject/backend/php/update_coordinates.php", {
                        id: house.id,
                        latitude: coords.lat,
                        longitude: coords.lng
                    }).then(() => {
                        console.log("coordinates saved for house ID: ", house.id);
                    });
                })
                .catch(err => console.error('Geocoding error:', err));
        }

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

function addProperty() {
    let addProperty = document.getElementById("addProperty");

    let addPropertyButton = document.createElement("button");
    addPropertyButton.className = "addPropertyButton";
    addProperty.appendChild(addPropertyButton);

    addPropertyButton.textContent = " ";

    let plusSymbol = document.createElement("span");
    plusSymbol.textContent = "+";

    let label = document.createElement("p");
    label.className = "addPropertyLabel";
    label.textContent = "add property";

    addPropertyButton.append(plusSymbol, label);
}

$(document).ready(function () {
    getPreviewContent();
    initMap();
    addProperty();
});
