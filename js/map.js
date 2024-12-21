// Start map and set center to Frankfurt
var map = L.map('map').setView([50.1109, 8.6821], 13);


initilazeMap();
loadData();



function initilazeMap() {
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
    }).addTo(map);
}

function loadData() {
    // Create an XMLHttpRequest to fetch data from server.php
    const xhr = new XMLHttpRequest();
    xhr.open('GET', './server.php', true); 
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                try {
                    const data = JSON.parse(xhr.responseText); // Parse the JSON response
    
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
                } catch (error) {
                    console.error('Error parsing JSON data:', error);
                }
            } else {
                console.error('Failed to fetch data from server.php:', xhr.statusText);
            }
        }
    };
    xhr.send(); 
}