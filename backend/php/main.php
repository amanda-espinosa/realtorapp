<?php
error_reporting(E_ALL);
ini_set("display_errors", 1);
ini_set("display_startup_errors", 1);

require_once __DIR__ . "/config.php";
require_once __DIR__ . "/RealtorApp.php";

$realtorapp = new RealtorApp($settingsPath);

if (isset($_GET['action'])) {

    switch ($_GET['action'])
    {
        case "createProperty"       : createProperty();         break;
        case "createUser"           : createUser();             break;
        case "deleteProperty"       : deleteProperty();         break;
        case "deleteUserById"       : deleteUserById();         break;
        case "editProperty"         : editProperty();           break;
        case "getOpenCageKey"       : getOpenCageKey();         break;
        case "getPropertyImages"    : getPropertyImages();      break;
        case "getPropertyList"      : getPropertyList();        break;
        case "incrementViews"       : incrementViews();         break;
        case "login"                : login();                  break;
        case "logout"               : logout();                 break;
        case "propertyDefinition"   : propertyDefinition();     break;
        case "registerUser"         : registerUser();           break;
        case "requestUsers"         : requestUsers();           break;
        case "sendForm"             : sendForm();               break;
        case "updateCoordinates"    : updateCoordinates();      break;
        case "updateUserRole"       : updateUserRole();         break;
    }
}

function createProperty() {
    global $realtorapp;
    $realtorapp->verifyLogin();

    if (!isset($_POST["property"])) {
        echo json_encode([
            "success" => false,
            "error" => "Missing property"
        ]);
        exit;
    }

    $images = isset($_FILES['images']) ? $_FILES['images'] : [];

    $result = $realtorapp->createProperty($_POST["property"], $images);
    echo json_encode($result);
}

function createUser() {
    global $realtorapp;
    if (($_GET["action"] ?? "") === "createUser") {

        header("Content-Type: application/json; charset=utf-8");

        $realtorapp->verifyLogin();
        $realtorapp->verifyAdmin();

        $input = json_decode(file_get_contents("php://input"), true);

        $email = trim($input["email"] ?? "");
        $username = trim($input["username"] ?? "");
        $password = $input["password"] ?? "";
        $role = $input["role"] ?? "";

        echo json_encode($realtorapp->createUser($email, $username, $password, $role));
        exit;
    }
}

function deleteProperty() {
    global $realtorapp;
    $realtorapp->verifyLogin();

    if (!isset($_POST["id"])) {
        echo json_encode(["success" => false, "error" => "Missing property id"]);
        return;
    }
    $result = $realtorapp->deleteProperty($_POST["id"]);
    echo json_encode($result);
}

function deleteUserById() {
    global $realtorapp;

    header("Content-Type: application/json; charset=utf-8");
    ini_set('display_errors', 0);

    $realtorapp->verifyLogin();
    $realtorapp->verifyAdmin();

    $input = json_decode(file_get_contents("php://input"), true) ?? [];
    $id = (int)($input["id"] ?? 0);

    echo json_encode($realtorapp->deleteUserById($id));
    exit;
}

function editProperty() {
    global $realtorapp;
    $realtorapp->verifyLogin();

    if (!isset($_POST["property"])) {
        echo json_encode([
            "success" => false,
            "error" => "Missing property"
        ]);
        exit;
    }

    $images = isset($_FILES['images']) ? $_FILES['images'] : [];

    $result = $realtorapp->editProperty($_POST["property"], $images);
    echo json_encode($result);
}

function getOpenCageKey() {
    global $realtorapp;

    $result = $realtorapp->getOpenCageKey();
    echo $result;
}

function getPropertyImages() {
    global $realtorapp;

    if (isset($_GET['id'])) {
        $images = $realtorapp->getPropertyImages($_GET['id']);
        echo json_encode($images);
    } else {
        echo json_encode(["success" => false, "error" => "Missing data"]);
    }
}

function getPropertyList() {
    global $realtorapp;

    $numberOfHouses = isset($_GET['numberOfHouses']) ? (int)$_GET['numberOfHouses'] : 10;
    $startingPoint  = isset($_GET['startingPoint']) ? (int)$_GET['startingPoint'] : 0;

    $propertyList = $realtorapp->getPropertyList($numberOfHouses, $startingPoint);

    echo json_encode($propertyList);
}

function incrementViews() {
    global $realtorapp;

    if (isset($_POST['id'])) {
        $result = $realtorapp->incrementViews($_POST['id']);
        echo json_encode($result);
    } else {
        echo json_encode(["success" => false, "error" => "Missing data"]);
    }
}

function login()
{
    global $realtorapp;
    $login = $realtorapp->login($_POST['email'], $_POST['password'], isset($_POST['remember']));
    if ($login['success']) {
        header("Location: management_homepage.php");
        exit;
    }
    else {
        echo $login['message'];
    }
}

function logout()
{
    global $realtorapp;
    $logOutResult = $realtorapp->logout();

        if ($logOutResult['success']) {
            header("Location: ../html/login.html");
            exit;
        }
        else {
            echo $logOutResult['message'];
        }
}

function propertyDefinition() {
    global $realtorapp;
    $result = $realtorapp->propertyDefinition();
    echo json_encode($result);
}

function registerUser()
{
    global $realtorapp;
    $registerUserResult = $realtorapp->registerUser(
        $_POST['email'],
        $_POST['username'],
        $_POST['password']
    );
    echo json_encode($registerUserResult);
}

function requestUsers() {
    global $realtorapp;
    header('Content-Type: application/json; charset=utf-8');
    $realtorapp->verifyLogin();

    $result = $realtorapp->requestUsers();
    echo json_encode($result);
}

function sendForm() {
    global $realtorapp;

    if ($_SERVER["REQUEST_METHOD"] === "POST") {
        $name = trim($_POST["name"]);
        $email = filter_var($_POST["email"], FILTER_VALIDATE_EMAIL);
        $phone = trim($_POST["phone"]);
        $comments = trim($_POST["comments"]);
        $appointment = trim($_POST["appointment"]);

        $result = $realtorapp->sendForm($name, $email, $phone, $appointment, $comments);
        echo $result;
    }
}

function updateCoordinates() {
    global $realtorapp;

    if (isset($_POST['id'], $_POST['latitude'], $_POST['longitude'])) {
        $result = $realtorapp->updateCoordinates($_POST['id'], $_POST['latitude'], $_POST['longitude']);
        echo json_encode($result);
    } else {
        echo json_encode(["success" => false, "error" => "Missing data"]);
    }
}

function updateUserRole() {
    global $realtorapp;

    header("Content-Type: application/json; charset=utf-8");
    ini_set('display_errors', 0);

    $realtorapp->verifyLogin();
    $realtorapp->verifyAdmin();

    $input = json_decode(file_get_contents("php://input"), true) ?? [];
    $id    = (int)($input["id"] ?? 0);
    $role  = (string)($input["role"] ?? "");

    echo json_encode($realtorapp->updateUserRole($id, $role));
    exit;
}
?>
