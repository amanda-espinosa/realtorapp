<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);

require_once __DIR__ . "/main.php";
$realtorapp->verifyLogin();

$realtorapp->verifyAdmin();

?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8" />
    <title>User Management</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <!-- Bootstrap & Icons -->
    <link rel="stylesheet" href="../../css/vendor/bootstrap-v5.3.8/bootstrap.min.css">
    <link rel="stylesheet" href="../../css/vendor/bootstrap-icons-v1.13.1/bootstrap-icons.css">
    <link rel="stylesheet" href="../css/manage_users.css">
    <script src="../../js/vendor/bootstrap-v5.3.8/bootstrap.bundle.min.js"></script>
    <script src="../../js/jquery-3.7.1.js"></script>
    <script src="../js/manage_users.js"></script>
</head>

<body>
    <!-- Header -->
    <div class="headerContainer">
        <header class="header">
            <h1 class="pageTitle">User Management</h1>
            <a id="logOutButton" class="realtorapp-btn" href="main.php?action=logout">Logout</a>
        </header>
    </div>
    <div id="notification" role="alert"></div>
    <!-- Table-->
    <div id="tableContainer" class="table-responsive glass-table-wrap">
        <table class="table table-striped table-hover align-middle">
            <thead id="thead">

            </thead>
            <tbody id="tbody">

            </tbody>
        </table>
    </div>
    <div class="modal fade" id="addUserModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog">
            <form id="addUserForm" class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Create New User</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>

                <div class="modal-body">
                    <div class="mb-3">
                        <label class="form-label">Email</label>
                        <input id="newUserEmail" name="email" type="email" class="form-control" required>
                    </div>

                    <div class="mb-3">
                        <label class="form-label">Username</label>
                        <input id="newUsername" name="username" type="text" class="form-control" required>
                    </div>

                    <div class="mb-3">
                        <label class="form-label">Password</label>
                        <input id="newPassword" name="password" type="password" class="form-control" required
                            minlength="6">
                    </div>

                    <div class="mb-3">
                        <label class="form-label">Role</label>
                        <select id="newRole" name="role" class="form-select">
                            <option value="ADMIN">ADMIN</option>
                            <option value="MAINTAINER">MAINTAINER</option>
                        </select>
                    </div>

                    <div id="addUserError" class="text-danger small d-none"></div>
                    <div id="addUserSuccess" class="text-success small d-none"></div>
                </div>

                <div class="modal-footer">
                    <button type="button" class="btn" data-bs-dismiss="modal">Cancel</button>
                    <button id="createUserBtn" type="submit" class="btn">Create</button>
                </div>
            </form>
        </div>
    </div>
    <div class="modal fade" id="confirmModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="confirmTitle">Confirm</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>

                <div class="modal-body" id="confirmBody">
                    Are you sure?
                </div>

                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal"
                        id="confirmCancel">Cancel</button>
                    <button type="button" class="btn btn-danger" id="confirmOk">Delete</button>
                </div>
            </div>
        </div>
    </div>
</body>

</html>