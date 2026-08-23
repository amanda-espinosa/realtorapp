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

const openCageKeyUrl = "../php/main.php?action=getOpenCageKey";

const MySQLDataType = {
  FLOAT: "float",
  DECIMAL: "decimal",
  DOUBLE: "double",
  INTEGER: "int",
  TINYINT: "tinyint",
  MEDIUMINT: "mediumint",
  YEAR: "year",
};

const HtmlTagName = {
  INPUT: "INPUT",
  SELECT: "SELECT",
  TEXTAREA: "TEXTAREA",
};

const InputType = {
  RADIO: "radio",
  NUMBER: "number",
  TEXT: "text",
  CHECKBOX: "checkbox",
};

const ColumnName = {
  PRICE: "price",
  NUMBER_OF_ROOMS: "number_of_rooms",
  NUMBER_OF_BATHROOMS: "number_of_bathrooms",
  AREA_SQFT: "area_sqft",
  PROPERTY_STATE: "property_state",
  ADDRESS_STREET: "address_street",
  ADDRESS_APARTMENT: "address_apartment",
  ADDRESS_CITY: "address_city",
  ADDRESS_STATE: "address_state",
  ADDRESS_ZIP: "address_zip",
  DESCRIPTION: "description",
  HEATING_TYPE: "heating_type",
  COOLING_TYPE: "cooling_type",
  APPLIANCES: "appliances",
  FLOORING_TYPE: "flooring_type",
  BASEMENT: "basement",
  FIREPLACE: "fireplace",
  LEVELS: "levels",
  PARCEL_NUMBER: "parcel_number",
  SPECIAL_CONDITIONS: "special_conditions",
  SIZE_LOT: "size_lot",
  PRICE_PER_SQUAREFEET: "price_per_squarefeet",
  BUILT_IN_YEAR: "built_in_year",
  HOME_TYPE: "home_type",
  MATERIALS: "materials",
  SEWER_TYPE: "sewer_type",
  WATER_TYPE: "water_type",
  HOA_COST: "hoa_cost",
  LATITUDE: "latitude",
  LONGITUDE: "longitude",
};

let house = null;
let propertyDefinition = [];

let pond = null;
let originalImageSources = [];

const stateTextArray = [
  "For Rent",
  "For Sale",
  "Sale Pending",
  "Sold",
  "Off Market",
];

let gallery = document.getElementById("gallery");

function SetNumberElementsById(id, value) {
  let propertyElement = document.getElementById(id);
  if (!isNaN(value)) {
    propertyElement.value = value;
    propertyElement.dataset.previous_content = value;
  }

  propertyElement.addEventListener("input", () => {
    if (propertyElement.checkValidity()) {
      propertyElement.style.border = "";
      if (propertyElement.value !== propertyElement.dataset.previous_content) {
        house[id] = propertyElement.value;
        propertyElement.dataset.previous_content = value;
      }
    } else {
      propertyElement.style.border = "2px solid red";
    }
  });
}

function SetRadioElementsByName(name, value) {
  let radios = document.querySelectorAll('input[name="' + name + '"]');
  radios.forEach((radio) => {
    if (radio.id == "basementTrue" || radio.id == "fireplaceTrue") {
      radio.checked = value == "1" ? true : false;
    } else if (radio.id == "basementFalse" || radio.id == "fireplaceFalse") {
      radio.checked = value == "0" ? true : false;
    }

    radio.addEventListener("change", function () {
      house[property] = this.value;
    });
  });
}

function SetSelectElementsById(id, value) {
  let propertyElement = document.getElementById(id);
  propertyElement.value = value;
  propertyElement.addEventListener("change", function () {
    house[id] = this.value;
  });
}

function SetTextElementsById(id, value) {
  let propertyElement = document.getElementById(id);
  propertyElement.value = value;
  propertyElement.dataset.previous_content = value;

  propertyElement.addEventListener("input", () => {
    let text = propertyElement.value.trim();

    if (propertyElement.checkValidity()) {
      propertyElement.style.border = "";
      if (text !== propertyElement.dataset.previous_content) {
        house[id] = text;
      }
    } else {
      propertyElement.style.border = "2px solid red";
    }
  });
}

async function getOpenCageLeafletKey() {
  return $.ajax({
    url: openCageKeyUrl,
    method: "GET",
    dataType: "text",
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
      showNotification(
        `Fail to fetch propertyDefinition! Error: ${result.error}`,
        "danger",
      );
    }
  } catch (error) {
    showNotification(`${result.error}`, "danger");
    return [];
  }
}

//Bootstrap Notifications

function hideMsg(id) {
  let el = document.getElementById(id);
  el.textContent = "";
  el.classList.add("d-none");
}

function showNotification(message, type = "success") {
  let el = document.getElementById("notification");

  el.classList.remove(
    "d-none",
    "alert-success",
    "alert-danger",
    "alert-warning",
    "alert-info",
    "alert-primary",
    "alert-secondary",
    "alert-light",
    "alert-dark",
  );

  el.classList.add("alert", `alert-${type}`);
  el.textContent = message;

  setTimeout(() => hideMsg("notification"), 3000);
}

function bootstrapConfirm(message, options = {}) {
  const title = options.title ?? "Confirm";
  const okText = options.okText ?? "OK";
  const cancelText = options.cancelText ?? "Cancel";

  const modalEl = document.getElementById("confirmModal");
  const modal = bootstrap.Modal.getOrCreateInstance(modalEl);

  document.getElementById("confirmTitle").textContent = title;
  document.getElementById("confirmBody").textContent = message;

  const okBtn = document.getElementById("confirmOk");
  const cancelBtn = document.getElementById("confirmCancel");

  okBtn.textContent = okText;
  cancelBtn.textContent = cancelText;

  return new Promise((resolve) => {
    const cleanup = () => {
      okBtn.removeEventListener("click", onOk);
      modalEl.removeEventListener("hidden.bs.modal", onHidden);
    };

    const onOk = () => {
      cleanup();
      modal.hide();
      resolve(true);
    };

    const onHidden = () => {
      cleanup();
      resolve(false);
    };

    okBtn.addEventListener("click", onOk, { once: true });
    modalEl.addEventListener("hidden.bs.modal", onHidden, { once: true });

    modal.show();
  });
}

window.addEventListener("DOMContentLoaded", init);

async function init() {
  let editForm = document.getElementById("editForm");
  let saveButton = document.getElementById("save");

  const requiredInputs = editForm.querySelectorAll("input[required]");
  requiredInputs.forEach((input) => {
    input.addEventListener("input", updateSaveButton);
  });

  const requiredSelects = editForm.querySelectorAll("select[required]");
  requiredSelects.forEach((select) => {
    select.addEventListener("change", updateSaveButton);
  });

  updateSaveButton();

  function getQueryParam(param) {
    let urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  }

  propertyDefinition = await getPropertyDefinition();
  let houseString = getQueryParam("house");
  try {
    houseString = decodeURIComponent(houseString);
    house = JSON.parse(houseString);
  } catch (error) {
    console.error("Failed to parse house parameter:", error);
  }

  saveButton.addEventListener("click", async (e) => {
    e.stopPropagation();

    if (!house) {
      showNotification("Invalid property data", "danger");
      return;
    }

    const url =
      house.id.length == 0
        ? "../php/main.php?action=createProperty"
        : "../php/main.php?action=editProperty";

    const formData = new FormData();

    formData.append("property", JSON.stringify(house));

    pond.getFiles().forEach((fileItem) => {
      formData.append("images[]", fileItem.file, fileItem.filename);
    });

    try {
      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });

      const resp = await response.json();

      if (resp.success) {
        console.log(resp.message || resp.data);

        if (resp.inserted_id) {
          house.id = resp.inserted_id;
        }

        showNotification("Property saved successfully!", "success");
      } else {
        showNotification(
          `Error saving property ${resp.error || resp.message}`,
          "danger",
        );
      }
    } catch (error) {
      console.error(error);
      showNotification("Server error", "danger");
    }
  });

  if (house) {
    let propertiesHouseObject = Object.getOwnPropertyNames(house);
    let columnNames = Object.fromEntries(
      propertiesHouseObject.map((name) => [name, name]),
    );

    for (let i = 0; i < propertiesHouseObject.length; i++) {
      let property = propertiesHouseObject[i];
      let value = house[property];
      let definition = propertyDefinition.find(
        (item) => item.COLUMN_NAME === property,
      );
      if (!definition) continue;

      switch (property) {
        case ColumnName.PROPERTY_STATE:
          SetSelectElementsById(property, value);
          break;
        case ColumnName.BASEMENT:
          SetRadioElementsByName(ColumnName.BASEMENT, value);
          break;
        case ColumnName.FIREPLACE:
          SetRadioElementsByName(ColumnName.FIREPLACE, value);
          break;
        case ColumnName.PRICE:
        case ColumnName.NUMBER_OF_ROOMS:
        case ColumnName.NUMBER_OF_BATHROOMS:
        case ColumnName.AREA_SQFT:
        case ColumnName.ADDRESS_ZIP:
        case ColumnName.LEVELS:
        case ColumnName.SIZE_LOT:
        case ColumnName.PRICE_PER_SQUAREFEET:
        case ColumnName.BUILT_IN_YEAR:
        case ColumnName.HOA_COST:
          SetNumberElementsById(property, value);
          break;
        case ColumnName.ADDRESS_STREET:
        case ColumnName.ADDRESS_APARTMENT:
        case ColumnName.ADDRESS_CITY:
        case ColumnName.ADDRESS_STATE:
        case ColumnName.DESCRIPTION:
        case ColumnName.HEATING_TYPE:
        case ColumnName.COOLING_TYPE:
        case ColumnName.APPLIANCES:
        case ColumnName.FLOORING_TYPE:
        case ColumnName.PARCEL_NUMBER:
        case ColumnName.SPECIAL_CONDITIONS:
        case ColumnName.HOME_TYPE:
        case ColumnName.MATERIALS:
        case ColumnName.SEWER_TYPE:
        case ColumnName.WATER_TYPE:
          SetTextElementsById(property, value);
          break;
        default:
          console.log(`property name not found ${property}`);
      }
    }

    FilePond.registerPlugin(
      FilePondPluginImagePreview,
      FilePondPluginFileValidateSize,
    );

    pond = FilePond.create(document.querySelector(".filepond"), {
      instantUpload: false,
      allowMultiple: true,

      maxFiles: 50,
      maxTotalFileSize: "100MB",

      labelMaxTotalFileSizeExceeded:
        "The total size of all images cannot exceed 100 MB",
      labelMaxTotalFileSize: "Maximum total size is {filesize}",
      labelMaxFileSizeExceeded: "This image is too large",

      server: {
        load: (source, load, error) => {
          fetch(source)
            .then((res) => {
              if (!res.ok) throw new Error("Image not found");
              return res.blob();
            })
            .then(load)
            .catch(error);
        },
      },
    });

    pond.on("addfile", updateSaveButton);
    pond.on("removefile", updateSaveButton);
    pond.on("reorderfiles", updateSaveButton);

    if (house.id && house.id.length > 0) {
      fetch(
        `../../backend/php/main.php?action=getPropertyImages&id=${house.id}`,
      )
        .then((res) => res.json())
        .then((images) => {
          originalImageSources = images.map((src) => String(src));

          pond.addFiles(
            images.map((src) => ({
              source: src,
              options: {
                type: "local",
              },
            })),
          );

          updateSaveButton();
        });
    }
  }

  let map;

  async function initMap() {
    const lat = Number(house.latitude);
    const lng = Number(house.longitude);

    map = L.map("map");

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap",
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

        const url =
          `https://api.opencagedata.com/geocode/v1/json` +
          `?q=${encodeURIComponent(fullAddress)}` +
          `&key=${encodeURIComponent(apiKey)}` +
          `&no_annotations=1`;

        const resp = await fetch(url);
        if (!resp.ok) throw new Error(`Geocoding failed: ${resp.status}`);
        const data = await resp.json();

        if (!data.results || data.results.length === 0) {
          console.warn("No geocoding results for:", fullAddress);
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
          longitude: gLng,
        });
        showNotification(
          `Coordinates saved for house ID: ${house.id}`,
          "success",
        );
      } catch (err) {
        showNotification(`Geocoding error: ${err}`, "danger");
        map.setView([27.75, -80.47], 10);
      }
    }

    map.once("load", () => {
      setTimeout(() => map.invalidateSize(), 0);
    });
  }

  initMap();
  setTimeout(() => {
    map.invalidateSize();
  }, 200);
}

function normalizeImages(images) {
  return images.map((item) => String(item)).sort();
}

function haveImagesChanged() {
  if (!pond) return false;

  const currentImageSources = pond.getFiles().map((fileItem) => {
    return String(fileItem.source || fileItem.filename);
  });

  const original = normalizeImages(originalImageSources);
  const current = normalizeImages(currentImageSources);

  return JSON.stringify(original) !== JSON.stringify(current);
}

function updateSaveButton() {
  const editForm = document.getElementById("editForm");

  if (editForm.checkValidity() || haveImagesChanged()) {
    $("#save").removeAttr("disabled");
  } else {
    $("#save").attr("disabled", "disabled");
  }
}

