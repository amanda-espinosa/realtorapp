<?php
    require_once "connectDatabase.php";

    if (isset($_POST['id'], $_POST['latitude'], $_POST['longitude'])) {
        $id = intval($_POST['id']);
        $latitude = floatval($_POST['latitude']);
        $longitude = floatval($_POST['longitude']);

        $updateStatement = $connection->prepare("UPDATE properties_list SET latitude = ?, longitude = ? WHERE id = ?");
        $updateStatement->bind_param("ddi", $latitude, $longitude, $id);

        if ($updateStatement->execute()) {
            echo json_encode(["success" => true]);
        } else {
            echo json_encode(["success" => false, "error" => $connection->error]);
        }

    $updateStatement->close();
} else {
    
    echo json_encode(["success" => false, "error" => "Missing data"]);
}

?>