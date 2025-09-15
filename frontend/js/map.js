// map.js
window.realtorapp = window.realtorapp || {};
const { getOpenCageLeafletKey } = window.realtorapp.api;

window.realtorapp.map = (function () {
    const FL_BOUNDS = { minLat: 24.3, maxLat: 31.1, minLng: -87.7, maxLng: -79.8 };
    const OPEN_CAGE_KEY = getOpenCageLeafletKey();

    let map = null;
    let markerLayer = null;

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
        if (!data.results || !data.results[0]) throw new Error('No geocode results');
        const g = data.results[0].geometry;
        return { lat: g.lat, lng: g.lng };
    }

    function initMap(containerId = 'map') {
        map = L.map(containerId).setView([26.7153, -80.0534], 8);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap'
        }).addTo(map);

        markerLayer = L.layerGroup().addTo(map);
    }

    function clearMarkers() {
        if (markerLayer) markerLayer.clearLayers();
    }

    function addHouseMarker(house, lat, lng) {
        if (!markerLayer) return;
        L.marker([Number(lat), Number(lng)])
            .addTo(markerLayer)
            .bindPopup(`<b>${house.address_street ?? ""}</b><br>${house.address_city ?? ""}`);
    }

    async function putMarkerOrGeocode(house, formatAddressFn) {
        const lat = house.latitude, lng = house.longitude;

        if (isValidCoords(lat, lng)) {
            addHouseMarker(house, lat, lng);
            return;
        }

        const fullAddress = typeof formatAddressFn === 'function' ? formatAddressFn(house) : '';
        if (!fullAddress) {
            console.warn('Missing address parts; cannot geocode for id:', house.id);
            return;
        }

        try {
            const { lat: gLat, lng: gLng } = await geocodeAddress(fullAddress);
            if (isValidCoords(gLat, gLng)) {
                addHouseMarker(house, gLat, gLng);
            } else {
                console.warn('Geocoded coords out of FL bounds for id:', house.id, gLat, gLng);
            }
        } catch (err) {
            console.error('Geocoding error for id:', house.id, err);
        }
    }

    return {
        initMap,
        clearMarkers,
        addHouseMarker,
        putMarkerOrGeocode
    };
})();
