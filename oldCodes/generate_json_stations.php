<?php
// Include the dbcon.php file to establish a database connection
$conn = include("dbcon.php");

// Check if the connection is valid
if (!$conn || !($conn instanceof mysqli)) {
    die("Error: Failed to establish a database connection.");
}

// Set the character set to handle special characters
$conn->set_charset("utf8mb4");

// Prepare the SQL query to retrieve data from the 'stations' table
$sql = "SELECT Station_ID, Station_Name, Latitude, Longitude, Startvorgaenge, Endvorgaenge FROM stations";

// Execute the query and fetch results
$result = $conn->query($sql);

$stations = [];
if ($result && $result->num_rows > 0) {
    // Loop through each row and add it to the array
    while ($row = $result->fetch_assoc()) {
        $stations[] = $row;
    }
} else {
    echo "No data found in the 'stations' table.";
    exit; // Exit if there are no results
}

// Convert the data to JSON format
$jsonData = json_encode($stations, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

$jsonFilePath = "./json/stations.json";

// Save the JSON data to the file
if (file_put_contents($jsonFilePath, $jsonData)) {
    echo "JSON file created successfully: $jsonFilePath";
} else {
    echo "Error: Failed to create the JSON file.";
}

// Close the database connection
$conn->close();
?>
