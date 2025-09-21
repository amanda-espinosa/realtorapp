window.realtorapp = window.realtorapp || {};
const { getOpenCageLeafletKey } = window.realtorapp.api;

const previewContentUrl = "../php/list_properties.php";
const numberOfHouses = 8;
let currentPage = 1;

let stateTextArray = [
    "House for rent",
    "House for sale",
    "Sale pending",
    "Sold",
    "Out of market"
];

const FL_BOUNDS = { minLat: 24.3, maxLat: 31.1, minLng: -87.7, maxLng: -79.8 };
const OPEN_CAGE_KEY = getOpenCageLeafletKey();

function formatAddress(house) {
    const parts = [
        house.address_street,
        house.address_apartment,
        house.address_city,
        house.address_state,
        house.address_zip
    ].map(v => (v == null ? "" : v.trim()))
        .filter(Boolean);

    return parts.join(", ");
}

function isValidCoords(lat, lng) {
    const la = Number(lat), ln = Number(lng);
    if (!Number.isFinite(la) || !Number.isFinite(ln)) return false;
    return la >= FL_BOUNDS.minLat && la <= FL_BOUNDS.maxLat &&
        ln >= FL_BOUNDS.minLng && ln <= FL_BOUNDS.maxLng;
}

async function geocodeAddress(address) {
    const url = 'https://api.opencagedata.com/geocode/v1/json'
        + '?q=' + encodeURIComponent(address)
        + '&key=' + OPEN_CAGE_KEY
        + '&no_annotations=1';

    const res = await fetch(url);
    const data = await res.json();

    if (!data.results || !data.results[0]) {
        throw new Error('No geocode results');
    }
    const g = data.results[0].geometry;
    return { lat: g.lat, lng: g.lng };
}

async function putMarkerOrGeocode(house) {
    let lat = house.latitude, lng = house.longitude;

    if (isValidCoords(lat, lng)) {
        L.marker([Number(lat), Number(lng)])
            .addTo(map)
            .bindPopup(`<b>${house.address_street}</b><br>${house.address_city}`);
        return;
    }

    const fullAddress = formatAddress(house);
    if (!fullAddress) {
        console.warn('Missing address parts; cannot geocode for id:', house.id);
        return;
    }

    try {
        const { lat: gLat, lng: gLng } = await geocodeAddress(fullAddress);

        if (isValidCoords(gLat, gLng)) {
            L.marker([gLat, gLng])
                .addTo(map)
                .bindPopup(`<b>${house.address_street}</b><br>${house.address_city}`);

            $.post("../php/update_coordinates.php", {
                id: house.id,
                latitude: gLat,
                longitude: gLng
            }).then(() => {
                console.log("Coordinates saved for house ID:", house.id);
            }).catch(() => {
                console.warn("Could not save coords for house ID:", house.id);
            });
        } else {
            console.warn('Geocoded coords out of FL bounds for id:', house.id, gLat, gLng);
        }
    } catch (err) {
        console.error('Geocoding error for id:', house.id, err);
    }
}


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
        let propertyContainer = document.createElement("div");
        propertyContainer.className = "property";
        propertyContainer.addEventListener("click", function () {
            window.location.href = `property_manager.html?house=${JSON.stringify(house)}`;
        });

        let picture = document.createElement("div");
        picture.className = "picture";

        let thumbnailPath = `../houseThumbnail/${house.id}/thumbnail.jpg`;
        picture.style.backgroundImage = `url(${thumbnailPath})`;
        propertyContainer.appendChild(picture);

        let mainInfoContainer = document.createElement("div");
        mainInfoContainer.className = "mainInfoContainer";
        propertyContainer.appendChild(mainInfoContainer);

        let propertyTextContainer = document.createElement("div");
        propertyTextContainer.className = "propertyTextContainer";
        mainInfoContainer.appendChild(propertyTextContainer);

        let buttonsContainer = document.createElement("div");
        buttonsContainer.className = "buttonsContainer";
        mainInfoContainer.appendChild(buttonsContainer);

        let editButton = document.createElement("button");
        editButton.className = "editButton";
        buttonsContainer.appendChild(editButton);

        let editIcon = document.createElement("img");
        editIcon.className = "editIcon";
        editIcon.src = "../../frontend/img/edit.png";
        editIcon.alt = "edit";
        editButton.appendChild(editIcon);

        let deleteButton = document.createElement("button");
        deleteButton.className = "deleteButton";
        buttonsContainer.appendChild(deleteButton);

        deleteButton.addEventListener("click", e => {
            e.stopPropagation();
            if (!confirm("Really delete this property?")) return;
            $.post(
                "../php/delete_property.php",
                { id: house.id }
            )
                .done(resp => {
                    if (resp.success) {
                        property.remove();
                    } else {
                        alert("Delete failed: " + resp.error);
                    }
                })
                .fail(() => alert("Server error on delete"));
        });

        let deleteIcon = document.createElement("img");
        deleteIcon.className = "deleteIcon";
        deleteIcon.src = "../../frontend/img/delete.png";
        deleteIcon.alt = "delete";
        deleteButton.appendChild(deleteIcon);

        let houseMainInfo = document.createElement("div");
        houseMainInfo.className = "houseMainInfo";
        propertyTextContainer.appendChild(houseMainInfo);

        let price = document.createElement("div");
        price.className = "price";
        price.innerHTML = "$" + house.price;
        houseMainInfo.appendChild(price);

        let state = document.createElement("div");
        state.className = "state";
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

        houseAddress.textContent = formatAddress(house);

        putMarkerOrGeocode(house);
        container.appendChild(propertyContainer);
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
            propertyCollection = data.houses;
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

function displayAddPropertyContainer() {
    let addProperty = document.getElementById("addProperty");

    let addPropertyButton = document.createElement("button");
    addPropertyButton.className = "addPropertyButton";
    addPropertyButton.innerHTML = "+ add Property";
    addProperty.appendChild(addPropertyButton);
}

$(document).ready(function () {
    getPreviewContent();
    initMap();
    displayAddPropertyContainer();
});