window.realtorapp = window.realtorapp || {};
window.realtorapp.api = (function () {
    const previewContentUrl = "../../backend/php/list_properties.php";
    const numberOfHouses = 8;
    const openCageKeyUrl = "../../backend/php/get_open_cage_key.php";

    function getPreviewContent(currentPage) {
        const startingPoint = (currentPage - 1) * numberOfHouses;
        return $.ajax({
            url: previewContentUrl,
            method: "GET",
            data: { numberOfHouses, startingPoint },
            dataType: "json"
        });
    }

    function getOpenCageLeafletKey() {
        return $.ajax({
            url: openCageKeyUrl,
            method: "GET",
            dataType: "text"
        });
    }

    return { numberOfHouses, getPreviewContent, getOpenCageLeafletKey };
})();