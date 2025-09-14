<?php
    require_once "config.php";
    
    $config = json_decode(file_get_contents($settingsPath . 'RealtorAppSettings.json'), true);
    $connection = new mysqli($config['host'], $config['user'], $config['password'], $config['database']);
    
    if ($connection->connect_errno) {
        printf("Connect failed: %s", $connection->connect_error);
        exit();
    }
?>