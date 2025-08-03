<?php
$propertyId = $_GET['id'];
$directoryPath = __DIR__ . "/../img/$propertyId"; 
$baseUrl = "http://127.0.0.1/RealtorProject/backend/img/$propertyId"; 
$images = [];

if (is_dir($directoryPath)) {
    $files = scandir($directoryPath);
    foreach ($files as $file) {
        if ($file !== "." && $file !== "..") {
            $images[] = "$baseUrl/$file";
        }
    }
}

header('Content-Type: application/json');
echo json_encode($images);
?>