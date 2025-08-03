const stateTextArray = [
    "For Rent",
    "For Sale",
    "Sale Pending",
    "Sold",
    "Off Market"
];

window.addEventListener("DOMContentLoaded", init);
function init() {
    //const url = window.location.href;

    //Property section
    function getQueryParam(param) {
        let urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    let houseString = getQueryParam("house");
    let house = JSON.parse(houseString);

    fetch(`http://127.0.0.1/RealtorProject/backend/php/get_property_pictures.php?id=${house.id}`)
        .then(response => response.json())
        .then(images => {

            if (images.length > 0) {
                const mainPhotoContainer = document.getElementById("mainPhotoContainer");
                const galleryRight = document.getElementById("galleryRight");

                mainPhotoContainer.innerHTML = "";
                galleryRight.innerHTML = "";

                const mainPhoto = document.createElement("a");
                mainPhoto.id = "mainPhoto";
                mainPhoto.setAttribute("href", images[0]);
                mainPhoto.setAttribute("data-fancybox", "gallery");
                mainPhoto.setAttribute("data-caption", "Main House Image");

                const mainImg = document.createElement("img");
                mainImg.src = images[0];
                mainImg.alt = "Main Image";
                mainPhoto.appendChild(mainImg);
                mainPhotoContainer.appendChild(mainPhoto);

                images.forEach((src, index) => {
                    const anchor = document.createElement("a");
                    anchor.setAttribute("href", src);
                    anchor.setAttribute("data-fancybox", "gallery");

                    const img = document.createElement("img");
                    img.setAttribute("src", src);
                    img.setAttribute("alt", "");
                    anchor.appendChild(img);

                    if (index < 4) {
                        const rightPicsDiv = document.createElement("div");
                        rightPicsDiv.className = index === 3 ? "homePicsMore" : "homePics";

                        if (index === 3 && images.length > 4) {
                            const overlay = document.createElement("div");
                            overlay.className = "overlay";
                            overlay.textContent = `+${images.length - 4}`;
                            anchor.appendChild(overlay);
                        }

                        rightPicsDiv.appendChild(anchor);
                        galleryRight.appendChild(rightPicsDiv);
                    } else {
                        anchor.style.display = "none";
                        document.body.appendChild(anchor);
                    }
                });
            }
        });

    if (house) {
        //updateShareLinks(house.id);

        let propertiesHouseObject = Object.getOwnPropertyNames(house);

        for (let i = 0; i < propertiesHouseObject.length; i++) {
            let property = propertiesHouseObject[i];
            let value = house[property];
            let propertyElement = document.getElementById(property);
            if (propertyElement !== null) {
                propertyElement.innerHTML = value;
            }
        }

        $.post("http://127.0.0.1/RealtorProject/backend/php/increment_views.php", {
            id: house.id
        }).then(response => {
            console.log("View count incremented:", response);
        }).catch(error => {
            console.error("Failed to update views:", error);
        });

        const stateIndex = parseInt(house.property_state);
        const stateText = stateTextArray[stateIndex] ?? "Unknown";
        document.getElementById("property_state").innerText = stateText;
    }

    let map;

    function initMap() {
        map = L.map('map').setView([house.latitude, house.longitude], 11);

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap'
        }).addTo(map);

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
    }
    initMap();
    setTimeout(() => {
        map.invalidateSize();
    }, 200);

}
/*
function updateShareLinks(houseId) {
    const url = `http://127.0.0.1:5501/RealtorProject/frontend/html/pop.html?id=${houseId}`; // Adjust if deployed

    document.getElementById("facebook-share").href =
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;

    document.getElementById("whatsapp-share").href =
        `https://api.whatsapp.com/send?text=${encodeURIComponent("Check out this property: " + url)}`;

    document.getElementById("email-share").href =
        `mailto:?subject=Awesome Property&body=Look at this property I found: ${encodeURIComponent(url)}`;
}
*/
