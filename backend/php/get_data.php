<?php
// Allow requests from any origin
header('Access-Control-Allow-Origin: *');

// Specify allowed methods
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');

// Specify allowed headers
header('Access-Control-Allow-Headers: Content-Type');
// Set the header to indicate JSON content
header('Content-Type: application/json');
/**This line sets the HTTP response header to inform the client that the content being returned is in JSON format. This is crucial for clients (like browsers or JavaScript applications) to correctly parse and handle the response data.
Sentry */

// Simulate house data as if retrieved from a database
/**Here, we're creating a PHP array named $houses that contains multiple associative arrays. Each associative array represents a house. This simulates data that might typically be retrieved from a database. */

$houses = [];
$columnNames = [];

$host = "localhost";
$username = "amanda";
$password = "mariadbaer";
$database = "realtor_project";

$connection = mysqli_connect($host, $username, $password, $database) or
    die("Connection lost!");

$columnNameResult = mysqli_query($connection, "SELECT `COLUMN_NAME` FROM `INFORMATION_SCHEMA`.`COLUMNS` 
                                            WHERE `TABLE_SCHEMA`='realtor_project' 
                                            AND `TABLE_NAME`='properties_list';") or
    die("Error when selecting:" . mysqli_error($connection));

while ($dataArray = mysqli_fetch_array($columnNameResult)) {
  $columnNames[] = $dataArray['COLUMN_NAME']; 
}

$dataSelection = mysqli_query($connection, "SELECT * FROM properties_list") or
    die("Error when selecting:" . mysqli_error($connection));

while ($dataArray = mysqli_fetch_array($dataSelection)) {
    $house = [];
    foreach ($columnNames as $columnName) {
        $house[$columnName] = $dataArray[$columnName];
    }
    $houses[] = $house; 
}
mysqli_close($connection);

/*Convert the array of houses to JSON format and output it.
The json_encode() function converts the PHP array into a JSON-formatted string. The echo statement then outputs this JSON string as the response. This allows client-side applications to fetch and utilize the data seamlessly.
 */
echo json_encode($houses);
?>