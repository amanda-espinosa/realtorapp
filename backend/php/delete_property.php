<?php
    require_once "connectDatabase.php";

    header("Content-Type: application/json");

    if (!isset($_POST["id"])) {
        echo json_encode([
            "success" => false,
            "error" => "Missing property id"
        ]);
        exit;
    }

    $propertyId = intval($_POST["id"]);

    $statement = $connection->prepare("DELETE FROM properties_list WHERE id = ?");
    if (!$statement) {
        echo json_encode([
            "success" => false,
            "error" => $connection->error
        ]);
        exit;
    }

    $statement->bind_param("i", $propertyId);

    if ($statement->execute()) {
        echo json_encode(["success" => true]);
    } else {
        echo json_encode([
            "success" => false,
            "error" => $statement->error
        ]);
    }

    function rrmdir($directory) {
    if (!is_dir($directory)) return;
    foreach (scandir($directory) as $file) {
        if ($file === '.' || $file === '..') continue;
        $path = "$directory/$file";
        if (is_dir($path)) {
            rrmdir($path);
        } else {
            @unlink($path);
        }
    }
    @rmdir($directory);
}

    $imagesDir = __DIR__ . "/../img/$propertyId";
    rrmdir($imagesDir);

    echo json_encode(["success" => true]);

    $statement->close();
    $connection->close();
?>