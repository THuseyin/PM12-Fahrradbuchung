<?php
header('Content-Type: application/json');

$stationsCacheFilePath = './json/routes.json';
$cacheExpiryTime = 60 * 60;

ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', dirname(__FILE__) . '/error_log.txt');
error_reporting(E_ALL);

function fetchFilteredData($filters) {
    $connection = include("dbcon.php");
    if (!$connection) {
        http_response_code(500);
        echo json_encode(["error" => "Database connection error: " . mysqli_connect_error()]);
        exit;
    }
    $connection->set_charset("utf8mb4");

    $query = "SELECT * FROM routes WHERE 1=1";
    $params = [];
    $types = "";

    if (isset($filters['portals']) && is_array($filters['portals'])) {
        $placeholders = implode(',', array_fill(0, count($filters['portals']), '?'));
        $query .= " AND Buchungsportal IN ($placeholders)";
        $params = array_merge($params, $filters['portals']);
        $types .= str_repeat('s', count($filters['portals']));
    }

    if (isset($filters['days']) && is_array($filters['days'])) {
        $placeholders = implode(',', array_fill(0, count($filters['days']), '?'));
        $query .= " AND Wochentag IN ($placeholders)";
        $params = array_merge($params, $filters['days']);
        $types .= str_repeat('s', count($filters['days']));
    }

    $stmt = $connection->prepare($query);
    if (!$stmt) {
        echo json_encode(["error" => "Query preparation failed: " . $connection->error]);
        exit;
    }

    if (!empty($params)) {
        $stmt->bind_param($types, ...$params);
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
    if (isset($cacheContent['timestamp'], $cacheContent['data']) && isset($_GET['filters'])) {
        $cacheAge = time() - $cacheContent['timestamp'];
        $receivedFilters = json_decode($_GET['filters'], true);
        $cachedFilters = $cacheContent['filters'] ?? [];
        $receivedStationID = $_GET['stationID'] ?? null;

        if ($cacheAge < $cacheExpiryTime && $receivedFilters == $cachedFilters && $receivedStationID == ($cacheContent['stationID'] ?? null)) {
            echo json_encode($cacheContent['data']);
            exit;
        }
    }
}

$filters = isset($_GET['filters']) ? json_decode($_GET['filters'], true) : [];
$stationID = $_GET['stationID'] ?? null;

// Fetch data: if stationID is empty, fetch all data
$data = fetchFilteredData($filters);

// If no stationID is provided, fetch all routes
if (empty($stationID)) {
    $data = fetchFilteredData($filters);
}

$cacheData = [
    'timestamp' => time(),
    'filters' => $filters,
    'data' => $data
];

file_put_contents($stationsCacheFilePath, json_encode($cacheData, JSON_PRETTY_PRINT));

echo json_encode($data);
?>
