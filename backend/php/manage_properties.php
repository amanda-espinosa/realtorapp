<?php
require_once __DIR__ . "/main.php";
$realtorapp->verifyLogin();

?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Manage Properties</title>
    <link rel="stylesheet" href="../../css/vendor/bootstrap-v5.3.8/bootstrap.min.css">
    <link rel="stylesheet" href="../../css/vendor/bootstrap-icons-v1.13.1/bootstrap-icons.css">
    <link rel="stylesheet" href="../css/manage_properties.css">
    <!-- Phones: up to 768px -->
    <link rel="stylesheet" href="../css/manage_properties_mobil.css" media="only screen and (max-width: 768px)">
    <!-- Tablets: 768px–991.98px -->
    <link rel="stylesheet" href="../css/manage_properties_tablet.css"
        media="only screen and (min-width: 768px) and (max-width: 991.98px)">
    <!-- Desktops: 992px and up -->
    <link rel="stylesheet" href="../css/manage_properties_desktop.css" media="only screen and (min-width: 992px)">

    <link rel="stylesheet" href="../../css/leaflet.css">

    <link rel="apple-touch-icon" sizes="180x180" href="/wordpress/realtorapp/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="/wordpress/realtorapp/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="/wordpress/realtorapp/favicon-16x16.png">
    <link rel="manifest" href="/wordpress/realtorapp/site.webmanifest">

    <script src="../../js/jquery-3.7.1.js"></script>
    <script src="../../js/leaflet.js"></script>
    <script src="../js/manage_properties.js"></script>
</head>

<body>
    <main>
        <nav id="menu">
            <ul>
                <li id="addProperty"><a href="">+ Add property</a></li>
                <li id="logout"><a href="main.php?action=logout">Logout</a></li>
            </ul>
        </nav>
        <div id="main-info">
            <div class="box-left" id="houseListContainer">
            </div>
            <div class="box-right">
                <div id="map"></div>
            </div>
        </div>
        <div id="pagination">
            <div id="paginationControls"></div>
        </div>
    </main>
</body>

</html>
