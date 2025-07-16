const stateTextArray = [
    "For Rent",
    "For Sale",
    "Sale Pending",
    "Sold",
    "Off Market"
];

window.addEventListener("DOMContentLoaded", init);
function init() {
    const url = window.location.href;
    let images = [
        "../img/sol.JPG",
        "../img/pic3.jpg",
        "../img/pic4.jpg",
        "../img/pic7.jpg"
    ];

    document.getElementById("facebook-share").href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    document.getElementById("whatsapp-share").href = `https://wa.me/?text=${encodeURIComponent(url)}`;
    document.getElementById("email-share").href = `mailto:?subject=Check out this property&body=${encodeURIComponent(url)}`;
    //Gallery
    let mainPhoto = document.createElement("a");
    mainPhoto.id = "mainPhoto";
    mainPhoto.setAttribute("href", "../img/pic7.jpg");
    mainPhoto.setAttribute("data-fancybox", "gallery");
    mainPhoto.setAttribute("data-caption", "Beautiful House");
    let mainPhotoContainer = document.getElementById("mainPhotoContainer");
    mainPhotoContainer.appendChild(mainPhoto);

    let mainImg = document.createElement("img");
    mainImg.setAttribute("src", "../img/pic7.jpg");
    mainImg.setAttribute("alt", "House Image");
    mainPhoto.appendChild(mainImg);

    images.forEach((src, index) => {
        let rightPicsDiv = document.createElement("div");
        rightPicsDiv.className = index === images.length - 1 ? "homePicsMore" : "homePics";

        let anchor = document.createElement("a");
        anchor.setAttribute("href", src);
        anchor.setAttribute("data-fancybox", "gallery");

        let img = document.createElement("img");
        img.setAttribute("src", src);
        img.setAttribute("alt", "");

        anchor.appendChild(img);

        if (index === images.length - 1) {
            let overlay = document.createElement("div");
            overlay.className = "overlay";
            overlay.textContent = "+";
            anchor.appendChild(overlay);
        }

        rightPicsDiv.appendChild(anchor);
        let galleryRight = document.getElementById("galleryRight");
        galleryRight.appendChild(rightPicsDiv);
    });

    //Property section
    function getQueryParam(param) {
        let urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    let houseString = getQueryParam("house");
    let house = JSON.parse(houseString);

    if (house) {
        updateShareLinks(house.id);

        let propertiesHouseObject = Object.getOwnPropertyNames(house);
        //let outputHouseObject = "";

        for (let i = 0; i < propertiesHouseObject.length; i++) {
            let property = propertiesHouseObject[i];
            let value = house[property];
            //outputHouseObject += property + ": " + value + "<br>";
            let propertyElement = document.getElementById(property);
            if (propertyElement !== null) {
                propertyElement.innerHTML = value;
            }
        }

        const stateIndex = parseInt(house.property_state);
        const stateText = stateTextArray[stateIndex] ?? "Unknown";
        document.getElementById("property_state").innerText = stateText;

        //veb data
        document.querySelector(".daysOnWebSite").innerText = `Listed since ${house.days_on_website}`;
        document.querySelector(".views").innerText = `${house.views} views`;

        //document.getElementById("property").innerHTML = outputHouseObject;

        /*
        document.getElementById("price").innerText = "$" + house.price;
        document.getElementById("number_of_rooms").innerText = house.number_of_rooms + " rooms";
        document.getElementById("number_of_bathrooms").innerText = house.number_of_bathrooms + " bathrooms";

        

        
        document.getElementById("area_sqft").innerText = house.area_sqft + " sqft";
        //address
        document.getElementById("address_street").innerText = house.address_street;
        document.getElementById("address_apartment").innerText = house.address_apartment;
        document.getElementById("address_city").innerText = house.address_city;
        document.getElementById("address_state").innerText = house.address_state;
        document.getElementById("address_zip").innerText = house.address_zip;
        //description
        document.getElementById("description").innerText = house.description;
        
        //interior
        document.getElementById("heating_type").innerText = `Heating type: ${house.heating_type}`;
        document.getElementById("cooling_type").innerText = `Cooling type: ${house.cooling_type}`;
        document.getElementById("appliances").innerText = `Appliances: ${house.appliances}`;
        document.getElementById("flooring_type").innerText = `Flooring type: ${house.flooring_type}`;
        document.getElementById("basement").innerText = `Basement: ${house.basement}`;
        document.getElementById("fireplace").innerText = `Fireplace: ${house.fireplace}`;
        //property facts
        document.getElementById("levels").innerText = `Levels: ${house.levels}`;
        document.getElementById("parcel_number").innerText = `Parcel number: ${house.parcel_number}`;
        document.getElementById("special_conditions").innerText = `Special conditions: ${house.special_conditions}`;
        document.getElementById("size_lot").innerText = `Size lot: ${house.size_lot}`;
        document.getElementById("price_per_squarefeet").innerText = `Price per sqft: ${house.price_per_squarefeet}`;
        //construction
        document.getElementById("built_in_year").innerText = `Built in year: ${house.built_in_year}`;
        document.getElementById("home_type").innerText = `Home type: ${house.home_type}`;
        document.getElementById("materials").innerText = `Materials: ${house.materials}`;
        //utilities
        document.getElementById("sewer_type").innerText = `Sewer type: ${house.sewer_type}`;
        document.getElementById("water_type").innerText = `Water type: ${house.water_type}`;
        //community HOA
        document.getElementById("hoa_cost").innerText = `HOA cost: ${house.hoa_cost}`;
        document.getElementById("location").innerText = `Location: ${house.location}`;
        //nearby schools
        document.getElementById("school_name").innerText = `School name: ${house.school_name}`;
        document.getElementById("school_grade").innerText = `School grade: ${house.school_grade}`;
        document.getElementById("school_distance").innerText = `School distance: ${house.school_distance}`;
    } else {
        console.error("No house ID found in URL.");
    } */
    }

    let map;

    function initMap() {
        map = L.map('map').setView([27.638497446, -80.387998448], 10);

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);

        let marker = L.marker([27.638497446, -80.387998448]).addTo(map);
    }

    initMap();

}

function updateShareLinks(houseId) {
    const url = `http://127.0.0.1:5501/RealtorProject/frontend/html/pop.html?id=${houseId}`; // Adjust if deployed

    document.getElementById("facebook-share").href =
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;

    document.getElementById("whatsapp-share").href =
        `https://api.whatsapp.com/send?text=${encodeURIComponent("Check out this property: " + url)}`;

    document.getElementById("email-share").href =
        `mailto:?subject=Awesome Property&body=Look at this property I found: ${encodeURIComponent(url)}`;
}

window.addEventListener("scroll", function () {
    const box = document.getElementById("formContainer");
    if (!box) return;

    const scrollY = window.scrollY;
    const property = document.getElementById("property");
    const features = document.getElementById("features");

    const propertyTop = property.offsetTop;
    const featuresBottom = features.offsetTop + features.offsetHeight;

    if (scrollY >= propertyTop && scrollY < featuresBottom - box.offsetHeight) {
        box.style.position = "relative";
        box.style.top = (scrollY - propertyTop) + "px";
    }
});
