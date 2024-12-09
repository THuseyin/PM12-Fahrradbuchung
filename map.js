// Haritayı başlat ve Frankfurt'u merkez olarak ayarla
var map = L.map('map').setView([50.1109, 8.6821], 13); // Koordinatlar Frankfurt için

// OpenStreetMap kullanarak harita katmanını ekle
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
}).addTo(map);

// Bir işaretçi (marker) ekleyelim
L.marker([50.1109, 8.6821]).addTo(map)
    .bindPopup('Frankfurt, Germany')
    .openPopup();
