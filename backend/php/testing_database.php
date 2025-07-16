<?php
$host = "localhost";
$username = "amanda";
$password = "mariadbaer";
$database = "realtor_project";

$connection = new mysqli("localhost", $username, $password, $database);

if ($connection->connect_error) {
    die("Connection failed: " . $connection->connect_error);
}
echo "Connected successfully <br>";

$insert_sql = "INSERT INTO properties_list (price, number_of_rooms, number_of_bathrooms, area_sqft, property_state, address_street, address_apartment, address_city, address_state, address_zip) VALUES (13000, 3, 2.5, 140.9, 1, '5996 Ridge Lake Cir', '', 'Vero Beach', 'Florida', 32967)";

if ($connection->query($insert_sql) === TRUE) {
    echo "New record created successfully<br>";
} else {
    echo "Error inserting data: " . $connection->error . "<br>";
}

$select_sql = "SELECT id, price, number_of_rooms, property_state FROM properties_list";
$result = $connection->query($select_sql);

if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        echo "ID: {$row['id']} | Price: {$row['price']} | Rooms: {$row['number_of_rooms']} | State: {$row['property_state']}<br>";
    }
} else {
    echo "no results <br>";
}

$connection->close();
?>