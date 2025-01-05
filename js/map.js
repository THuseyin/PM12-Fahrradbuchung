// Start map and set center to Frankfurt
// console.log("Map.js loaded");
export var greenMarker;
export var yellowMarker
export var redMarker;
export var blueMarker;

export var AboveAvarageDensityLayer = new L.LayerGroup();
export var UnderAvarageDensityLayer = new L.LayerGroup();
export var AboutAvarageDensityLayer = new L.LayerGroup();
// var features = [];

export function initilazeMap(map) {
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
    }).addTo(map);

    // Layer'ları haritaya ekle
    AboveAvarageDensityLayer.addTo(map);
    UnderAvarageDensityLayer.addTo(map);
    AboutAvarageDensityLayer.addTo(map);

    // Layer kontrol ekle
    L.control.layers(null, {
        "Above Average Density": AboveAvarageDensityLayer,
        "Under Average Density": UnderAvarageDensityLayer,
        "About Average Density": AboutAvarageDensityLayer,
    }).addTo(map);
}


export function initMarkers() {
     blueMarker = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });
     greenMarker = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });
     yellowMarker = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });
     redMarker = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

}

export function getMarkerIcon(color) {
    switch (color) {
        case 'green':
            return greenMarker;
        case 'yellow':
            return yellowMarker;
        case 'red':
            return redMarker;
        default:
            return blueMarker;
    }
}

