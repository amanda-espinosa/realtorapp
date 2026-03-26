const openCageKeyUrl = "../php/main.php?action=getOpenCageKey";

const MySQLDataType = {
    FLOAT: "float",
    DECIMAL: "decimal",
    DOUBLE: "double",
    INTEGER: "int",
    TINYINT: "tinyint",
    MEDIUMINT: "mediumint"
};

const HtmlTagName = {
    INPUT: "INPUT",
    SELECT: "SELECT",
    TEXTAREA: "TEXTAREA"
};

const InputType = {
    RADIO: "radio",
    NUMBER: "number",
    TEXT: "text",
    CHECKBOX: "checkbox"
};

const ColumnName = {
    PROPERTY_STATE: "property_state"
};

let house = null;
let propertyDefinition = [];

const stateTextArray = [
    "For Rent",
    "For Sale",
    "Sale Pending",
    "Sold",
    "Off Market"
];

async function getOpenCageLeafletKey() {
    return $.ajax({
        url: openCageKeyUrl,
        method: "GET",
        dataType: "text"
    });
}

async function getPropertyDefinition() {
    const propertyDefinitionUrl = "../php/main.php?action=propertyDefinition";
    try {
        const response = await fetch(propertyDefinitionUrl);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const result = await response.json();
        if (result.success) {
            return result.definition;
        } else {
            console.log("Fail to fetch propertyDefinition! Error: " + result.error);
        }

    } catch (error) {
        console.error(error.message);
        return [];
    }
}

window.addEventListener("DOMContentLoaded", init);

async function init() {
    let saveButton = document.getElementById("save");
    function getQueryParam(param) {
        let urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    propertyDefinition = await getPropertyDefinition();
    console.log(propertyDefinition);
    let houseString = getQueryParam("house");
    try {
        houseString = decodeURIComponent(houseString);
        console.log(houseString);
        house = JSON.parse(houseString);
    } catch (error) {
        console.error("Failed to parse house parameter:", error);
    }

    if (house.id.length > 0) {
        fetch(`../php/get_property_pictures.php?id=${house.id}`)
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

    }

    let editForm = document.getElementById("editForm");

    if (house) {
        let propertiesHouseObject = Object.getOwnPropertyNames(house);
        let columnNames = Object.fromEntries(
            propertiesHouseObject.map(name => [name, name])
        );

        for (let i = 0; i < propertiesHouseObject.length; i++) {
            let property = propertiesHouseObject[i];
            console.log(property + " = " + house[property]);
            console.log(propertyDefinition);
            let value = house[property];
            const definition = propertyDefinition.find(item => item.COLUMN_NAME === property);
            console.log(definition);

            let propertyElement = document.getElementById(property);
            if (propertyElement !== null) {
                if (propertyElement.dataset.previous_content === undefined) {
                    propertyElement.dataset.previous_content = propertyElement.value || propertyElement.innerText || "";
                }

                if (propertyElement.tagName === HtmlTagName.INPUT ||
                    propertyElement.tagName === HtmlTagName.SELECT ||
                    propertyElement.tagName === HtmlTagName.TEXTAREA) {
                    propertyElement.value = value;
                } else {
                    propertyElement.innerText = value;
                }

                if (property === ColumnName.PROPERTY_STATE) {
                    propertyElement.value = value;
                    propertyElement.dataset.previous_content = value;
                    continue;
                }

                if (propertyElement.tagName === HtmlTagName.INPUT &&
                    propertyElement.type === InputType.RADIO) {
                    if (propertyElement.value == value) {
                        propertyElement.checked = true;
                    }
                }

                if (definition.DATA_TYPE === MySQLDataType.FLOAT ||
                    definition.DATA_TYPE === MySQLDataType.DECIMAL ||
                    definition.DATA_TYPE === MySQLDataType.DOUBLE ||
                    definition.DATA_TYPE === MySQLDataType.INTEGER ||
                    definition.DATA_TYPE === MySQLDataType.MEDIUMINT) {
                    if (!isNaN(value)) {
                        propertyElement.value = value;
                        propertyElement.dataset.previous_content = value;
                    }

                    propertyElement.addEventListener('input', () => {
                        if (propertyElement.checkValidity()) {
                            if (propertyElement.value !== propertyElement.dataset.previous_content) {
                                house[property] = propertyElement.value;
                            }
                            console.log(house[property]);
                            console.log("form validity = " + editForm.checkValidity());
                        }
                        else {
                            console.log("input invaliiiiiiiiiiiiiiiiiiiid!");
                            console.log("form validity = " + editForm.checkValidity());
                        }
                        updateSaveButton();
                    });

                } else {
                    propertyElement.dataset.previous_content = value;

                    propertyElement.addEventListener('input', () => {
                        const text = propertyElement.value.trim();

                        if (propertyElement.checkValidity()) {
                            propertyElement.style.border = '';
                            console.log("TEXT => Is valid = " + propertyElement.checkValidity());

                            if (text !== propertyElement.dataset.previous_content) {
                                house[property] = text;
                            }
                        } else {
                            console.log("TEXT => Is valid = " + propertyElement.checkValidity());
                            propertyElement.style.border = '2px solid red';
                        }
                        console.log(house[property]);
                        updateSaveButton();
                    });
                }

                if (definition.DATA_TYPE === MySQLDataType.TINYINT) {
                    let radios = document.querySelectorAll(`input[name="${property}"]`);
                    radios.forEach(radio => {
                        radio.checked = (radio.value == value);

                        radio.addEventListener('change', () => {
                            house[property] = Number(radio.value);
                            updateSaveButton();
                        });
                    });
                    continue;
                }
            }
        }
        updateSaveButton();
    }

    console.log(saveButton);
    saveButton.addEventListener("click", e => {
        console.log("Click");
        e.stopPropagation();
        $.post(
            "../php/main.php?action=editProperty",
            { property: JSON.stringify(house) }
        ).done(resp => {
            let response = JSON.parse(resp);
            if (response.success) {
                console.log(response.message || response.data);
                alert("Property updated successfully!");
            } else {
                alert("failed: " + response.error);
            }
        }).fail(() => alert("Server error"));

        //TODO 
        /*Improve failure pop up warning (bootstrap)
        disable save button if needed
        */
    });

    let map;

    async function initMap() {
        const lat = Number(house.latitude);
        const lng = Number(house.longitude);

        map = L.map('map');

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap'
        }).addTo(map);

        if (Number.isFinite(lat) && Number.isFinite(lng)) {
            map.setView([lat, lng], 11);
            L.marker([lat, lng])
                .addTo(map)
                .bindPopup(`<b>${house.address_street}</b><br>${house.address_city}`);
        } else {
            const fullAddress = `${house.address_street} ${house.address_apartment}, ${house.address_city}, ${house.address_state}, ${house.address_zip}`;

            try {
                const apiKey = (await getOpenCageLeafletKey()).trim();

                const url = `https://api.opencagedata.com/geocode/v1/json` +
                    `?q=${encodeURIComponent(fullAddress)}` +
                    `&key=${encodeURIComponent(apiKey)}` +
                    `&no_annotations=1`;

                const resp = await fetch(url);
                if (!resp.ok) throw new Error(`Geocoding failed: ${resp.status}`);
                const data = await resp.json();

                if (!data.results || data.results.length === 0) {
                    console.warn('No geocoding results for:', fullAddress);
                    map.setView([27.75, -80.47], 10);
                    return;
                }

                const { lat: gLat, lng: gLng } = data.results[0].geometry;

                map.setView([gLat, gLng], 11);
                L.marker([gLat, gLng])
                    .addTo(map)
                    .bindPopup(`<b>${house.address_street}</b><br>${house.address_city}`);

                await $.post("../php/update_coordinates.php", {
                    id: house.id,
                    latitude: gLat,
                    longitude: gLng
                });
                console.log("Coordinates saved for house ID:", house.id);

            } catch (err) {
                console.error('Geocoding error:', err);
                map.setView([27.75, -80.47], 10);
            }
        }

        map.once('load', () => {
            setTimeout(() => map.invalidateSize(), 0);
        });
    }

    initMap();
    setTimeout(() => {
        map.invalidateSize();
    }, 200);
}

function updateSaveButton() {
    let editForm = document.getElementById("editForm");
    //$("#save").prop("disabled", !$("#editForm")[0].checkValidity());
    if (editForm.checkValidity()) {
        $("#save").removeAttr("disabled");
    } else {
        $("#save").attr("disabled", "disabled");
    }
}