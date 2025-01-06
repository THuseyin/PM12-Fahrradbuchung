<?php
header('Content-Type: application/json');

$stationsCacheFilePath = './json/routes.json'; // Cache file for the routes data
$cacheExpiryTime = 60 * 60; // 1 hour in seconds

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

    // Base SQL query
     $query = "SELECT * FROM routes WHERE 1=1";

    // Add filters to the query
    $params = [];
    $types = "";
    
    // Handle Booking Portals
    if(isset($filters['portals']) && is_array($filters['portals'])){
        $placeholders = implode(',', array_fill(0, count($filters['portals']), '?'));
        $query .= " AND Buchungsportal IN ($placeholders)";
        $params = array_merge($params, $filters['portals']);
        $types .= str_repeat('s', count($filters['portals']));
    }
    
    // Handle Days of the Week
    if(isset($filters['days']) && is_array($filters['days'])){
        $placeholders = implode(',', array_fill(0, count($filters['days']), '?'));
        $query .= " AND Wochentag IN ($placeholders)";
        $params = array_merge($params, $filters['days']);
        $types .= str_repeat('s', count($filters['days']));
    }
    
    $stmt = $connection->prepare($query);

    if (!$stmt) {
        $error = "Database query prepare error: " . $connection->error;
        http_response_code(500);
        echo json_encode(["error" => $error]);
         $connection->close();
        exit;
    }
    
    if(!empty($params)) {
         $stmt->bind_param($types, ...$params);
    }

    if (!$stmt->execute()) {
         $error = "Statement execution error: " . $stmt->error;
          http_response_code(500);
          echo json_encode(["error" => $error]);
           $stmt->close();
          $connection->close();
          exit;
    }

    $result = $stmt->get_result();

    $data = [];
    if ($result) {
        if ($result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                 $data[] = $row;
            }
        }
        else {
            // Check column names directly from the result metadata
            $fields = $result->fetch_fields();
            $columnNames = [];
            if($fields){
              foreach ($fields as $field) {
                $columnNames[] = $field->name;
              }
            }
           
            $error = "No data found in the 'routes' table. Available columns: " . implode(", ", $columnNames);
            $data = ["error" => $error];

        }
    } else {
         $error = "Error getting result" ;
           $data = ["error" => $error];
    }
   
    $stmt->close();
    $connection->close();
    return $data;
}

if (file_exists($stationsCacheFilePath)) {
    $cacheContent = json_decode(file_get_contents($stationsCacheFilePath), true);
   
    if (isset($cacheContent['timestamp'], $cacheContent['data']) && isset($_GET['filters'])) {
         $cacheAge = time() - $cacheContent['timestamp'];
        $receivedFilters = json_decode($_GET['filters'], true);
        $cachedFilters = isset($cacheContent['filters']) ? $cacheContent['filters'] : [];

        if ($cacheAge < $cacheExpiryTime && $receivedFilters == $cachedFilters) {
            echo json_encode($cacheContent['data']);
            exit;
        }
    }
}

// Retrieve filters from GET request
$filters = isset($_GET['filters']) ? json_decode($_GET['filters'], true) : [];

$data = fetchFilteredData($filters);


$cacheData = [
    'timestamp' => time(),
    'filters' => $filters,
    'data' => $data
];

file_put_contents($stationsCacheFilePath, json_encode($cacheData, JSON_PRETTY_PRINT));

echo json_encode($data);
?>