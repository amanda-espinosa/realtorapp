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

const map = {
    FL_BOUNDS: { minLat: 24.3, maxLat: 31.1, minLng: -87.7, maxLng: -79.8 },
    OPEN_CAGE_KEY: null,
    map: null,
    markerLayer: null,

    isValidCoords: function (lat, lng) {
        const la = Number(lat), ln = Number(lng);
        if (!Number.isFinite(la) || !Number.isFinite(ln)) return false;
        return la >= this.FL_BOUNDS.minLat && la <= this.FL_BOUNDS.maxLat &&
            ln >= this.FL_BOUNDS.minLng && ln <= this.FL_BOUNDS.maxLng;
    },

    geocodeAddress: async function (address) {
        const url = 'https://api.opencagedata.com/geocode/v1/json'
            + '?q=' + encodeURIComponent(address)
            + '&key=' + OPEN_CAGE_KEY
            + '&no_annotations=1';
        const res = await fetch(url);
        const data = await res.json();
        if (!data.results || !data.results[0]) throw new Error('No geocode results');
        const g = data.results[0].geometry;
        return { lat: g.lat, lng: g.lng };
    },

    initMap: async function (containerId = 'map') {
        this.OPEN_CAGE_KEY = (await api.getOpenCageLeafletKey()).trim();
        console.log(this.OPEN_CAGE_KEY);
        let generalMap = L.map(containerId).setView([26.7153, -80.0534], 8);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap'
        }).addTo(generalMap);

        markerLayer = L.layerGroup().addTo(generalMap);
    },

    clearMarkers: function () {
        if (markerLayer) markerLayer.clearLayers();
    },

    addHouseMarker: function (house, lat, lng) {
        if (!markerLayer) return;
        L.marker([Number(lat), Number(lng)])
            .addTo(markerLayer)
            .bindPopup(`<b>${house.address_street ?? ""}</b><br>${house.address_city ?? ""}`);
    },

    putMarkerOrGeocode: async function (house, formatAddressFn) {
        const lat = house.latitude, lng = house.longitude;

        if (this.isValidCoords(lat, lng)) {
            this.addHouseMarker(house, lat, lng);
            return;
        }

        const fullAddress = typeof formatAddressFn === 'function' ? formatAddressFn(house) : '';
        if (!fullAddress) {
            console.warn('Missing address parts; cannot geocode for id:', house.id);
            return;
        }

        try {
            const { lat: gLat, lng: gLng } = await this.geocodeAddress(fullAddress);
            if (this.isValidCoords(gLat, gLng)) {
                this.addHouseMarker(house, gLat, gLng);
            } else {
                console.warn('Geocoded coords out of FL bounds for id:', house.id, gLat, gLng);
            }
        } catch (err) {
            console.error('Geocoding error for id:', house.id, err);
        }
    },

    initPropertyMap: async function (house) {
        let propertyMap = L.map('map').setView([house.latitude, house.longitude], 11);

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap'
        }).addTo(propertyMap);

        if (house.latitude && house.longitude) {
            L.marker([house.latitude, house.longitude])
                .addTo(propertyMap)
                .bindPopup(`<b>${house.address_street}</b><br>${house.address_city}`);
        } else {
            let fullAddress = `${house.address_street} ${house.address_apartment}, ${house.address_city}, ${house.address_state}, ${house.address_zip}`;

            let api_key = await realtorapp.api.getOpenCageLeafletKey();

            let request_url = 'https://api.opencagedata.com/geocode/v1/json'
                + '?q=' + encodeURIComponent(fullAddress)
                + '&key=' + api_key
                + '&no_annotations=1';

            fetch(request_url)
                .then(response => response.json())
                .then(data => {
                    const coords = data.results[0].geometry;

                    L.marker([coords.lat, coords.lng])
                        .addTo(propertyMap)
                        .bindPopup(`<b>${house.address_street}</b><br>${house.address_city}`);

                    $.post("../../backend/php/main.php?action=updateCoordinates", {
                        id: house.id,
                        latitude: coords.lat,
                        longitude: coords.lng
                    }).then(() => {
                        console.log("coordinates saved for house ID: ", house.id);
                    });
                })
                .catch(err => console.error('Geocoding error:', err));
        }
        return propertyMap;
    }
};
