<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <link rel="stylesheet" href="css/styles.css">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.1/css/all.min.css"
        integrity="sha512-5Hs3dF2AEPkpNAR7UiOHba+lRSJNeM2ECkwxUIxC1Q/FLycGTbNapWXB4tP889k5T5Ju8fs4b1P5z/iB4nMfSQ=="
        crossorigin="anonymous" referrerpolicy="no-referrer" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
        integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>

</head>

<body>
    <!-- Header -->
    <?php include 'includes/header.php'; ?>

    <main>
        <div id="map"></div>
        <button type="button" id="refresh-database">RefreshDatabase</button>
        <!-- Filters for both visualizations -->
        <form id="visualization-filters">
            <h3>Filter Options</h3>

            <!-- Filters for the first visualization -->
            <fieldset>
                <legend>First Visualization</legend>
                <h4>Booking Type</h4>
                <label>
                    <input type="radio" name="booking-type" value="start" checked> Startbuchungen
                </label>
                <label>
                    <input type="radio" name="booking-type" value="end"> Endbuchungen
                </label>

                <h4>Booking Portals</h4>
                <!-- Booking portals as checkboxes -->
                <div id="booking-portals">
                    <label><input type="checkbox" name="portals[]" value="iPhone CAB" checked> iPhone CAB</label>
                    <label><input type="checkbox" name="portals[]" value="IVR" checked> IVR</label>
                    <label><input type="checkbox" name="portals[]" value="Android CAB" checked> Android CAB</label>
                    <label><input type="checkbox" name="portals[]" value="Windows" checked> Windows</label>
                    <label><input type="checkbox" name="portals[]" value="LIDL-BIKE" checked> LIDL-BIKE</label>
                    <label><input type="checkbox" name="portals[]" value="Techniker F_5 (-67212-)" checked> Techniker
                        F_5 (-67212-)</label>
                    <label><input type="checkbox" name="portals[]" value="iPhone SRH" checked> iPhone SRH</label>
                    <label><input type="checkbox" name="portals[]" value="Android SRH" checked> Android SRH</label>
                    <label><input type="checkbox" name="portals[]" value="iPhone KON" checked> iPhone KON</label>
                </div>
            </fieldset>

            <!-- Filters for the second visualization -->
            <fieldset>
                <legend>Second Visualization</legend>
                <h4>Days of the Week</h4>
                <label>
                    <input type="checkbox" name="days[]" value="Monday" checked> Monday
                </label>
                <label>
                    <input type="checkbox" name="days[]" value="Tuesday" checked> Tuesday
                </label>
                <label>
                    <input type="checkbox" name="days[]" value="Wednesday" checked> Wednesday
                </label>
                <label>
                    <input type="checkbox" name="days[]" value="Thursday" checked> Thursday
                </label>
                <label>
                    <input type="checkbox" name="days[]" value="Friday" checked> Friday
                </label>
                <label>
                    <input type="checkbox" name="days[]" value="Saturday" checked> Saturday
                </label>
                <label>
                    <input type="checkbox" name="days[]" value="Sunday" checked> Sunday
                </label>
            </fieldset>

            <button type="button" id="apply-filters">Apply Filters</button>
        </form>

    </main>

    <?php include 'includes/footer.php'; ?>




    <script type="module" src="js/map.js"></script>
    <!-- <script src="js/form.js"></script> -->
    <script type="module" src="js/app.js"></script>
</body>

</html>