<?php 


header('Content-Type: application/json');

ob_start(); 
include 'cache_handler.php'; 
$response = ob_get_clean(); 
if ($response) {
    echo $response;
} else {
    http_response_code(500);
    echo json_encode(["error" => "No response from cache_handler.php"]);
}



?>