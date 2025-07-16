<?php
// Allow any origin to access this resource (for development only)
header('Access-Control-Allow-Origin: *'); //Tengo que reemplazar * por el dominio especifico

// Allow specific methods (optional but useful)
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');

// Allow specific headers
header('Access-Control-Allow-Headers: Content-Type');

header('Content-Type: application/json');
$host = "localhost";
$user = "amanda";
$password = "mariadbaer";
$database = "realtor_project";

$connection = new mysqli($host, $user, $password, $database);
if ($connection->connect_error) {
    die("Connection failed: " . $connection->connect_error);
}

$id = intval($_GET['id']);
$query = "SELECT * FROM properties_list WHERE id = $id";
$result = $connection->query($query);

if ($result && $row = $result->fetch_assoc()) {
    echo json_encode($row);
} else {
    echo json_encode(["error" => "House not found"]);
}

$connection->close();
?>