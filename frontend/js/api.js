window.realtorapp = window.realtorapp || {};
window.realtorapp.api = (function () {
    const previewContentUrl = "../../backend/php/list_properties.php";
    const numberOfHouses = 8;

    function getPreviewContent(currentPage) {
        const startingPoint = (currentPage - 1) * numberOfHouses;
        return $.ajax({
            url: previewContentUrl,
            method: "GET",
            data: { numberOfHouses, startingPoint },
            dataType: "json"
        });
    }

    return { numberOfHouses, getPreviewContent };
})();
