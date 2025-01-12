<?php
header('Content-Type: application/json');

$stationsCacheFilePath = './json/stations.json';
$cacheExpiryTime = 60 * 60; // 1 hour

ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', dirname(__FILE__) . '/error_log_station.txt');
error_reporting(E_ALL);

function fetchAllStations() {
    $connection = include("dbcon.php");
    if (!$connection) {
        http_response_code(500);
        echo json_encode(["error" => "Database connection error: " . mysqli_connect_error()]);
        exit;
    }
    $connection->set_charset("utf8mb4");

    $query = "SELECT * FROM stations";


    $stmt = $connection->prepare($query);
    if (!$stmt) {
        echo json_encode(["error" => "Query preparation failed: " . $connection->error]);
        exit;
    }

    if (!$stmt->execute()) {
        echo json_encode(["error" => "Query execution failed: " . $stmt->error]);
        exit;
    }

    $result = $stmt->get_result();
    $data = $result->fetch_all(MYSQLI_ASSOC);
    $stmt->close();
    $connection->close();
    return $data;
}

if (file_exists($stationsCacheFilePath)) {
    $cacheContent = json_decode(file_get_contents($stationsCacheFilePath), true);
    if (isset($cacheContent['timestamp'], $cacheContent['data'])) {
        $cacheAge = time() - $cacheContent['timestamp'];
        if ($cacheAge < $cacheExpiryTime) {
            echo json_encode($cacheContent['data']);
            exit;
        }
    }
}

$data = fetchAllStations();

$cacheData = [
    'timestamp' => time(),
    'data' => $data
];

file_put_contents($stationsCacheFilePath, json_encode($cacheData, JSON_PRETTY_PRINT));

echo json_encode($data);
?>