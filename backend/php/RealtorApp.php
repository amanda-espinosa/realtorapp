/*
 * RealtorApp
 * Copyright (C) 2026 Amanda Espinosa Ramos
 *
 * This file is part of RealtorApp.
 *
 * RealtorApp is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, version 3 of the License.
 *
 * RealtorApp is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with RealtorApp. If not, see <https://www.gnu.org/licenses/>.
 */

<?php
error_reporting(E_ALL);
ini_set("display_errors", 1);
ini_set("display_startup_errors", 1);

require __DIR__ . "/vendor/autoload.php";

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\OAuth;
use PHPMailer\PHPMailer\Exception;
use League\OAuth2\Client\Provider\Google;

class RealtorApp
{
    private array $settings;
    private $connection;

    public function __construct($settingsPath)
    {
        $this->settings = json_decode(file_get_contents($settingsPath), true);
    }

    private function connectDatabase()
    {
        $this->connection = new mysqli(
            $this->settings["host"],
            $this->settings["user"],
            $this->settings["password"],
            $this->settings["database"],
        );

        if ($this->connection->connect_errno) {
            printf("Connect failed: %s", $this->connection->connect_error);
            exit();
        }
    }

    private function getPdoInstance()
    {
        $dbConfig = "mysql:host={$this->settings["host"]};dbname={$this->settings["database"]};charset=utf8mb4";

        try {
            $pdo = new PDO(
                $dbConfig,
                $this->settings["user"],
                $this->settings["password"],
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                ],
            );
        } catch (PDOException $error) {
            die("PDO connection failed: " . $error->getMessage());
        }
        return $pdo;
    }

    private function deleteDirectory(string $directory)
    {
        if (!is_dir($directory)) {
            return;
        }

        foreach (scandir($directory) as $file) {
            if ($file === "." || $file === "..") {
                continue;
            }

            $path = $directory . DIRECTORY_SEPARATOR . $file;

            if (is_dir($path)) {
                $this->deleteDirectory($path);
            } else {
                unlink($path);
            }
        }

        rmdir($directory);
    }

    public function createProperty($propertyJson, $images)
    {
        if (!isset($_POST["property"])) {
            return ["success" => false, "error" => "Missing property data"];
        }

        $property = json_decode($propertyJson, true);
        if ($property === null) {
            return ["success" => false, "error" => "Invalid JSON"];
        }

        $MySQLNumericTypes = [
            "float",
            "decimal",
            "double",
            "int",
            "tinyint",
            "smallint",
            "mediumint",
            "bigint",
        ];

        $this->connectDatabase();

        $propertyDefinition = [];
        $database = $this->settings["database"];

        ($result = mysqli_query(
            $this->connection,
            "
            SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, NUMERIC_PRECISION, NUMERIC_SCALE
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = '$database'
            AND TABLE_NAME = 'properties_list'
        ",
        )) or die(json_encode(["error" => mysqli_error($this->connection)]));

        while ($dataArray = mysqli_fetch_array($result)) {
            $propertyDefinition[] = [
                "COLUMN_NAME" => $dataArray["COLUMN_NAME"],
                "DATA_TYPE" => $dataArray["DATA_TYPE"],
                "CHARACTER_MAXIMUM_LENGTH" =>
                    $dataArray["CHARACTER_MAXIMUM_LENGTH"],
                "NUMERIC_PRECISION" => $dataArray["NUMERIC_PRECISION"],
                "NUMERIC_SCALE" => $dataArray["NUMERIC_SCALE"],
            ];
        }

        unset($property["id"]);

        $columns = [];
        $values = [];

        foreach ($property as $column => $value) {
            $definitionSearch = array_filter($propertyDefinition, function (
                $item,
            ) use ($column) {
                return $item["COLUMN_NAME"] === $column;
            });

            if (!empty($definitionSearch)) {
                $definition = array_values($definitionSearch)[0];
                $type = $definition["DATA_TYPE"];

                if (in_array($type, $MySQLNumericTypes)) {
                    if ($value === "" || $value === null) {
                        $columns[] = $column;
                        $values[] = "NULL";
                    } elseif (is_numeric($value)) {
                        $columns[] = $column;
                        $values[] = $value;
                    } else {
                        continue;
                    }
                } else {
                    if ($value === null || $value === "") {
                        $columns[] = $column;
                        $values[] = "NULL";
                    } else {
                        $escapedValue = mysqli_real_escape_string(
                            $this->connection,
                            $value,
                        );
                        $columns[] = $column;
                        $values[] = "'$escapedValue'";
                    }
                }
            }
        }

        if (empty($columns)) {
            return ["success" => false, "error" => "No data to insert"];
        }

        $columnsClause = implode(", ", $columns);
        $valuesClause = implode(", ", $values);

        $sql = "INSERT INTO properties_list ($columnsClause) VALUES ($valuesClause)";

        if (mysqli_query($this->connection, $sql)) {
            $insertId = mysqli_insert_id($this->connection);

            $imagesFolder = __DIR__ . "/../img/$insertId/";
            $thumbnailFolder = __DIR__ . "/../houseThumbnail/$insertId/";

            $maxImages = 50;
            $maxTotalSize = 100 * 1024 * 1024; // 100 MB

            $totalImages = isset($images["name"]) ? count($images["name"]) : 0;

            if ($totalImages > $maxImages) {
                return [
                    "success" => false,
                    "error" => "You can upload a maximum of 50 images",
                ];
            }

            $totalSize = 0;

            foreach ($images["size"] as $size) {
                $totalSize += $size;
            }

            if ($totalSize > $maxTotalSize) {
                return [
                    "success" => false,
                    "error" =>
                        "The total size of all images cannot exceed 100 MB",
                ];
            }

            if (!is_dir($imagesFolder)) {
                mkdir($imagesFolder, 0777, true);
            }

            if ($totalImages > 0) {
                foreach ($images["tmp_name"] as $index => $tmpName) {
                    if ($images["error"][$index] !== UPLOAD_ERR_OK) {
                        continue;
                    }

                    $originalName = $images["name"][$index];
                    $extension = strtolower(
                        pathinfo($originalName, PATHINFO_EXTENSION),
                    );

                    $allowed = ["jpg", "jpeg", "png", "webp"];

                    if (!in_array($extension, $allowed)) {
                        continue;
                    }

                    $newName = uniqid("property_", true) . "." . $extension;
                    $destination = $imagesFolder . $newName;

                    move_uploaded_file($tmpName, $destination);

                    if ($index === 0) {
                        if (!is_dir($thumbnailFolder)) {
                            mkdir($thumbnailFolder, 0777, true);
                        }

                        copy($destination, $thumbnailFolder . "thumbnail.jpg");
                    }
                }
            }

            $this->connection->close();

            return [
                "success" => true,
                "message" => "Property inserted successfully",
                "inserted_id" => $insertId,
            ];
        } else {
            $error = mysqli_error($this->connection);
            $this->connection->close();

            return [
                "success" => false,
                "error" => $error,
            ];
        }
    }

    public function createUser($email, $password, $username, $role)
    {
        try {
            $pdo = $this->getPdoInstance();
            $auth = new \Delight\Auth\Auth($pdo);

            $userId = $auth->register($email, $password, $username);

            $roleMap = [
                "ADMIN" => \Delight\Auth\Role::ADMIN,
                "MAINTAINER" => \Delight\Auth\Role::MAINTAINER,
            ];

            if (!isset($roleMap[$role])) {
                return ["success" => false, "error" => "Invalid role"];
            }

            $auth->admin()->addRoleForUserById((int) $userId, $roleMap[$role]);

            return ["success" => true, "user_id" => (int) $userId];
        } catch (\Delight\Auth\InvalidEmailException $e) {
            return ["success" => false, "error" => "Invalid email"];
        } catch (\Delight\Auth\InvalidPasswordException $e) {
            return ["success" => false, "error" => "Invalid password"];
        } catch (\Delight\Auth\UserAlreadyExistsException $e) {
            return ["success" => false, "error" => "User already exists"];
        } catch (\Throwable $e) {
            return ["success" => false, "error" => $e->getMessage()];
        }
    }

    public function deleteProperty($id)
    {
        $this->connectDatabase();

        header("Content-Type: application/json");
        // TODO verify id can be converted to int
        $propertyId = (int) $id;

        $statement = $this->connection->prepare(
            "DELETE FROM properties_list WHERE id = ?",
        );

        if (!$statement) {
            return [
                "success" => false,
                "error" => $this->connection->error,
            ];
        }

        $statement->bind_param("i", $propertyId);

        if (!$statement->execute()) {
            $error = $statement->error;
            $statement->close();
            $this->connection->close();
            return [
                "success" => false,
                "error" => $error,
            ];
        }

        $statement->close();
        $this->connection->close();

        $imagesDir = __DIR__ . "/../img/$propertyId";
        $this->deleteDirectory($imagesDir);

        $thumbnailDir = __DIR__ . "/../houseThumbnail/$propertyId";
        $this->deleteDirectory($thumbnailDir);

        return [
            "success" => true,
        ];
    }

    public function deleteUserById($userId)
    {
        try {
            $pdo = $this->getPdoInstance();
            $auth = new \Delight\Auth\Auth($pdo);

            $auth->admin()->deleteUserById($userId);

            return ["success" => true];
        } catch (\Throwable $e) {
            return ["success" => false, "error" => $e->getMessage()];
        }
    }

    public function editProperty($propertyJson, $images)
    {
        $MySQLDataType = ["float", "decimal", "double"];
        $this->connectDatabase();

        $property = json_decode($propertyJson, true);

        if (!$property && !isset($property["id"])) {
            return ["success" => false, "error" => "Invalid or missing ID"];
            exit();
        }

        $propertyDefinition = [];
        $database = $this->settings["database"];

        ($result = mysqli_query(
            $this->connection,
            "
            SELECT
            COLUMN_NAME,
            DATA_TYPE,
            CHARACTER_MAXIMUM_LENGTH,
            NUMERIC_PRECISION,
            NUMERIC_SCALE
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = '$database'
            AND TABLE_NAME = 'properties_list'
        ",
        )) or die(json_encode(["error" => mysqli_error($this->connection)]));

        while ($dataArray = mysqli_fetch_array($result)) {
            $propertyDefinition[] = [
                "COLUMN_NAME" => $dataArray["COLUMN_NAME"],
                "DATA_TYPE" => $dataArray["DATA_TYPE"],
                "CHARACTER_MAXIMUM_LENGTH" =>
                    $dataArray["CHARACTER_MAXIMUM_LENGTH"],
                "NUMERIC_PRECISION" => $dataArray["NUMERIC_PRECISION"],
                "NUMERIC_SCALE" => $dataArray["NUMERIC_SCALE"],
            ];
        }

        $id = (int) $property["id"];
        unset($property["id"]);

        $setParts = [];
        foreach ($property as $column => $value) {
            $definitionSearch = array_filter($propertyDefinition, function (
                $item,
            ) use ($column) {
                return $item["COLUMN_NAME"] === $column;
            });

            if (!empty($definitionSearch)) {
                $definition = array_values($definitionSearch)[0]; // first matching element
                if (
                    in_array($definition["DATA_TYPE"], $MySQLDataType) &&
                    !is_numeric($value)
                ) {
                    continue;
                }

                $value =
                    $value === null
                        ? $value
                        : mysqli_real_escape_string($this->connection, $value);
                $setParts[] = "`$column` = '$value'";
            }
        }

        if (empty($setParts)) {
            return ["success" => false, "error" => "No data to update"];
            exit();
        }

        $setClause = implode(", ", $setParts);
        $sql = "UPDATE properties_list SET $setClause WHERE id = $id";

        if (mysqli_query($this->connection, $sql)) {
            $this->connection->close();

            $imagesFolder = __DIR__ . "/../img/$id/";
            $thumbnailFolder = __DIR__ . "/../houseThumbnail/$id/";

            $maxImages = 50;
            $maxTotalSize = 100 * 1024 * 1024; // 100 MB

            $totalImages = isset($images["name"]) ? count($images["name"]) : 0;

            if ($totalImages > $maxImages) {
                return [
                    "success" => false,
                    "error" => "You can upload a maximum of 50 images",
                ];
            }

            $totalSize = 0;

            foreach ($images["size"] as $size) {
                $totalSize += $size;
            }

            if ($totalSize > $maxTotalSize) {
                return [
                    "success" => false,
                    "error" =>
                        "The total size of all images cannot exceed 100 MB",
                ];
            }

            // Remove old images ONLY after validation passes
            $oldImages = glob($imagesFolder . "*");
            foreach ($oldImages as $file) {
                if (is_file($file)) {
                    unlink($file);
                }
            }

            $oldThumbnail = glob($thumbnailFolder . "*");
            foreach ($oldThumbnail as $file) {
                if (is_file($file)) {
                    unlink($file);
                }
            }

            if ($totalImages > 0) {
                foreach ($images["tmp_name"] as $index => $tmpName) {
                    if ($images["error"][$index] !== UPLOAD_ERR_OK) {
                        continue;
                    }

                    $originalName = $images["name"][$index];
                    $extension = strtolower(
                        pathinfo($originalName, PATHINFO_EXTENSION),
                    );

                    $allowed = ["jpg", "jpeg", "png", "webp"];

                    if (!in_array($extension, $allowed)) {
                        continue;
                    }

                    $newName = uniqid("property_", true) . "." . $extension;
                    $destination = $imagesFolder . $newName;

                    move_uploaded_file($tmpName, $destination);

                    if ($index === 0) {
                        copy($destination, $thumbnailFolder . "thumbnail.jpg");
                    }
                }
            }

            return [
                "success" => true,
                "message" => "Property updated successfully",
                "query" => $sql,
            ];
        } else {
            $this->connection->close();
            return [
                "success" => false,
                "error" => mysqli_error($this->connection),
            ];
        }
    }

    public function getLoggedUsername()
    {
        $pdo = $this->getPdoInstance();

        $auth = new \Delight\Auth\Auth($pdo);
        return $auth->getUsername() ?? "";
    }

    public function getOpenCageKey()
    {
        if (!isset($this->settings["openCageLeafletApiKey"])) {
            return "";
        }

        return $this->settings["openCageLeafletApiKey"];
    }

    public function getPropertyImages($propertyId)
    {
        header("Content-Type: application/json");

        $directoryPath = __DIR__ . "/../img/$propertyId";
        $baseUrl = "../../backend/img/$propertyId";
        $images = [];

        if (is_dir($directoryPath)) {
            $files = scandir($directoryPath);
            foreach ($files as $file) {
                if ($file !== "." && $file !== "..") {
                    $images[] = "$baseUrl/$file";
                }
            }
        }
        return $images;
    }

    public function getPropertyList($numberOfHouses, $startingPoint)
    {
        header("Access-Control-Allow-Origin: *");
        header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
        header("Access-Control-Allow-Headers: Content-Type");
        header("Content-Type: application/json");

        $this->connectDatabase();

        $houses = [];
        $columnNames = [];
        $database = $this->settings["database"];

        ($columnNameResult = mysqli_query(
            $this->connection,
            "
            SELECT COLUMN_NAME
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = '$database'
            AND TABLE_NAME = 'properties_list'
        ",
        )) or die(json_encode(["error" => mysqli_error($this->connection)]));

        while ($dataArray = mysqli_fetch_array($columnNameResult)) {
            $columnNames[] = $dataArray["COLUMN_NAME"];
        }

        ($countRows = mysqli_query(
            $this->connection,
            "SELECT COUNT(*) AS total FROM properties_list",
        )) or die(json_encode(["error" => mysqli_error($this->connection)]));
        $totalRows = (int) mysqli_fetch_assoc($countRows)["total"];

        $query = "SELECT * FROM properties_list LIMIT $numberOfHouses OFFSET $startingPoint";
        ($dataSelection = mysqli_query($this->connection, $query)) or
            die(json_encode(["error" => mysqli_error($this->connection)]));

        while ($dataArray = mysqli_fetch_assoc($dataSelection)) {
            $house = [];
            foreach ($columnNames as $columnName) {
                $house[$columnName] = $dataArray[$columnName];
            }
            $houses[] = $house;
        }

        mysqli_close($this->connection);

        return [
            "totalRows" => $totalRows,
            "houses" => $houses,
        ];
    }

    public function incrementViews($id)
    {
        $this->connectDatabase();

        if ($this->connection->connect_error) {
            http_response_code(500);
            echo json_encode(["error" => "Database connection failed"]);
            exit();
        }

        if (!isset($_POST["id"])) {
            http_response_code(400);
            echo json_encode(["error" => "Missing property ID"]);
            exit();
        }

        $id = intval($_POST["id"]);
        $stmt = $this->connection->prepare(
            "UPDATE properties_list SET views_count = views_count + 1 WHERE id = ?",
        );
        $stmt->bind_param("i", $id);

        if ($stmt->execute()) {
            $stmt->close();
            return ["success" => true];
        } else {
            $stmt->close();
            return ["success" => false, "error" => $this->connection->error];
        }
    }

    public function isAdmin()
    {
        $pdo = $this->getPdoInstance();

        $auth = new \Delight\Auth\Auth($pdo);

        return $auth->hasAnyRole(\Delight\Auth\Role::ADMIN);
    }

    public function login($email, $password, $remember = false)
    {
        $pdo = $this->getPdoInstance();

        $auth = new \Delight\Auth\Auth($pdo);

        $rememberDuration = $remember ? 60 * 60 * 24 * 30 : null;

        try {
               $auth->login($email, $password, $rememberDuration);
       
               return [
                   "success" => true,
                   "message" => "Login successful",
               ];
       
           } catch (\Delight\Auth\InvalidEmailException $e) {
       
               return [
                   "success" => false,
                   "error" => "invalid",
               ];
       
           } catch (\Delight\Auth\InvalidPasswordException $e) {
       
               return [
                   "success" => false,
                   "error" => "invalid",
               ];
       
           } catch (\Delight\Auth\EmailNotVerifiedException $e) {
       
               return [
                   "success" => false,
                   "error" => "not-verified",
               ];
       
           } catch (\Delight\Auth\TooManyRequestsException $e) {
       
               return [
                   "success" => false,
                   "error" => "too-many-attempts",
               ];
           }
    }

    public function logout()
    {
        $pdo = $this->getPdoInstance();

        $auth = new \Delight\Auth\Auth($pdo);

        try {
            $auth->logOut();
            $auth->destroySession();

            return [
                "success" => true,
                "message" => "Logged out successfully",
            ];
        } catch (Exception $e) {
            return [
                "success" => false,
                "message" => $e->getMessage(),
            ];
        }
    }

    public function propertyDefinition()
    {
        $this->connectDatabase();
        $database = $this->settings["database"];
        $propertyDefinition[] = [];

        $sql = "SELECT
            COLUMN_NAME,
            DATA_TYPE,
            CHARACTER_MAXIMUM_LENGTH,
            NUMERIC_PRECISION,
            NUMERIC_SCALE
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'properties_list'";

        $stmt = $this->connection->prepare($sql);

        if (!$stmt) {
            $this->connection->close();
            return ["success" => false, "error" => $this->connection->error];
        }

        $stmt->bind_param("s", $database);

        if (!$stmt->execute()) {
            $err = $stmt->error;
            $stmt->close();
            $this->connection->close();
            return ["success" => false, "error" => $err];
        }

        $result = $stmt->get_result();

        while ($row = $result->fetch_assoc()) {
            $propertyDefinition[] = $row;
        }

        $stmt->close();
        $this->connection->close();

        return ["success" => true, "definition" => $propertyDefinition];
    }

    public function registerUser($email, $password, $username)
    {
        $pdo = $this->getPdoInstance();
        $auth = new \Delight\Auth\Auth($pdo);
        
        try {
            $userId = $auth->register(
                $email,
                $password,
                $username /*,
                function ($selector, $token) {
                    $registerToken = [
                        "selector" => $selector,
                        "token" => $token
                    ];
                }*/
            );
            
            $usersCount = $pdo->query("SELECT COUNT(*) FROM users")->fetchColumn();
            
            if ($usersCount == 1) {
                $auth->admin()->addRoleForUserById($userId,\Delight\Auth\Role::ADMIN);
            }
            
            return [
                "success" => true,
                "userId" => $userId /*,
                 "verification" => $registerToken ?? null */,
            ];
        } catch (\Delight\Auth\InvalidEmailException $e) {
            return ["success" => false, "message" => "Invalid email"];
        } catch (\Delight\Auth\InvalidPasswordException $e) {
            return ["success" => false, "message" => "Invalid password"];
        } catch (\Delight\Auth\UserAlreadyExistsException $e) {
            return ["success" => false, "message" => "User already exists"];
        } catch (\Delight\Auth\TooManyRequestsException $e) {
            return ["success" => false, "message" => "Too many requests"];
        } catch (\Exception $e) {
            return ["success" => false, "message" => $e->getMessage()];
        }
    }

    public function requestUsers()
    {
        $this->connectDatabase();
        $users = [];

        $query =
            "SELECT id, email, username, status, roles_mask, registered, last_login FROM users";
        $result = mysqli_query($this->connection, $query);

        if (!$result) {
            die(json_encode(["error" => mysqli_error($this->connection)]));
        }

        if ($result->num_rows > 0) {
            while ($dataArray = mysqli_fetch_assoc($result)) {
                $users[] = $dataArray;
            }
        }

        $this->connection->close();
        return [
            "users" => $users,
        ];
    }
    
    public function sendForm($name, $email, $phone, $appointment, $comments) {
        $name = trim($name);
        $email = trim($email);
        $phone = trim($phone);
        $appointment = trim($appointment);
        $comments = trim($comments);
    
        if ($name === "" || $email === "" || $comments === "") {
            return json_encode([
                "success" => false,
                "error" => "Please complete all required fields."
            ]);
        }
    
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return json_encode([
                "success" => false,
                "error" => "Please enter a valid email address."
            ]);
        }
    
        if (
            strlen($name) > 100 ||
            strlen($email) > 254 ||
            strlen($phone) > 50 ||
            strlen($appointment) > 100 ||
            strlen($comments) > 5000
        ) {
            return json_encode([
                "success" => false,
                "error" => "One or more fields are too long."
            ]);
        }
    
        $messageBody =
            "Name: {$name}\n" .
            "Email: {$email}\n" .
            "Phone: {$phone}\n" .
            "Appointment: {$appointment}\n\n" .
            "Comments:\n{$comments}";
    
        $mail = new PHPMailer(true);
    
        try {
            $mail->isSMTP();
            $mail->Host = $this->settings["SMTP"]["host"];
            $mail->Port = $this->settings["SMTP"]["port"];
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->SMTPAuth = true;
            $mail->AuthType = "XOAUTH2";
            $mail->Username = $this->settings["SMTP"]["username"];
            $mail->SMTPDebug = SMTP::DEBUG_OFF;
    
            $provider = new Google([
                "clientId" => $this->settings["SMTP"]["clientid"],
                "clientSecret" => $this->settings["SMTP"]["clientsecret"],
            ]);
    
            $mail->setOAuth(
                new OAuth([
                    "provider" => $provider,
                    "clientId" => $this->settings["SMTP"]["clientid"],
                    "clientSecret" => $this->settings["SMTP"]["clientsecret"],
                    "refreshToken" => $this->settings["SMTP"]["refreshtoken"],
                    "userName" => $this->settings["SMTP"]["username"],
                ])
            );
    
            $mail->setFrom(
                $this->settings["SMTP"]["username"]
            );
    
            $mail->addAddress(
                $this->settings["SMTP"]["username"]
            );
    
            $mail->addReplyTo($email, $name);
            $mail->CharSet = PHPMailer::CHARSET_UTF8;
            $mail->isHTML(false);
            $mail->Subject = "New message from RealtorApp";
            $mail->Body = $messageBody;
            $mail->send();
    
            return json_encode([
                "success" => true,
                "error" => ""
            ]);
    
        } catch (Exception $e) {
    
            error_log("PHPMailer error: " . $mail->ErrorInfo);
    
            return json_encode([
                "success" => false,
                "error" => "Message could not be sent. Please try again later."
            ]);
        }
    }
    
    public function updateCoordinates($id, $latitude, $longitude)
    {
        $this->connectDatabase();

        $id = intval($_POST["id"]);
        $latitude = floatval($_POST["latitude"]);
        $longitude = floatval($_POST["longitude"]);

        $updateStatement = $this->connection->prepare(
            "UPDATE properties_list SET latitude = ?, longitude = ? WHERE id = ?",
        );
        $updateStatement->bind_param("ddi", $latitude, $longitude, $id);

        if ($updateStatement->execute()) {
            $updateStatement->close();
            return ["success" => true];
        } else {
            $updateStatement->close();
            return ["success" => false, "error" => $this->connection->error];
        }
    }

    public function updateUserRole($userId, $role)
    {
        $roleMap = [
            "ADMIN" => \Delight\Auth\Role::ADMIN,
            "MAINTAINER" => \Delight\Auth\Role::MAINTAINER,
        ];

        if (!isset($roleMap[$role])) {
            return ["success" => false, "error" => "Invalid role"];
        }

        try {
            $pdo = $this->getPdoInstance();
            $auth = new \Delight\Auth\Auth($pdo);

            $auth
                ->admin()
                ->removeRoleForUserById($userId, \Delight\Auth\Role::ADMIN);
            $auth
                ->admin()
                ->removeRoleForUserById(
                    $userId,
                    \Delight\Auth\Role::MAINTAINER,
                );
            $auth->admin()->addRoleForUserById($userId, $roleMap[$role]);

            return ["success" => true];
        } catch (\Throwable $e) {
            return ["success" => false, "error" => $e->getMessage()];
        }
    }

    public function verifyAdmin()
    {
        $pdo = $this->getPdoInstance();

        $auth = new \Delight\Auth\Auth($pdo);

        if (!$auth->hasAnyRole(\Delight\Auth\Role::ADMIN)) {
            header("Location: management_homepage.php?error=admin_required");
            exit();
        }
    }

    public function verifyLogin()
    {
        $pdo = $this->getPdoInstance();

        $auth = new \Delight\Auth\Auth($pdo);

        if ($auth->isLoggedIn() == false) {
            header("Location: ../html/login.html");
            exit();
        }
    }
}
?>



