const stateTextArray = ["House for rent", "House for sale", "Sale pending", "Sold", "Out of market"];

const houses = [{
    price: 34000,
    rooms: "2 bds",
    bathrooms: "1 ba",
    state: 1,
    picture: "house0.jpg",
    area: "609.60 sqft",
    street: "5996 Ridge Lake CIR, ",
    apartment: "APT 34",
    city: "Vero Beach, ",
    addressState: "FL",
    zip: 32967
}, {
    price: 34000,
    rooms: "2 bds",
    bathrooms: "1 ba",
    state: 1,
    picture: "house1.jpg",
    area: "609.60 sqft",
    street: "5996 Ridge Lake CIR, ",
    apartment: "APT 34",
    city: "Vero Beach, ",
    addressState: "FL",
    zip: 32967
}, {
    price: 34000,
    rooms: "2 bds",
    bathrooms: "1 ba",
    state: 1,
    picture: "house2.jpg",
    area: "609.60 sqft",
    street: "5996 Ridge Lake CIR, ",
    apartment: "APT 34",
    city: "Vero Beach, ",
    addressState: "FL",
    zip: 32967
}, {
    price: 34000,
    rooms: "2 bds",
    bathrooms: "1 ba",
    state: 1,
    picture: "house3.jpg",
    area: "609.60 sqft",
    street: "5996 Ridge Lake CIR, ",
    apartment: "APT 34",
    city: "Vero Beach, ",
    addressState: "FL",
    zip: 32967
}, {
    price: 34000,
    rooms: "2 bds",
    bathrooms: "1 ba",
    state: 1,
    picture: "house4.jpg",
    area: "609.60 sqft",
    street: "5996 Ridge Lake CIR, ",
    apartment: "APT 34",
    city: "Vero Beach, ",
    addressState: "FL",
    zip: 32967
}, {
    price: 34000,
    rooms: "2 bds",
    bathrooms: "1 ba",
    state: 1,
    picture: "house5.jpg",
    area: "609.60 sqft",
    street: "5996 Ridge Lake CIR, ",
    apartment: "APT 34",
    city: "Vero Beach, ",
    addressState: "FL",
    zip: 32967
}];

window.addEventListener("load", init);
function init() {
    let container = document.getElementById("houseListContainer");
    for (let i = 0; i < houses.length; i++) {
        let property = document.createElement("div");
        property.className = "property";

        let picture = document.createElement("div");
        picture.className = "picture";
        picture.style.backgroundImage = "url('" + houses[i].picture + "')";
        property.appendChild(picture);

        let price = document.createElement("div");
        price.className = "price";
        price.innerHTML = "$" + houses[i].price;
        property.appendChild(price);

        let rooms = document.createElement("div");
        rooms.className = "rooms";
        rooms.innerHTML = houses[i].rooms;
        property.appendChild(rooms);

        let bathrooms = document.createElement("div");
        bathrooms.className = "bathrooms";
        bathrooms.innerHTML = houses[i].bathrooms;
        property.appendChild(bathrooms);

        let areaSqFt = document.createElement("div");
        areaSqFt.className = "area";
        areaSqFt.innerHTML = houses[i].area;
        property.appendChild(areaSqFt);

        let state = document.createElement("div");
        state.className = "state";
        state.innerHTML = stateTextArray[houses[i].state];
        property.appendChild(state);

        let street = document.createElement("div");
        street.className = "street";
        street.innerHTML = houses[i].street;
        property.appendChild(street);

        let apartment = document.createElement("div");
        apartment.className = "apartment";
        apartment.innerHTML = houses[i].apartment;
        property.appendChild(apartment);

        let city = document.createElement("div");
        city.className = "city";
        city.innerHTML = houses[i].city;
        property.appendChild(city);

        let addressState = document.createElement("div");
        addressState.className = "addressState";
        addressState.innerHTML = houses[i].addressState;
        property.appendChild(addressState);

        let zip = document.createElement("div");
        zip.className = "zip";
        zip.innerHTML = houses[i].zip;
        property.appendChild(zip);

        container.appendChild(property);
    }
}