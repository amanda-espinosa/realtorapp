<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

require_once "connectDatabase.php";

$houses = [];
$columnNames = [];
$database = $config['database']; 

$numberOfHouses = isset($_GET['numberOfHouses']) ? (int)$_GET['numberOfHouses'] : 10;
$startingPoint  = isset($_GET['startingPoint']) ? (int)$_GET['startingPoint'] : 0;

$columnNameResult = mysqli_query($connection, "
    SELECT COLUMN_NAME 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = '$database'
    AND TABLE_NAME = 'properties_list'
") or die(json_encode(["error" => mysqli_error($connection)]));

while ($dataArray = mysqli_fetch_array($columnNameResult)) {
    $columnNames[] = $dataArray['COLUMN_NAME']; 
}

$countRows = mysqli_query($connection, "SELECT COUNT(*) AS total FROM properties_list")
    or die(json_encode(["error" => mysqli_error($connection)]));
$totalRows = (int)mysqli_fetch_assoc($countRows)['total'];

$query = "SELECT * FROM properties_list LIMIT $numberOfHouses OFFSET $startingPoint";
$dataSelection = mysqli_query($connection, $query)
    or die(json_encode(["error" => mysqli_error($connection)]));

while ($dataArray = mysqli_fetch_assoc($dataSelection)) {
    $house = [];
    foreach ($columnNames as $columnName) {
        $house[$columnName] = $dataArray[$columnName];
    }
    $houses[] = $house; 
}

mysqli_close($connection);

echo json_encode([
    "totalRows" => $totalRows,
    "houses" => $houses
]);
?>