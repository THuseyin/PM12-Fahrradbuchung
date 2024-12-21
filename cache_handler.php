<?php
//Handles data caching and refreshes if needed

header('Content-Type: application/json');

$stationsCacheFilePath = './json/stations.json';
$cacheExpiryTime = 60 * 60; // 1 hour in seconds

// Function to fetch fresh data from the database
function fetchFreshData() {
    
    // Connect to the database
    $connection = include("dbcon.php");

    if (!$connection) {
        http_response_code(500);
        echo json_encode(["error" => "Database connection error: " . mysqli_connect_error()]);
        exit;
    }
    $connection->set_charset("utf8mb4");

    // Query the database
    $query = "SELECT Station_ID, Station_Name, Latitude, Longitude, Startvorgaenge, Endvorgaenge FROM stations";
    $result = $connection->query($query);

    if (!$result) {
        http_response_code(500);
        echo json_encode(["error" => "Database query error: " . mysqli_error($connection)]);
        $connection->close();
        exit;
    }

    $data = [];
    if ($result && $result->num_rows > 0) {
        // Loop through each row and add it to the array
        while ($row = $result->fetch_assoc()) {
            $data[] = $row;
        }
    } else {
        echo "No data found in the 'stations' table.";
        exit; // Exit if there are no results
    }


    // Free result and close connection
    $connection->close();
    return $data;
}

// Check if the cache file exists
if (file_exists($stationsCacheFilePath)) {
    $cacheContent = json_decode(file_get_contents($stationsCacheFilePath), true);

    if (isset($cacheContent['timestamp'], $cacheContent['data'])) {
        $cacheAge = time() - $cacheContent['timestamp'];

        // Check if cache is still valid
        if ($cacheAge < $cacheExpiryTime) {
            echo json_encode($cacheContent['data']);
            exit;
        }
    }
}

// If no valid cache, fetch fresh data
$data = fetchFreshData();

// Save new data to cache
$cacheData = [
    'timestamp' => time(),
    'data' => $data
];

file_put_contents($stationsCacheFilePath, json_encode($cacheData, JSON_PRETTY_PRINT));

// Return the fresh data
echo json_encode($data);
?>
