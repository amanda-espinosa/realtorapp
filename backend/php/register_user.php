<?php
require_once __DIR__ . "/main.php";
$users = $realtorapp->requestUsers();
if (!empty($users["users"])) {
    header("Location: ../html/login.html");
    exit();
}
?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>User Registration</title>
    <link rel="stylesheet" href="../../css/vendor/bootstrap-v5.3.8/bootstrap.min.css">
    <link rel="stylesheet" href="../../css/vendor/bootstrap-icons-v1.13.1/bootstrap-icons.css">
    <link rel="stylesheet" href="../css/manage_users.css">
    <link rel="stylesheet" href="../css/register_user.css">

    <link rel="apple-touch-icon" sizes="180x180" href="/wordpress/realtorapp/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="/wordpress/realtorapp/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="/wordpress/realtorapp/favicon-16x16.png">
    <link rel="manifest" href="/wordpress/realtorapp/site.webmanifest">

    <script src="../js/register_user.js"></script>
</head>

<body>
    <main>
        <div id="mainContainer">
        </div>
        <div id="formContainer">
            <form id="registerUserForm" action="">
                <h2>Create an account</h2>
                <br><br>
                <label>Email:</label>
                <input id="email" type="email" name="email" placeholder="Email" required>
                <label>Username:</label>
                <input id="username" type="text" name="username" placeholder="Username" required>
                <label>Password:</label>
                <input id="password" type="password" name="password" placeholder="Password" required>
                <br><br>
                <div class="saveButtonContainer">
                    <button type="button" id="register">Register</button>
                </div>
            </form>
        </div>
    </main>
    <div id="notification" role="alert"></div>
</body>

</html>
