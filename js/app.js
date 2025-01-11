import { refreshDatabase } from './setDB.js';
import { initilazeMap, initMarkers, yellowMarker, greenMarker, redMarker, blueMarker, AboutAvarageDensityLayer, UnderAvarageDensityLayer, AboveAvarageDensityLayer } from './map.js';
console.log("App.js loaded");

var map = L.map('map').setView([50.1109, 8.6821], 13);
var stationData;
var polylines = [];
var selectedStationMarker; // to store selected station marker
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
    stationData = data;
}).catch((error) => {
    console.error('Error loading data:', error);
});

// --------EVENT LISTENER--------
document.getElementById('refresh-database').addEventListener('click', () => {
    console.log("Button clicked");
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
            stationData = data;
        }).catch(error => {
            console.error('Error loading data:', error);
        });
    });
});

// Map click listener to reset all polylines and stations
map.on('click', (e) => {
    const panel = document.getElementById('station-panel');
    if (panel.classList.contains('active') && !e.originalEvent.target.closest('.station-panel')) {
        panel.classList.remove('active');
          if (selectedStationMarker) {
           map.removeLayer(selectedStationMarker);
           selectedStationMarker= null;
          }
    }
    clearPolylines();
    processStationData(stationData);
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
        xhr.open('GET', `./cache_handler.php?&filters=${JSON.stringify(filters)}`, true);
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
    const bookingType = document.querySelector('input[name="booking-type"]:checked')?.value || "start";
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
             stationCounts[stationId] = { count: 1, latitude: latitude, longitude: longitude, stationName: stationName };
        }
    });

    const transactions = Object.values(stationCounts).map(station => station.count);
    const sortedTransactions = [...transactions].sort((a, b) => a - b);
    const totalStations = sortedTransactions.length;
    const twentyPercent = Math.floor(totalStations * 0.2);
    const topTwentyPercentThreshold = sortedTransactions[totalStations - twentyPercent - 1];
    const bottomTwentyPercentThreshold = sortedTransactions[twentyPercent];

    clearLayers();

    for (const stationId in stationCounts) {
        const station = stationCounts[stationId];
        let markerIcon = yellowMarker;

        if (station.count >= topTwentyPercentThreshold) {
            markerIcon = redMarker;
        } else if (station.count <= bottomTwentyPercentThreshold) {
            markerIcon = greenMarker;
        }

        const popupContent = `
            <b>Station Name:</b> ${station.stationName}<br>
            <b>Station ID:</b> ${stationId}<br>
            <b>Transactions:</b> ${station.count}`;

        const marker = L.marker([station.latitude, station.longitude], {
            icon: markerIcon,
            stationID: station.stationId
        })
            .bindPopup(popupContent)
            .addTo(markerIcon === redMarker ? AboveAvarageDensityLayer : (markerIcon === greenMarker ? UnderAvarageDensityLayer : AboutAvarageDensityLayer));


        marker.on('click', () => {
             station.stationId = stationId;
              handleMarkerClick(station);
        });
    }
}
// Function to handle marker clicks
function handleMarkerClick(station) {
     const panel = document.getElementById('station-panel');
      const panelContent = document.getElementById('panel-content');
    panel.classList.add('active');
    // Fetch detailed data
     const startTransactions = stationData.filter(route => route.Start_Station_ID == station.stationId).length;
      const endTransactions = stationData.filter(route => route.Ende_Station_ID == station.stationId).length;

     panelContent.innerHTML = `
         <p><b>Station Name:</b> ${station.stationName}</p>
        <p><b>Start Transactions:</b> ${startTransactions}</p>
         <p><b>End Transactions:</b> ${endTransactions}</p>
     `;
    // Close panel button
     const closeButton =  document.getElementById('close-panel-button');
      closeButton.onclick = () => {
           panel.classList.remove('active');
            if (selectedStationMarker) {
           map.removeLayer(selectedStationMarker);
            selectedStationMarker= null;
          }
         };
    
    clearPolylines();
     // Remove previous marker
      if (selectedStationMarker) {
            map.removeLayer(selectedStationMarker);
      }
     // Add the blue marker at the selected station's location
       selectedStationMarker = L.marker([station.latitude, station.longitude], {
         icon: blueMarker
        }).addTo(map);
    handleRoutes(station);
}

function handleRoutes(station) {
    clearLayers();
    clearPolylines();
    var connectionToStations = {};
    stationData.forEach(route => {

        if (route.Start_Station_ID != station.stationId && route.Ende_Station_ID != station.stationId) {
            return;
        }
        const isStartStation = route.Start_Station_ID == station.stationId;
        const ToStationID = isStartStation ? route.Ende_Station_ID : route.Start_Station_ID;
        if (connectionToStations[ToStationID]) {
            if (isStartStation) {
                connectionToStations[ToStationID].howManyToStation++;
                connectionToStations[ToStationID].latitude = route.Ende_Latitude;
                connectionToStations[ToStationID].longitude = route.Ende_Longitude;
                connectionToStations[ToStationID].stationName = route.Ende_Station;
            } else {
                connectionToStations[ToStationID].howManyFromStation++;
                connectionToStations[ToStationID].latitude = route.Start_Latitude;
                connectionToStations[ToStationID].longitude = route.Start_Longitude;
                connectionToStations[ToStationID].stationName = route.Start_Station;
            }
        } else {
            connectionToStations[ToStationID] = {
                howManyToStation: isStartStation ? 1 : 0,
                howManyFromStation: isStartStation ? 0 : 1,
                latitude: isStartStation ? route.Ende_Latitude : route.Start_Latitude,
                longitude: isStartStation ? route.Ende_Longitude : route.Start_Longitude,
                stationName: isStartStation ? route.Ende_Station : route.Start_Station
            };
        }

    });
    for (const stationId in connectionToStations) {
        const route = connectionToStations[stationId];

        const startLatLng = [station.latitude, station.longitude];
        const endLatLng = [route.latitude, route.longitude];

        const isToBigger = route.howManyToStation > route.howManyFromStation;
        var polylineColor = isToBigger ? 'green' : 'red';
        const netTransactionCount = Math.abs(route.howManyToStation - route.howManyFromStation);


        let markerIcon = yellowMarker;
        if (netTransactionCount === 0) {
            markerIcon = yellowMarker;
            polylineColor = 'yellow';
        } else if (!isToBigger) {
            markerIcon = redMarker;
        } else if (isToBigger) {
            markerIcon = greenMarker;
        } 
        if (station.latitude === route.latitude && station.longitude === route.longitude) {
            continue;
        }


        const marker = L.marker([route.latitude, route.longitude], {
            icon: markerIcon
        })
            .addTo(markerIcon === redMarker ? AboveAvarageDensityLayer : (markerIcon === greenMarker ? UnderAvarageDensityLayer : AboutAvarageDensityLayer));

        const polyline = L.polyline([startLatLng, endLatLng], {
            color: polylineColor,
            weight: polylineColor === 'yellow' ? 1 : netTransactionCount, // Adjust weight
            opacity: 0.8
        }).addTo(map);

        polyline.bindTooltip(`${route.howManyToStation} to ${stationId}<br> ${route.howManyFromStation} from ${stationId}`, { permanent: false });

        polylines.push(polyline);
    };
}


function clearPolylines() {
    polylines.forEach(polyline => map.removeLayer(polyline));
    polylines = [];
}

function clearLayers() {
    AboveAvarageDensityLayer.clearLayers();
    UnderAvarageDensityLayer.clearLayers();
    AboutAvarageDensityLayer.clearLayers();
}