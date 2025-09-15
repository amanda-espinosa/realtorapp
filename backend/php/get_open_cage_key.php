<?php
require_once "config.php";

$config = json_decode(file_get_contents($settingsPath . 'RealtorAppSettings.json'), true);
echo $config['openCageLeafletApiKey'];
?>