<?php
    $host = 'localhost';
    $user = 'amanda';
    $password = 'mariadbaer';
    $mysqli = new mysqli($host, $user, $password);
    
    if($mysqli→connect_errno ) {
    printf("Connect failed: %s",
    $mysqli→connect_error);
    exit();
    }
    printf('Connected successfully');
    $mysqli→close();
?>