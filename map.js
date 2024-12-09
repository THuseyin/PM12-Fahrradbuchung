// Start map and set center to Frankfurt
var map = L.map('map').setView([50.1109, 8.6821], 13);

// var standartIcon = new LeafIcon({iconUrl: './icons/location.png'});
// L.icon = function (options) {
//     return new L.Icon(options);
// };

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
}).addTo(map);

fetch('./json/stations.json')
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch stations.json');
        }
        return response.json(); // Parse the JSON response
    })
    .then(data => {
        // Loop through each station and add a marker
        data.forEach(station => {
            const { Station_Name, Latitude, Longitude, Startvorgaenge, Endvorgaenge } = station;

            // Create a marker with a popup showing station details
            L.marker([Latitude, Longitude])
                .addTo(map)
                .bindPopup(`
                    <b>${Station_Name}</b><br>
                    <b>Start Transactions:</b> ${Startvorgaenge}<br>
                    <b>End Transactions:</b> ${Endvorgaenge}
                `);
        });
    })
    .catch(error => {
        console.error('Error loading the JSON data:', error);
    });