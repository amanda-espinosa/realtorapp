let currentPage = 1;
const openCageKeyUrl = "../../backend/php/main.php?action=getOpenCageKey";

function formatAddress(house) {
    return [house.address_street, house.address_apartment, house.address_city, house.address_state, house.address_zip]
        .map(v => (v == null ? "" : String(v).trim()))
        .filter(Boolean)
        .join(", ");
}

async function getOpenCageLeafletKey() {
    const res = await fetch(openCageKeyUrl);
    return res.text();
}

function createPreviewContent(housesArray) {
    const container = document.getElementById("houseListContainer");
    container.innerHTML = "";
    try {
        realtorapp.map.clearMarkers();
    } catch (err) {
        console.log(`An error has occurred: ${err.message}`);
    }

    housesArray.forEach(function (house) {
        const propertyContainer = document.createElement("div");
        propertyContainer.className = "property";

        propertyContainer.addEventListener("click", function () {
            const propertyData = encodeURIComponent(JSON.stringify(house));
            window.location.href = `property_view.html?house=${propertyData}`;
        });

        const picture = document.createElement("div");
        picture.className = "picture";
        const thumbnailPath = `../../backend/houseThumbnail/${house.id}/thumbnail.jpg`;
        picture.style.backgroundImage = `url(${thumbnailPath})`;
        propertyContainer.appendChild(picture);

        const propertyTextContainer = document.createElement("div");
        propertyTextContainer.className = "propertyTextContainer";
        propertyContainer.appendChild(propertyTextContainer);

        const houseMainInfo = document.createElement("div");
        houseMainInfo.className = "houseMainInfo";
        propertyTextContainer.appendChild(houseMainInfo);

        const price = document.createElement("div");
        price.className = "price";
        price.textContent = "$" + parseFloat(house.price).toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        });
        houseMainInfo.appendChild(price);

        const state = document.createElement("div");
        state.className = "state";
        const stateIndex = parseInt(house.property_state);
        const stateText = realtorapp.propertyStatusString[stateIndex] ?? "Unknown";
        state.innerText = stateText;
        houseMainInfo.appendChild(state);

        const houseArea = document.createElement("div");
        houseArea.className = "houseArea";
        houseArea.textContent = `${house.number_of_rooms} rooms | ${house.number_of_bathrooms} baths | ${house.area_sqft} sqft`;
        propertyTextContainer.appendChild(houseArea);

        const houseAddress = document.createElement("div");
        houseAddress.className = "houseAddress";
        houseAddress.textContent = formatAddress(house);
        propertyTextContainer.appendChild(houseAddress);

        try {
            realtorapp.map.putMarkerOrGeocode(house, formatAddress);
        } catch (err) {
            console.log(`An error has occurred: ${err.message}`);
        }

        container.appendChild(propertyContainer);
    });
}

async function loadPage() {
    try {
        const res = await fetch(`../../backend/php/main.php?action=getPropertyList&numberOfHouses=${realtorapp.api.numberOfHouses}&startingPoint=${(currentPage - 1) * realtorapp.api.numberOfHouses}`);

        const data = await res.json();

        console.log("DATA: ", data);

        const totalRows = Number(data.totalRows || 0);
        const totalPages = Math.max(1, Math.ceil(totalRows / realtorapp.api.numberOfHouses));

        createPreviewContent(data.houses || []);

        realtorapp.pagination.renderPaginationControls({
            container: document.getElementById("paginationControls"),
            currentPage,
            totalPages,
            onChange: function (page) {
                currentPage = page;
                loadPage();
            }
        });
    } catch (error) {
        console.error("Error:", error);
        document.getElementById("houseListContainer").innerHTML =
            "<p style='color:red;'>Failed to load properties.</p>";
    }
}

$(document).ready(async function () {
    loadPage();
    await realtorapp.map.initMap('map');
});