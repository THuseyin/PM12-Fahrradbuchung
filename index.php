<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Map Visualization</title>
    <link rel="stylesheet" href="css/styles.css">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.1/css/all.min.css"
        integrity="sha512-5Hs3dF2AEPkpNAR7UiOHba+lRSJNeM2ECkwxUIxC1Q/FLycGTbNapWXB4tP889k5T5Ju8fs4b1P5z/iB4nMfSQ=="
        crossorigin="anonymous" referrerpolicy="no-referrer" />
    <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600&family=Roboto:wght@400;700&display=swap"
        rel="stylesheet">
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
        integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>


</head>

<body>
    <div class="container">
        <div id="map"></div>
         <div id="station-panel" class="station-panel">
            <div class="panel-header">
                <h3>Detailed Station Information</h3>
                <button id="close-panel-button" class="close-button">
                    <i class="fas fa-times"></i>
                </button>
            </div>
           <div id="panel-content">
           </div>
        </div>
        <div class="filters-overlay">
            <div class="filters-container">
                <div class="search-container">
                    <input type="text" id="search-input" placeholder="Search...">
                </div>
                <form id="visualization-filters">
                    <div class="form-column">
                         <div class="booking-type-options">
                            <label>
                                <input type="radio" name="booking-type" value="start" checked> Startbuchungen
                            </label>
                            <label>
                                <input type="radio" name="booking-type" value="end"> Endbuchungen
                            </label>
                        </div>
                    </div>
                    <div class="form-column">
                         <div class="dropdown-group">
                            <div class="dropdown">
                                <button class="dropdown-button">Booking Portals</button>
                                <div id="booking-portals" class="dropdown-content">
                                    <label><input type="checkbox" name="portals[]" value="iPhone CAB" checked> iPhone CAB</label>
                                    <label><input type="checkbox" name="portals[]" value="IVR" checked> IVR</label>
                                    <label><input type="checkbox" name="portals[]" value="Android CAB" checked> Android CAB</label>
                                    <label><input type="checkbox" name="portals[]" value="Windows" checked> Windows</label>
                                    <label><input type="checkbox" name="portals[]" value="LIDL-BIKE" checked> LIDL-BIKE</label>
                                    <label><input type="checkbox" name="portals[]" value="Techniker F_5 (-67212-)" checked>
                                        Techniker
                                        F_5 (-67212-)</label>
                                    <label><input type="checkbox" name="portals[]" value="iPhone SRH" checked> iPhone SRH</label>
                                    <label><input type="checkbox" name="portals[]" value="Android SRH" checked> Android SRH</label>
                                    <label><input type="checkbox" name="portals[]" value="iPhone KON" checked> iPhone KON</label>
                                </div>
                            </div>
                            <div class="dropdown">
                                <button class="dropdown-button">Days of the Week</button>
                                <div id="days-of-week" class="dropdown-content">
                                    <label>
                                        <input type="checkbox" name="days[]" value="Mo" checked> Monday
                                    </label>
                                    <label>
                                        <input type="checkbox" name="days[]" value="Di" checked> Tuesday
                                    </label>
                                    <label>
                                        <input type="checkbox" name="days[]" value="Mi" checked> Wednesday
                                    </label>
                                    <label>
                                        <input type="checkbox" name="days[]" value="Do" checked> Thursday
                                    </label>
                                    <label>
                                        <input type="checkbox" name="days[]" value="Fr" checked> Friday
                                    </label>
                                    <label>
                                        <input type="checkbox" name="days[]" value="Sa" checked> Saturday
                                    </label>
                                    <label>
                                        <input type="checkbox" name="days[]" value="So" checked> Sunday
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
                  <div class="button-container">
                      <button type="button" id="refresh-database">Refresh Database</button>
                  </div>
            </div>
        </div>
    </div>


    <script type="module" src="js/app.js"></script>

</body>

</html>