(function () {
    window.realtorapp = window.realtorapp || {};

    const { numberOfHouses, getPreviewContent } = window.realtorapp.api;
    const { renderPaginationControls } = window.realtorapp.pagination;
    const { initMap, clearMarkers, putMarkerOrGeocode } = window.realtorapp.map;

    let currentPage = 1;

    function formatAddress(house) {
        return [house.address_street, house.address_apartment, house.address_city, house.address_state, house.address_zip]
            .map(v => (v == null ? "" : String(v).trim()))
            .filter(Boolean)
            .join(", ");
    }

    function createPreviewContent(housesArray) {
        const container = document.getElementById("houseListContainer");
        container.innerHTML = "";

        clearMarkers();

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
            price.textContent = "$" + house.price;
            houseMainInfo.appendChild(price);

            const state = document.createElement("div");
            state.className = "state";
            const stateIndex = parseInt(house.property_state);
            const stateText = ["House for rent", "House for sale", "Sale pending", "Sold", "Out of market"][stateIndex] ?? "Unknown";
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

            // Ask the map module to handle marker/geocode
            putMarkerOrGeocode(house, formatAddress);

            container.appendChild(propertyContainer);
        });
    }

    function loadPage() {
        getPreviewContent(currentPage)
            .done(function (data) {
                const totalRows = Number(data.totalRows || 0);
                const totalPages = Math.max(1, Math.ceil(totalRows / numberOfHouses));

                createPreviewContent(data.houses || []);

                renderPaginationControls({
                    container: document.getElementById("paginationControls"),
                    currentPage,
                    totalPages,
                    onChange: function (page) {
                        currentPage = page;
                        loadPage();
                    }
                });
            })
            .fail(function (_xhr, _status, error) {
                console.error("Error:", error);
                document.getElementById("houseListContainer").innerHTML =
                    "<p style='color:red;'>Failed to load properties.</p>";
            });
    }

    $(document).ready(function () {
        initMap('map');
        loadPage();
    });
})();