<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);

require_once __DIR__ . "/main.php";
$realtorapp->verifyLogin();
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <link rel="stylesheet" href="../../css/jquery.fancybox.min.css">
    <link rel="stylesheet" href="../../css/vendor/bootstrap-v5.3.8/bootstrap.min.css">
    <link rel="stylesheet" href="../../css/vendor/bootstrap-icons-v1.13.1/bootstrap-icons.css">

    <link rel="stylesheet" href="../css/manage_property.css">
    <!-- Phones: up to 768px -->
    <link rel="stylesheet" href="../css/manage_property_mobil.css" media="only screen and (max-width: 768px)">
    <!-- Tablets: 768px–991.98px -->
    <link rel="stylesheet" href="../css/manage_property_tablet.css"
        media="only screen and (min-width: 768px) and (max-width: 991.98px)">
    <!-- Desktops: 992px and up -->
    <link rel="stylesheet" href="../css/manage_property_desktop.css" media="only screen and (min-width: 992px)">

    <link rel="stylesheet" href="../../css/leaflet.css">
    <link href="../../css/filepond.min.css" rel="stylesheet">
    <link href="../../css/filepond-plugin-image-preview.min.css" rel="stylesheet">

    <link rel="apple-touch-icon" sizes="180x180" href="/wordpress/realtorapp/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="/wordpress/realtorapp/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="/wordpress/realtorapp/favicon-16x16.png">
    <link rel="manifest" href="/wordpress/realtorapp/site.webmanifest">


    <script src="../../js/jquery-3.7.1.js"></script>
    <script src="../../js/jquery.fancybox.min.js"></script>
    <script src="../../js/leaflet.js"></script>
    <script src="../js/manage_property.js"></script>
    <script src="../../js/filepond.min.js"></script>
    <script src="../../js/filepond-plugin-image-preview.min.js"></script>
    <script src="../../js/filepond-plugin-file-validate-size.js"></script>

    <title>Property view</title>
</head>

<body>
    <nav>
        <a href="manage_properties.php" class="btn btn-secondary" id="back-button"> back to preview</a>
    </nav>
    <div class="page-container">
        <main id="mainSection">
            <div id="popUpContainer">
                <form id="editForm" action="">
                    <div id="gallery">
                        <input type="file" class="filepond" multiple>
                    </div>
                    <div id="property">
                        <div id="info">
                            <div id="houseMainInfo">
                                <span class="highlight">*</span>
                                <h1>$</h1>
                                <input id="price" class="inputValue inputNumber" name="price" type="number" step="0.01"
                                    min="0" max="9999999999.99" data-previous_content="" required>
                                <select id="property_state" name="property_state" class="select" required>
                                    <option value="0">For Rent</option>
                                    <option value="1">For Sale</option>
                                    <option value="2">Sale Pending</option>
                                    <option value="3">Sold</option>
                                    <option value="4">Off Market</option>
                                </select>
                            </div>
                            <div id="houseArea">
                                <div id="number-of-rooms-section" class="houseAreaSections">
                                    <label for="number_of_rooms" class="label">Number of rooms:<span
                                            class="highlight">*</span></label>
                                    <input id="number_of_rooms" class="inputValue" type="number" step="1" min="0"
                                        max="9999999999.99" data-previous_content="" required>
                                </div>
                            </div>
                            <div id="number-of-bathrooms-section" class="houseAreaSections">
                                <label for="number_of_bathrooms" class="label">Number of
                                    bathrooms:<span class="highlight">*</span></label>
                                <input id="number_of_bathrooms" class="inputValue" type="number" step="0.5" min="0"
                                    max="9999999999.99" data-previous_content="" required>
                            </div>
                            <div id="area-sqft-section" class="houseAreaSections">
                                <label for="area_sqft" class="label">Building area (sqft)<span
                                        class="highlight">*</span></label>
                                <div id="buildingAreaContainer">
                                    <input id="area_sqft" class="inputValue" type="number" step="1" min="0"
                                        max="9999999999.99" data-previous_content="" required>
                                    <div class="sqft_messurement_unit">sqft</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div id="houseAddress">
                        <div class="address-item">
                            <label for="address_street" class="label">Street address:<span class="highlight">*</span>
                            </label>
                            <input id="address_street" data-previous_content="" type="text" required>
                        </div>
                        <div class="address-item">
                            <label for="address_apartment" class="label">Apartment: </label>
                            <input id="address_apartment" data-previous_content="" type="text">
                        </div>
                        <div class="address-item">
                            <label for="address_city" class="label">City:<span class="highlight">*</span> </label>
                            <input id="address_city" data-previous_content="" type="text" required>
                        </div>
                        <div class="address-item">
                            <label for="address_state" class="label">State:<span class="highlight">*</span> </label>
                            <input id="address_state" data-previous_content="" type="text" required>
                        </div>
                        <div class="address-item">
                            <label for="address_zip" class="label">ZIP:<span class="highlight">*</span> </label>
                            <input id="address_zip" class="inputValue" data-previous_content="" type="number" step="1"
                                min="0" max="9999999999.99" required>
                        </div>
                    </div>
                    <div id="descriptionContainer">
                        <div id="description_label" class="label">Description:<span class="highlight">*</span> </div>
                        <textarea id="description" data-previous_content="" required></textarea>
                    </div>
                    <div id="webData">
                        <div id="enrollment_dateContent">
                            <label for="enrollment_date" class="webDatalabel">Listed since: </label>
                            <div id="enrollment_date"></div>
                        </div>
                        <div id="viewsContent">
                            <label for="views_count" class="webDatalabel">Views: </label>
                            <div id="views_count"></div>
                        </div>
                    </div>
                    <div id="mapContainer">
                        <div id="map"></div>
                    </div>
                    <div id="features">
                        <div class="two-column-container">
                            <div class="column" id="interior">
                                <div class="field-row">
                                    <label for="heating_type" class="label">Heating type:</label>
                                    <input id="heating_type" data-previous_content="" type="text">
                                </div>
                                <div class="field-row">
                                    <label for="cooling_type" class="label">Cooling type:</label>
                                    <input id="cooling_type" data-previous_content="" type="text">
                                </div>
                                <div class="field-row">
                                    <label for="appliances" class="label">Appliances:</label>
                                    <input id="appliances" data-previous_content="" type="text">
                                </div>
                                <div class="field-row">
                                    <label for="flooring_type" class="label">Flooring type:</label>
                                    <input id="flooring_type" data-previous_content="" type="text">
                                </div>
                                <div class="field-row">
                                    <div class="radioContainer">
                                        <input type="radio" id="basementTrue" name="basement" value="1">
                                        <label for="basementTrue" class="radioLabel">Has basement</label>
                                    </div>
                                    <div class="radioContainer">
                                        <input type="radio" id="basementFalse" name="basement" value="0">
                                        <label for="basementFalse" class="radioLabel">Does not have basement</label>
                                    </div>
                                </div>
                                <div class="field-row">
                                    <div class="radioContainer">
                                        <input type="radio" id="fireplaceTrue" name="fireplace" value="1">
                                        <label for="fireplaceTrue" class="radioLabel">Has fireplace</label>
                                    </div>
                                    <div class="radioContainer">
                                        <input type="radio" id="fireplaceFalse" name="fireplace" value="0">
                                        <label for="fireplaceFalse" class="radioLabel">Does not have fireplace</label>
                                    </div>
                                </div>
                            </div>
                            <div class="column" id="propertyFacts">
                                <div class="field-row">
                                    <label for="levels" class="label">Number of levels:<span
                                            class="highlight">*</span></label>
                                    <input id="levels" class="inputValue" type="number" step="1" min="0"
                                        max="9999999999.99" data-previous_content="" required>
                                </div>
                                <div class="field-row">
                                    <label for="parcel_number" class="label">Parcel number:<span
                                            class="highlight">*</span></label>
                                    <input id="parcel_number" data-previous_content="" type="text" required>
                                </div>
                                <div class="field-row">
                                    <label for="special_conditions" class="label">Special conditions:</label>
                                    <input id="special_conditions" data-previous_content="" type="text">
                                </div>
                                <div class="field-row">
                                    <label for="size_lot" class="label">Lot size:<span
                                            class="highlight">*</span></label>
                                    <input id="size_lot" class="inputValue" type="number" step="0.01" min="0"
                                        max="9999999999.99" data-previous_content="" required>
                                </div>
                                <div class="field-row">
                                    <label for="price_per_squarefeet" class="label">Price per sqft:</label>
                                    <input id="price_per_squarefeet" class="inputValue" type="number" step="0.01"
                                        min="0" max="9999999999.99" data-previous_content="">
                                </div>
                            </div>
                        </div>
                        <div class="two-column-container">
                            <div class="column" id="construction">
                                <div class="field-row">
                                    <label for="built_in_year" class="label">Built in year:<span
                                            class="highlight">*</span></label>
                                    <input id="built_in_year" class="inputValue" type="number" step="1" min="1901"
                                        max="2155" data-previous_content="" required>
                                </div>
                                <div class="field-row">
                                    <label for="home_type" class="label">Home type:<span
                                            class="highlight">*</span></label>
                                    <input id="home_type" data-previous_content="" type="text" required>
                                </div>
                                <div class="field-row">
                                    <label for="materials" class="label">Materials:</label>
                                    <input id="materials" data-previous_content="" type="text">
                                </div>
                            </div>
                            <div class="column" id="utilities">
                                <div class="field-row">
                                    <label for="sewer_type" class="label">Sewer type:</label>
                                    <input id="sewer_type" data-previous_content="" type="text">
                                </div>
                                <div class="field-row">
                                    <label for="water_type" class="label">Water type:</label>
                                    <input id="water_type" data-previous_content="" type="text">
                                </div>
                            </div>
                        </div>
                        <div class="two-column-container">
                            <div class="column" id="communityHoa">
                                <div class="field-row">
                                    <label for="hoa_cost" class="label">HOA cost:</label>
                                    <input id="hoa_cost" class="inputValue" type="number" step="0.01" min="0"
                                        max="9999999999.99" data-previous_content="">
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
            <div class="saveButtonContainer">
                <button type="button" id="save">Save</button>
            </div>
        </main>
    </div>
    <div id="notification-wrapper">
        <div id="notification" class="alert d-none" role="alert"></div>
    </div>
</body>

</html>
