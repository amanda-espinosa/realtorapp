<?php
    $host = 'localhost';
    $user = 'amanda';
    $password = 'mariadbaer';
    $database = 'realtor_project';

    $connection = new mysqli($host, $user, $password, $database);
    
    if ($connection->connect_errno) {
        printf("Connect failed: %s", $connection->connect_error);
        exit();
    }
?>