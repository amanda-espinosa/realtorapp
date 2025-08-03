<?php

require_once("connectDatabase.php");

if (!isset($_POST['id'])) {
    http_response_code(400);
    echo json_encode(["error" => "Missing property ID"]);
    exit;
}

$propertyId = intval($_POST['id']);

$connection = new mysqli($host, $user, $password, $database);

if ($connection->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "Database connection failed"]);
    exit;
}

$stmt = $connection->prepare("UPDATE properties_list SET views_count = views_count + 1 WHERE id = ?");
$stmt->bind_param("i", $propertyId);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "View count updated"]);
} else {
    http_response_code(500);
    echo json_encode(["error" => "Failed to update view count"]);
}

$stmt->close();
$connection->close();
?>