// Start map and set center to Frankfurt
var map = L.map('map').setView([50.1109, 8.6821], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
}).addTo(map);

// Bir işaretçi (marker) ekleyelim
L.marker([50.1109, 8.6821]).addTo(map)
    .bindPopup('Frankfurt, Germany');
