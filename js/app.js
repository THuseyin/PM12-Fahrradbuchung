import { refreshDatabase } from './setDB.js';
import { initilazeMap, initMarkers, yellowMarker, greenMarker, redMarker, blueMarker, AboutAvarageDensityLayer, UnderAvarageDensityLayer, AboveAvarageDensityLayer } from './map.js';
console.log("App.js loaded");

var map = L.map('map').setView([50.1109, 8.6821], 13);
var routesData;
var stationsData;
var polylines = [];
var selectedStationMarker;
var searchMarker;
var searchResults = [];
let currentFetchController = null; // To hold the current fetch controller
initilazeMap(map);
initMarkers();

// Get the initial filter settings
function getInitialFilters() {
    const selectedPortals = Array.from(document.querySelectorAll('input[name="portals[]"]:checked')).map(cb => cb.value);
    const selectedDays = Array.from(document.querySelectorAll('input[name="days[]"]:checked')).map(cb => cb.value);
    console.log("Initial filters:", { portals: selectedPortals, days: selectedDays });

    return {
        portals: selectedPortals,
        days: selectedDays
    };
}

loadRoutesData(getInitialFilters()).then((data) => {
    processroutesData(data);
    routesData = data;
    console.log("Routes data loaded successfully:", routesData);
}).catch((error) => {
    console.error('Error loading routes data:', error);
});

loadStationsData().then((data) => {
    stationsData = data;
    console.log("Stations data loaded successfully:", stationsData);
}).catch((error) => {
    console.error('Error loading stations data:', error);
});

// --------EVENT LISTENER--------
document.getElementById('refresh-database').addEventListener('click', async () => {
    console.log("Button clicked");
    const loadingSpinner = document.getElementById('loading-spinner');
     const container = document.querySelector('.container')

    loadingSpinner.style.display = 'flex';
    container.classList.add('loading'); //Add the grayed background

      if (typeof refreshDatabase === 'function') {
        try{
            await refreshDatabase();
            loadingSpinner.innerHTML = `<div class="success-message"><i class="fas fa-check-circle"></i> Database Successfully Updated</div>`;
             console.log("refreshDatabase function is called");
              setTimeout(() => {
                   loadingSpinner.style.display = 'none';
                  loadingSpinner.innerHTML = `<div class="spinner"></div>`
                  container.classList.remove('loading');
               }, 2000);
        }
        catch(error){
             console.error("refreshDatabase function couldn't update database:", error);
              loadingSpinner.innerHTML = `<div class="error-message"><i class="fas fa-times-circle"></i> Database couldn't Updated</div>`;
              setTimeout(() => {
                   loadingSpinner.style.display = 'none';
                   loadingSpinner.innerHTML = `<div class="spinner"></div>`
                  container.classList.remove('loading');
               }, 2000);

        }
    } else {
        console.error("refreshDatabase function is not defined.");
    }
});

// Event listener for filter changes
document.querySelectorAll('input[type="checkbox"], input[name="booking-type"]').forEach(filter => {
    filter.addEventListener('change', () => {
        console.log("Filter changed");
        const filters = getFilters();
         console.log("New filters:", filters);
        clearLayers();
        clearPolylines();
        const panel = document.getElementById('station-panel');
        panel.classList.remove('active');
        if (selectedStationMarker) {
            map.removeLayer(selectedStationMarker);
            selectedStationMarker = null;
        }
        loadRoutesData(filters).then(data => {
            processroutesData(data);
             routesData = data;
               console.log("Routes data loaded successfully with new filters:", routesData);
        }).catch(error => {
            console.error('Error loading data:', error);
        });
    });
});

// Map click listener to reset all polylines and stations
map.on('click', (e) => {
    const panel = document.getElementById('station-panel');
    const searchResultsContainer = document.getElementById('search-results-container');
     console.log("Map clicked", e.originalEvent.target);
    if (panel.classList.contains('active') && !e.originalEvent.target.closest('.station-panel')) {
         panel.classList.remove('active');
            console.log("Station panel closed on map click");
       if (selectedStationMarker) {
           map.removeLayer(selectedStationMarker);
            selectedStationMarker= null;
            console.log("selectedStationMarker removed");
          }
    }
    if(searchResultsContainer && !e.originalEvent.target.closest('.search-results')){
         searchResultsContainer.style.display = 'none';
          console.log("Search suggestions closed on map click");
    }
    clearPolylines();
    processroutesData(routesData);
});

// Get filters
function getFilters() {
    const selectedPortals = Array.from(document.querySelectorAll('input[name="portals[]"]:checked')).map(cb => cb.value);
    const selectedDays = Array.from(document.querySelectorAll('input[name="days[]"]:checked')).map(cb => cb.value);
      console.log("Current filters:", { portals: selectedPortals, days: selectedDays });
    return {
        portals: selectedPortals,
        days: selectedDays
    };
}

// --------EVENT LISTENER--------
function loadRoutesData(filters) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
         console.log("Fetching routes data with filters:", filters);
        xhr.open('GET', `./cache_handler.php?&filters=${JSON.stringify(filters)}`, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    try {
                        const data = JSON.parse(xhr.responseText);
                         console.log("Routes data fetched successfully:", data);
                        resolve(data);
                    } catch (error) {
                         console.error('Error parsing routes data:', error);
                        reject(error);
                    }
                } else {
                    console.error('Error loading routes data:', xhr.statusText);
                    reject(xhr.statusText);
                }
            }
        };
        xhr.send();
    });
}
// --------EVENT LISTENER--------
function loadStationsData() {
     return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        console.log("Fetching stations data");
        xhr.open('GET', `./stations.php`, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    try {
                        const data = JSON.parse(xhr.responseText);
                        console.log("Stations data fetched successfully:", data);
                        resolve(data);
                    } catch (error) {
                          console.error('Error parsing stations data:', error);
                        reject(error);
                    }
                } else {
                     console.error('Error loading stations data:', xhr.statusText);
                    reject(xhr.statusText);
                }
            }
        };
        xhr.send();
    });
}

function processroutesData(data) {
    const bookingType = document.querySelector('input[name="booking-type"]:checked')?.value || "start";
    const stationCounts = {};
     console.log("Processing routes data with booking type:", bookingType);
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
        console.log("Station counts:", stationCounts);
        console.log("Transactions:", transactions);
       console.log("Sorted transactions:", sortedTransactions);
        console.log("Top 20% threshold:", topTwentyPercentThreshold);
        console.log("Bottom 20% threshold:", bottomTwentyPercentThreshold);
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
         console.log("Adding marker for station:", {stationId, station, markerIcon});
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

    station.stationId = station.stationId ?? station.Station_ID;
    station.latitude = station.latitude ?? station.Latitude;
    station.longitude = station.longitude ?? station.Longitude;
    station.stationName = station.stationName ?? station.Station_Name;

     const panel = document.getElementById('station-panel');
      const panelContent = document.getElementById('panel-content');
     console.log("Marker clicked for station:", station);
    panel.classList.add('active');
    // Fetch detailed data
     const startTransactions = routesData.filter(route => route.Start_Station_ID == station.stationId).length;
      const endTransactions = routesData.filter(route => route.Ende_Station_ID == station.stationId).length;
       // Find top 5 outbound stations
        const outboundStations = routesData
        .filter(route => route.Start_Station_ID == station.stationId)
            .reduce((acc, route) => {
                const endStation = route.Ende_Station;
                if (acc[endStation]) {
                    acc[endStation]++;
                } else {
                    acc[endStation] = 1;
                }
                return acc;
            }, {});
    const topOutbound = Object.entries(outboundStations)
            .sort(([, countA], [, countB]) => countB - countA)
            .slice(0, 5)
             .map(([stationName, count]) => `<p>${stationName} : ${count}</p> `);
            // Find top 5 inbound stations
     const inboundStations = routesData
            .filter(route => route.Ende_Station_ID == station.stationId)
             .reduce((acc, route) => {
                 const startStation = route.Start_Station;
                    if (acc[startStation]) {
                    acc[startStation]++;
                 } else {
                     acc[startStation] = 1;
                  }
                return acc;
            }, {});
       const topInbound = Object.entries(inboundStations)
          .sort(([, countA], [, countB]) => countB - countA)
            .slice(0, 5)
              .map(([stationName, count]) => `<p> ${stationName} : ${count} </p>`);


     panelContent.innerHTML = `
         <div class="station-info">
            <p><b>Station Name:</b> ${station.stationName}</p>
            <p><b>Start Transactions:</b> ${startTransactions}</p>
            <p><b>End Transactions:</b> ${endTransactions}</p>
        </div>
        <div class="transaction-info">
            <p><b>Top 5 Outbound Stations:</b></p>
            <ul>
                ${topOutbound.map(station => `<li>${station}</li>`).join('')}
            </ul>
            <p><b>Top 5 Inbound Stations:</b></p>
            <ul>
                ${topInbound.map(station => `<li>${station}</li>`).join('')}
            </ul>
        </div>
     `;
    // Close panel button
     const closeButton =  document.getElementById('close-panel-button');
      closeButton.onclick = () => {
           panel.classList.remove('active');
            if (selectedStationMarker) {
           map.removeLayer(selectedStationMarker);
            selectedStationMarker= null;
              console.log("Station panel closed");
          }
         };
    
    clearPolylines();
     // Remove previous marker
      if (selectedStationMarker) {
            map.removeLayer(selectedStationMarker);
              console.log("Previous selectedStationMarker removed");
      }
     // Add the blue marker at the selected station's location
       selectedStationMarker = L.marker([station.latitude, station.longitude], {
         icon: blueMarker
        }).addTo(map);
        console.log("Added blue marker to selected station:", station);
    handleRoutes(station);
    document.addEventListener('DOMContentLoaded', () => {
        const stationPanel = document.getElementById('station-panel');
        const panelContent = document.getElementById('panel-content');
        const panelHeader = stationPanel.querySelector('.panel-header');
    
        if (panelContent && panelHeader) {
            const headerHeight = panelHeader.offsetHeight; // Höhe des Headers
            const panelHeight = stationPanel.offsetHeight; // Gesamthöhe des Panels
    
            // Setze die Höhe des Inhaltsbereichs
            panelContent.style.maxHeight = `${panelHeight - headerHeight}px`;
            console.log(`Set maxHeight of panel-content: ${panelHeight - headerHeight}px`);
        }
    });
    
}

function handleRoutes(station) {
    clearLayers();
    clearPolylines();
    var connectionToStations = {};
     console.log("Handling routes for station:", station);
    routesData.forEach(route => {

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
      console.log("Connection to Stations :", connectionToStations);
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
        console.log("Creating route connection with", {startLatLng,endLatLng, polylineColor, netTransactionCount, markerIcon});
        const marker = L.marker([route.latitude, route.longitude], {
            icon: markerIcon
        })
            .addTo(markerIcon === redMarker ? AboveAvarageDensityLayer : (markerIcon === greenMarker ? UnderAvarageDensityLayer : AboutAvarageDensityLayer));

        const polyline = L.polyline([startLatLng, endLatLng], {
            color: polylineColor,
              weight: polylineColor === 'yellow' ? 1 : netTransactionCount, // Adjust weight
            opacity: 0.8
        }).addTo(map);

        polyline.bindTooltip(`<b>Station Name:${route.stationName} </b> <br> To: ${route.howManyToStation} Transaktion <br> From: ${route.howManyFromStation} Transaktion`, { permanent: false });

        polylines.push(polyline);
    };
}


function clearPolylines() {
    polylines.forEach(polyline => map.removeLayer(polyline));
     console.log("Polylines cleared");
    polylines = [];
}

function clearLayers() {
    AboveAvarageDensityLayer.clearLayers();
    UnderAvarageDensityLayer.clearLayers();
    AboutAvarageDensityLayer.clearLayers();
      console.log("Map layers cleared");
}

// Event listener for the search input
document.getElementById('search-input').addEventListener('input', async function() {
    const address = this.value;
    const searchResultsContainer = document.getElementById('search-results-container');
     console.log("Search input changed. Current value:", address);
     if (!address) {
         if(searchMarker){
           map.removeLayer(searchMarker);
          searchMarker=null;
            console.log("Search marker removed due to empty input");
          }
         searchResultsContainer.style.display = 'none';
         console.log("Search suggestions hidden due to empty input");
        return;
    }
    // Abort previous fetch if it's in progress
    if (currentFetchController) {
       currentFetchController.abort();
         console.log("Previous fetch aborted");
   }
     // Create a new AbortController for the current fetch
    currentFetchController = new AbortController();

    try {
         const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`,{signal: currentFetchController.signal});
         const data = await response.json();
           searchResults = data;
           searchResultsContainer.innerHTML ='';
         if (searchResults && searchResults.length > 0) {
            searchResultsContainer.style.display ='block';
             searchResults.forEach(result => {
                 const resultElement = document.createElement('div');
                  resultElement.classList.add('search-result');
                resultElement.textContent = result.display_name;
               resultElement.onclick = () => handleSearchResultClick(result);
                  searchResultsContainer.appendChild(resultElement);
            });
              console.log("Search suggestions loaded:", searchResults);
       } else{
           searchResultsContainer.style.display ='none';
           console.log("No search suggestions found");
       }


    }  catch (error) {
         if (error.name !== 'AbortError') { //To not console log abort error
              console.error('Error fetching address:', error);
        }
    }
});
// Function to handle click on search result
async function handleSearchResultClick(result) {
    const searchResultsContainer = document.getElementById('search-results-container');
    searchResultsContainer.style.display ='none';
     document.getElementById('search-input').value = result.display_name; //Set the value of input
    console.log("Search result selected:", result.display_name);
    const { lat, lon, display_name } = result;
    if(searchMarker){
        map.removeLayer(searchMarker);
         console.log("Previous search marker removed");
    }
    searchMarker = L.marker([lat, lon])
        .addTo(map)
        .bindPopup(display_name)
        .openPopup();
         console.log("New search marker added", {lat, lon, display_name});
    map.setView([lat,lon],16)
    // Find the nearest station
    const nearestStation = findNearestStation(lat, lon);

    if (nearestStation) {
         // Remove previous marker
         if (selectedStationMarker) {
            map.removeLayer(selectedStationMarker);
             console.log("Previous selectedStationMarker removed");
         }
        // Add the blue marker at the selected station's location
         selectedStationMarker = L.marker([nearestStation.Latitude, nearestStation.Longitude], {
           icon: blueMarker
           }).addTo(map);
            console.log("Blue marker added to the closest station:", nearestStation);
        handleMarkerClick(nearestStation)
         if(searchMarker){
                map.removeLayer(searchMarker);
                searchMarker = null;
                 console.log("Search marker removed after finding closest station");
            }
     }
}

function findNearestStation(lat, lon) {
    if (!stationsData || stationsData.length === 0) {
        console.warn('No station data available to find the nearest station');
        return null;
    }

    let closestStation = null;
    let minDistance = Infinity;

    for (const station of stationsData) {
         const distance = calculateDistance(lat, lon, station.Latitude, station.Longitude);
        if (distance < minDistance) {
            minDistance = distance;
            closestStation = station;
        }
    }
      console.log("Nearest station found:", closestStation);
    return closestStation;
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
     const lat1Rad = deg2rad(lat1);
    const lon1Rad = deg2rad(lon1);
    const lat2Rad = deg2rad(lat2);
    const lon2Rad = deg2rad(lon2);

    const dLat = lat2Rad - lat1Rad;
    const dLon = lon2Rad - lon1Rad;

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1Rad) * Math.cos(lat2Rad) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return distance;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}
// Event listener for the search button
document.getElementById('search-button').addEventListener('click', async function() {
      const address = document.getElementById('search-input').value;
    if (!address) {
      alert("Please enter a address")
      return;
    }
      console.log("Search button clicked with address", address);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
          const data = await response.json();
      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
      if(searchMarker){
           map.removeLayer(searchMarker);
             console.log("Previous search marker removed");
       }
        searchMarker = L.marker([lat, lon])
           .addTo(map)
            .bindPopup(display_name)
            .openPopup();
            console.log("New search marker added", {lat, lon, display_name});
         map.setView([lat,lon],16)
        // Find the nearest station
        const nearestStation = findNearestStation(lat, lon);

        if (nearestStation) {
            // Remove previous marker
             if (selectedStationMarker) {
                 map.removeLayer(selectedStationMarker);
                  console.log("Previous selectedStationMarker removed");
             }
             // Add the blue marker at the selected station's location
            selectedStationMarker = L.marker([nearestStation.Latitude, nearestStation.Longitude], {
            icon: blueMarker
             }).addTo(map);
             console.log("Blue marker added to the closest station:", nearestStation);
         handleMarkerClick(nearestStation)
              if(searchMarker){
                map.removeLayer(searchMarker);
                searchMarker = null;
                 console.log("Search marker removed after finding closest station");
            }
        }
      } else{
           alert("Address not found")
      }

    } catch (error) {
        console.error('Error fetching address:', error);
    }
});