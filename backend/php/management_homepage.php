<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);

require_once __DIR__ . "/main.php";
$realtorapp->verifyLogin();
$username = $realtorapp->getLoggedUsername();

$msg = "";
if (($_GET["error"] ?? "") === "admin_required") {
    $msg = "You must be an admin to access Manage Users.";
}

?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8" />
    <title>Management Homepage</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <!-- Bootstrap & Icons -->
    <link rel="stylesheet" href="../../css/vendor/bootstrap-v5.3.8/bootstrap.min.css">
    <link rel="stylesheet" href="../../css/vendor/bootstrap-icons-v1.13.1/bootstrap-icons.css">
    <link rel="stylesheet" href="../css/management_homepage.css">
    <script src="../../js/jquery-3.7.1.js"></script>
</head>

<body>
    <?php if ($msg): ?>
    <div class="alert alert-warning m-3" role="alert">
        <?= htmlspecialchars($msg, ENT_QUOTES, "UTF-8") ?>
    </div>
    <?php endif; ?>

    <header class="header">
        <div class="titleContainer">
            <h1 class="pageTitle">Realtor App Management</h1><br>
            <h1 id="greating">Hello <?= htmlspecialchars($username ?? 'User', ENT_QUOTES, 'UTF-8') ?>!</h1>
        </div>
        <div id="logOutButtonWrapper">
            <a id="logOutButton" class="btn" href="main.php?action=logout">Logout</a>
        </div>
    </header>
    <div id="btnWrapperContainer">
        <a id="manageProperties" class="largeBtn btn" href="manage_properties.php">Manage Properties</a>
        <?php if ($realtorapp->isAdmin()):?>
        <a id="manageUsers" class="largeBtn btn" href="manage_users.php">Manage Users</a>
        <?php endif;?>

    </div>
</body>

</html>