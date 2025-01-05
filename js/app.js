import { refreshDatabase } from './setDB.js';  // Named import
import { initilazeMap, initMarkers, yellowMarker, greenMarker, redMarker, blueMarker, AboutAvarageDensityLayer, UnderAvarageDensityLayer, AboveAvarageDensityLayer } from './map.js';
console.log("App.js loaded");

var map = L.map('map').setView([50.1109, 8.6821], 13);
var stationData;
initilazeMap(map);
initMarkers();

loadStationData().then((data) => {
  processStationData(data, true);
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

document.querySelectorAll('input[name="booking-type"]').forEach(radio => {
    radio.addEventListener('change', function () {
        console.log("Radio button clicked");
        const selectedValue = this.value; // Value of the selected radio button

        clearLayers();

        // Update the map
        const isStartVorgaenge = selectedValue === "start";
        processStationData(stationData, isStartVorgaenge);
    });
});
// --------EVENT LISTENER--------
function loadStationData() {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', './server.php', true);
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

function processStationData(data, isStartVorgaenge) {
    let transactions;
    // Popup'da gösterilecek metin
    const text = isStartVorgaenge ? "Start Transactions" : "End Transactions";

    // İşlem türüne göre veriyi seç
    if (isStartVorgaenge) {
        transactions = data.map(station => parseInt(station.Startvorgaenge, 10));
    } else {
        transactions = data.map(station => parseInt(station.Endvorgaenge, 10));
    }

    // Verileri sıralıyoruz
    const sortedTransactions = [...transactions].sort((a, b) => b - a); // Azalan sıralama
    const top20 = sortedTransactions.slice(0, 20); // En büyük 20 değer
    const bottom20 = sortedTransactions.slice(-20); // En küçük 20 değer

    // İstasyonları işliyoruz
    data.forEach(station => {
        let value;
        if (isStartVorgaenge) {
            value = parseInt(station.Startvorgaenge, 10);
        } else {
            value = parseInt(station.Endvorgaenge, 10);
        }

        let markerIcon = yellowMarker; // Varsayılan sarı

        // Değere göre renk belirleme
        if (top20.includes(value)) {
            markerIcon = redMarker; // En çok 20
            L.marker([station.Latitude, station.Longitude], { icon: markerIcon })
                .bindPopup(`<b>${station.Station_Name}</b><br>${text}: ${value}`)
                .addTo(AboveAvarageDensityLayer);
        } else if (bottom20.includes(value)) {
            markerIcon = greenMarker; // En az 20
            L.marker([station.Latitude, station.Longitude], { icon: markerIcon })
                .bindPopup(`<b>${station.Station_Name}</b><br>${text}: ${value}`)
                .addTo(UnderAvarageDensityLayer);
        } else {
            markerIcon = yellowMarker; // Orta değerler
            L.marker([station.Latitude, station.Longitude], { icon: markerIcon })
                .bindPopup(`<b>${station.Station_Name}</b><br>${text}: ${value}`)
                .addTo(AboutAvarageDensityLayer);
        }
    });
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
