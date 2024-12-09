<?php //---------------DB CONNECTION-------------------
$servername = "localhost";
$username = "root";
$password = ""; 
$dbname = "callabiketeam12";

$conn = new mysqli($servername, $username, $password, $dbname);

// check the connection
if ($conn->connect_error) {
    die("Erfolglose Verbindung: " . $conn->connect_error);
}

//---------------DB CONNECTION------------------- 
return $conn;
?>