# RealtorApp

## 1. High-Level Description

**RealtorApp** is a web-based real estate application designed to manage and display property listings for sale and rent.

The application provides a public-facing interface where users can browse available properties, view detailed property information, explore property locations on an interactive map, and access property images and other relevant listing information.

It also includes an administrative interface that allows authorized users to manage the property inventory by adding, editing, and removing listings.

### Main Features

- Display properties available for sale or rent.
- View detailed information for individual properties.
- Display property locations using an interactive map.
- Manage property images and photo galleries.
- Track property listing status, such as **For Sale**, **For Rent**, **Sale Pending**, **Sold**, and **Off Market**.
- Allow visitors to contact the realtor regarding a property.
- Provide administrative tools for managing property listings.
- Provide user authentication for protected administrative functionality.
- Integrate the application into an existing website or WordPress environment.

### Technologies

The application is primarily built using:

- **HTML5**
- **CSS3**
- **JavaScript / jQuery**
- **PHP**
- **MariaDB / MySQL**
- **Apache**
- **Leaflet** for interactive maps
- **OpenCage Geocoding API** for address geocoding
- **Fancybox 3.5.7** for property image galleries

The application follows a traditional server-side web architecture in which PHP handles application logic and database communication, MariaDB/MySQL stores property and user information, and JavaScript provides interactive functionality on the client side.

---

## 2. Installation Guide

### 2.1 Download the Application

Download this repository as a ZIP file and extract it.

> **Important:** After extraction, make sure the application's root folder is named `realtorapp`. Rename the folder if necessary.

The application uses `/realtorapp/` in its internal paths.

### 2.2 Copy RealtorApp to the Website

Copy the complete `realtorapp` folder into the website's document root.

Example:

```bash
sudo cp -R realtorapp /path/to/website/
```

The resulting directory structure should begin as follows:

```text
/path/to/website/
└── realtorapp/
    ├── backend/
    ├── css/
    ├── frontend/
    ├── js/
    └── ...
```

The application should then be accessible at:

```text
https://yourdomain.com/realtorapp/
```

Set the appropriate ownership and permissions for the application files.

For example, on an Apache installation using the `www-data` user:

```bash
sudo chown -R www-data:www-data realtorapp/
```

### 2.3 Create the Database

Create a MySQL or MariaDB database named `realtorapp`.

```sql
CREATE DATABASE realtorapp
CHARACTER SET utf8mb4
COLLATE utf8mb4_general_ci;
```

Create a database user, or use an existing user that has full access to the `realtorapp` database.

Example:

```sql
CREATE USER 'realtorapp_user'@'localhost'
IDENTIFIED BY 'Your_Strong_Password_Here';

GRANT ALL PRIVILEGES ON realtorapp.* TO 'realtorapp_user'@'localhost';

FLUSH PRIVILEGES;
```

Replace `Your_Strong_Password_Here` with a secure password.

> Remote database access is not required for a standard local web-server installation. Only create remote database users when your deployment specifically requires them.

### 2.4 Import the Database Structure

The application includes the SQL file:

```text
realtorapp/backend/sql/realtorapp.sql
```

From the directory containing `realtorapp.sql`, import it using:

```bash
mysql -h localhost -u realtorapp_user -p realtorapp < realtorapp.sql
```

Enter the database user's password when prompted.

The SQL file creates the required database structure and application tables.

After importing it, verify that all required tables were created successfully.

### 2.5 Configure the Geolocation API

RealtorApp uses the **OpenCage Geocoding API** for address geolocation.

Create an account at:

```text
https://opencagedata.com/
```

During registration:

1. Select **Forward geocoding** as the primary use case.
2. Select **JavaScript** as the programming language.
3. Confirm your email address.
4. Obtain your OpenCage API key.

The API key will be added to `RealtorAppSettings.json`.

### 2.6 Configure SMTP and OAuth 2.0

RealtorApp supports **OAuth 2.0** for sending email through third-party services.

Currently, the application supports **Gmail**.

Create and configure a Google Cloud project to obtain the OAuth credentials required by the application.

RealtorApp includes:

```text
get_oauth_token.php
```

to assist with generating the required OAuth refresh token.

When configuring the Google Cloud project, add the URL of `get_oauth_token.php` to the project's **Authorized redirect URIs**.

Example:

```text
https://yourdomain.com/realtorapp/backend/php/vendor/phpmailer/phpmailer/get_oauth_token.php
```

The URL must be publicly accessible from the Internet.

You will need to obtain:

- OAuth Client ID
- OAuth Client Secret

> **Important:** Store the client secret securely when it is generated.

Google Cloud configuration may change over time. Refer to the current Google documentation if additional assistance is required when creating or configuring the OAuth project.

#### Generate the Refresh Token

Open the following URL in a web browser:

```text
https://yourdomain.com/realtorapp/backend/php/vendor/phpmailer/phpmailer/get_oauth_token.php
```

Then:

1. Select **Google**.
2. Enter the OAuth Client ID.
3. Enter the OAuth Client Secret.
4. Click **Continue**.
5. Complete Google's authorization process.
6. Save the generated refresh token.

The refresh token will be added to `RealtorAppSettings.json`.

### 2.7 Configure `RealtorAppSettings.json`

For security, move `RealtorAppSettings.json` outside the publicly accessible `realtorapp` directory.

For example:

```text
/home/USERNAME/RealtorAppSettings.json
```

Open the file and configure the database, OpenCage, and SMTP/OAuth settings.

Example:

```json
{
    "host": "localhost",
    "user": "DATABASE_USER",
    "password": "DATABASE_PASSWORD",
    "database": "realtorapp",
    "openCageLeafletApiKey": "OPENCAGE_API_KEY",
    "SMTP": {
        "host": "SMTP_HOST",
        "port": "SMTP_PORT",
        "username": "SMTP_USERNAME",
        "password": "SMTP_PASSWORD",
        "clientid": "OAUTH_CLIENT_ID",
        "clientsecret": "OAUTH_CLIENT_SECRET",
        "refreshtoken": "OAUTH_REFRESH_TOKEN"
    }
}
```

Replace each placeholder with the appropriate value for your environment.

### 2.8 Configure the Settings File Path

Open:

```text
realtorapp/backend/php/config.php
```

Set `$settingsPath` to the absolute path of `RealtorAppSettings.json`.

Example:

```php
<?php

$settingsPath = "/home/USERNAME/RealtorAppSettings.json";
```

The path must match the actual location of the settings file on the server.

### 2.9 Create the First User

Open the registration page:

```text
https://yourdomain.com/realtorapp/backend/php/register_user.php
```

Create the initial user account.

### 2.10 Log In to the Management Area

Open:

```text
https://yourdomain.com/realtorapp/backend/html/login.html
```

Log in using the administrator account.

After a successful login, the application should open:

```text
https://yourdomain.com/realtorapp/backend/php/management_homepage.php
```

### 2.11 Add RealtorApp to an Existing Website

Open the page where the property listing interface should appear.

Add the following container:

```html
<div id="realtor-app-container"></div>
```

Then load the RealtorApp injector script:

```html
<script>
    let script = document.createElement("script");
    script.src = "realtorapp/frontend/js/app-injector.js";
    script.type = "text/javascript";
    document.head.appendChild(script);
</script>
```

This loads the RealtorApp frontend into the designated container.

### 2.12 Final Installation Test

After completing the installation, verify that the following functionality works correctly:

- Administrator login
- Property creation
- Property editing
- Property deletion
- Image uploads
- Property listing display
- Property details
- Leaflet interactive map
- OpenCage address lookup
- RealtorApp integration with the existing website

If all of these features work correctly, the installation is complete.

---

## 3. License

RealtorApp is licensed under the **GNU General Public License v3.0 (GPL-3.0-only)**.

You are free to use, copy, modify, and redistribute this software under the terms of the GNU General Public License version 3.

If you distribute a modified version of RealtorApp, the GPL-covered portions must remain licensed under the GNU GPL v3, and the corresponding source code must be made available in accordance with the terms of the license.

See the [`LICENSE`](LICENSE) file included with this repository for the complete license terms.

Copyright (C) 2026 Amanda Espinosa Ramos.

### Third-Party Software

RealtorApp uses third-party libraries and services that are distributed under their own licenses and terms, including:

- **fancyBox 3.5.7** — GNU GPL v3 for open-source use
- **jQuery** — MIT License
- **Leaflet 1.9.4** — BSD 2-Clause License
- **PHPMailer** — GNU Lesser General Public License (LGPL)
- **Delight Auth** — MIT License
- **OpenCage Geocoding API** — subject to the OpenCage service terms

Third-party components retain their original copyright notices and license terms.
