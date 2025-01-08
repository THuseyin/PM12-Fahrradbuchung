import { refreshDatabase } from './setDB.js';  // Named import
import { initilazeMap, initMarkers, yellowMarker, greenMarker, redMarker, blueMarker, AboutAvarageDensityLayer, UnderAvarageDensityLayer, AboveAvarageDensityLayer } from './map.js';
console.log("App.js loaded");

var map = L.map('map').setView([50.1109, 8.6821], 13);
var stationData;
initilazeMap(map);
initMarkers();

// Get the initial filter settings
function getInitialFilters() {
    const selectedPortals = Array.from(document.querySelectorAll('input[name="portals[]"]:checked')).map(cb => cb.value);
    const selectedDays = Array.from(document.querySelectorAll('input[name="days[]"]:checked')).map(cb => cb.value);
    
    return {
        portals: selectedPortals,
        days: selectedDays
    };
}

loadStationData(getInitialFilters()).then((data) => {
    processStationData(data);
    // Add the loaded data to the global variable
    stationData = data;
  }).catch((error) => {
    console.error('Error loading data:', error);
  });


// --------EVENT LISTENER--------
document.getElementById('refresh-database').addEventListener('click', () => {
    console.log("Button clicked");
    // Call the refreshDatabase function from setDatabase.js
    if (typeof refreshDatabase === 'function') {
        refreshDatabase();
    } else {
        console.error("refreshDatabase function is not defined.");
    }
});

// Event listener for filter changes
document.querySelectorAll('input[type="checkbox"], input[name="booking-type"]').forEach(filter => {
    filter.addEventListener('change', () => {
        console.log("Filter changed");
        const filters = getFilters();
        clearLayers();
        loadStationData(filters).then(data => {
            processStationData(data);
            stationData = data; // Update station data
        }).catch(error => {
           console.error('Error loading data:', error);
       });
    });
});


// Get filters
function getFilters() {
    const selectedPortals = Array.from(document.querySelectorAll('input[name="portals[]"]:checked')).map(cb => cb.value);
    const selectedDays = Array.from(document.querySelectorAll('input[name="days[]"]:checked')).map(cb => cb.value);
    return {
        portals: selectedPortals,
        days: selectedDays
    };
}
// --------EVENT LISTENER--------
function loadStationData(filters) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', `./cache_handler.php?filters=${JSON.stringify(filters)}`, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    try {
                        const data = JSON.parse(xhr.responseText);
                        resolve(data);
                    } catch (error) {
                        reject(error);
                    }
                } else {
                   reject(xhr.statusText);
                }
            }
        };
        xhr.send();
    });
}


function processStationData(data) {
    const bookingType = document.querySelector('input[name="booking-type"]:checked').value;
    const stationCounts = {};
  
    data.forEach(route => {
      let stationId;
      let latitude;
      let longitude;
      let stationName;
  
      if (bookingType === "start") {
        stationId = route.Start_Station_ID;
        latitude = route.Start_Latitude;
        longitude = route.Start_Longitude;
        stationName = route.Start_Station;
      } else if (bookingType === "end") {
        stationId = route.Ende_Station_ID;
        latitude = route.Ende_Latitude;
        longitude = route.Ende_Longitude;
        stationName = route.Ende_Station;
      }
  
      if (stationCounts[stationId]) {
          stationCounts[stationId].count++;
          stationCounts[stationId].latitude = latitude;
          stationCounts[stationId].longitude = longitude;
          stationCounts[stationId].stationName = stationName;
        } else {
            stationCounts[stationId] = { count: 1, latitude: latitude, longitude: longitude, stationName: stationName};
      }
  });
  
  
    const transactions = Object.values(stationCounts).map(station => station.count);
    const sortedTransactions = [...transactions].sort((a, b) => b - a);
    const top20 = sortedTransactions.slice(0, 20);
    const bottom20 = sortedTransactions.slice(-20);
    clearLayers();
  
  
    for (const stationId in stationCounts) {
      const station = stationCounts[stationId];
      let markerIcon = yellowMarker;
      if (top20.includes(station.count)) {
        markerIcon = redMarker;
      } else if (bottom20.includes(station.count)) {
        markerIcon = greenMarker;
      }
      const popupContent = `<b>Station Name:</b> ${station.stationName}<br>
                           <b>Station ID:</b> ${stationId}<br>
                           <b>Transactions:</b> ${station.count}`;
  
      L.marker([station.latitude, station.longitude], { icon: markerIcon })
            .bindPopup(popupContent)
            .addTo(markerIcon === redMarker ? AboveAvarageDensityLayer : (markerIcon === greenMarker ? UnderAvarageDensityLayer : AboutAvarageDensityLayer));
  
      }
  }


function calculateAverage(arr) {
    const sum = arr.reduce((a, b) => a + b, 0);
    return sum / arr.length;
}

function calculateStandardDeviation(values) {
    const avg = calculateAverage(values);
    const squaredDifferences = values.map(value => Math.pow(value - avg, 2));
    const averageSquaredDifference = calculateAverage(squaredDifferences);
    return Math.sqrt(averageSquaredDifference);
}
function clearLayers() {
    AboveAvarageDensityLayer.clearLayers();
    UnderAvarageDensityLayer.clearLayers();
    AboutAvarageDensityLayer.clearLayers();
}

let searchMarker; // Variable für den Such-Marker

// Event Listener für die Adresssuche
document.getElementById('search-button').addEventListener('click', async () => {
    const address = document.getElementById('address-input').value;

    if (!address) {
        alert('Bitte eine Adresse eingeben.');
        return;
    }

    try {
        // Anfrage an Nominatim API senden
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
        const data = await response.json();

        if (data.length === 0) {
            alert('Adresse nicht gefunden.');
            return;
        }

        // Die erste Adresse aus den Ergebnissen verwenden
        const { lat, lon, display_name } = data[0];

        // Karte zentrieren
        map.setView([lat, lon], 16);

        // Neuen Marker hinzufügen
        searchMarker = L.marker([lat, lon])
            .addTo(map)
            .bindPopup(display_name)
            .openPopup();

    } catch (error) {
        console.error('Fehler beim Abrufen der Adresse:', error);
    }
});
